import React, { useState, useEffect, useRef, useCallback } from 'react';
import { aiApi } from '../api';
import { Project, Task } from '../types';

interface Props {
  selectedProject?: Project | null;
  selectedTask?: Task | null;
}

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

const AiPanel: React.FC<Props> = ({ selectedProject, selectedTask }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [visibleSuggestions, setVisibleSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'chat'>('suggestions');
  const [error, setError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Animate suggestions appearing one by one instantly
  useEffect(() => {
    if (suggestions.length === 0) { setVisibleSuggestions([]); return; }
    setVisibleSuggestions([]);
    abortRef.current = false;
    suggestions.forEach((s, i) => {
      setTimeout(() => {
        if (!abortRef.current) {
          setVisibleSuggestions((prev) => [...prev, s]);
        }
      }, i * 180);
    });
    return () => { abortRef.current = true; };
  }, [suggestions]);

  const fetchSuggestions = useCallback(async (item: Project | Task, type: 'project' | 'task') => {
    setLoadingSuggestions(true);
    setSuggestions([]);
    setVisibleSuggestions([]);
    setError('');
    setActiveTab('suggestions');
    try {
      const res = await aiApi.suggest({
        title: item.title,
        description: item.description,
        type,
        status: item.status,
        dueDate: type === 'task' ? (item as Task).dueDate : undefined,
      });
      if (res.data.suggestions && res.data.suggestions.length > 0) {
        setSuggestions(res.data.suggestions);
      } else {
        setError('No suggestions returned. Try refreshing.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to get AI suggestions. Check your API key.');
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // Trigger instantly when project or task is selected
  useEffect(() => {
    if (selectedTask) {
      fetchSuggestions(selectedTask, 'task');
    } else if (selectedProject) {
      fetchSuggestions(selectedProject, 'project');
    }
  }, [selectedTask, selectedProject, fetchSuggestions]);

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);
    try {
      const context = selectedTask
        ? `Working on task: "${selectedTask.title}" (${selectedTask.status})`
        : selectedProject
        ? `Working on project: "${selectedProject.title}" (${selectedProject.status})`
        : undefined;
      const res = await aiApi.chat({ message: userMsg, context });
      setChatMessages((prev) => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: 'ai', text: 'Something went wrong. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const activeItem = selectedTask || selectedProject;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white text-lg">🤖</span>
          <h2 className="text-white font-semibold text-sm">AI Assistant</h2>
          {loadingSuggestions && (
            <span className="ml-auto flex items-center gap-1 text-white/80 text-xs">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              Thinking...
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex-1 text-xs py-1 rounded-md font-medium transition ${
              activeTab === 'suggestions' ? 'bg-white text-indigo-600' : 'text-white hover:bg-white/20'
            }`}
          >
            💡 Suggestions
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 text-xs py-1 rounded-md font-medium transition ${
              activeTab === 'chat' ? 'bg-white text-indigo-600' : 'text-white hover:bg-white/20'
            }`}
          >
            💬 Chat
          </button>
        </div>
      </div>

      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div className="flex-1 overflow-y-auto p-4">
          {activeItem ? (
            <>
              {/* Selected item info */}
              <div className="mb-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <p className="text-xs text-indigo-500 font-medium mb-0.5">
                  {selectedTask ? '📋 Task' : '📁 Project'}
                </p>
                <p className="text-sm font-semibold text-gray-800 truncate">{activeItem.title}</p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${
                  activeItem.status === 'done' || activeItem.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : activeItem.status === 'in-progress'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {activeItem.status}
                </span>
              </div>

              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">AI Suggestions</p>
                <button
                  onClick={() => fetchSuggestions(activeItem, selectedTask ? 'task' : 'project')}
                  disabled={loadingSuggestions}
                  className="text-xs text-indigo-500 hover:text-indigo-700 disabled:opacity-40 flex items-center gap-1"
                >
                  🔄 Refresh
                </button>
              </div>

              {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                  ⚠️ {error}
                </div>
              )}

              {loadingSuggestions ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 animate-pulse">
                      <div className="w-4 h-4 bg-gray-200 rounded shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                  <p className="text-center text-xs text-indigo-400 mt-2 animate-pulse">
                    🤖 Generating suggestions...
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {visibleSuggestions.map((s, i) => (
                    <div
                      key={i}
                      className="flex gap-2 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 animate-fadeIn"
                      style={{ animation: 'fadeSlideIn 0.3s ease forwards' }}
                    >
                      <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-700 leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="text-5xl mb-3">👆</div>
              <p className="text-sm font-semibold text-gray-600">Click any project or task</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                AI will instantly generate smart suggestions to help you complete it
              </p>
              <button
                onClick={() => setActiveTab('chat')}
                className="mt-5 text-xs bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Or start a chat →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-6">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-sm font-semibold text-gray-600">Ask me anything!</p>
                <p className="text-xs text-gray-400 mt-1">I can help you plan, prioritize, and complete your work</p>
                <div className="mt-4 space-y-2 w-full">
                  {[
                    'How do I prioritize my tasks?',
                    'Give me a project plan template',
                    'How to manage deadlines?',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => setChatInput(q)}
                      className="w-full text-left text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    {msg.role === 'ai' && (
                      <span className="text-xs font-semibold text-indigo-500 block mb-1">🤖 AI</span>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-xl rounded-bl-none">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t bg-gray-50 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                placeholder="Ask AI anything..."
                className="flex-1 text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              />
              <button
                onClick={sendChat}
                disabled={!chatInput.trim() || chatLoading}
                className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40 text-sm font-bold"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS animation */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AiPanel;

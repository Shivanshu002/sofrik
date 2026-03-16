import React, { useState, useEffect, useRef } from 'react';
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
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'chat'>('suggestions');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (selectedProject || selectedTask) {
      setActiveTab('suggestions');
      fetchSuggestions();
    }
  }, [selectedProject, selectedTask]);

  const fetchSuggestions = async () => {
    const item = selectedTask || selectedProject;
    if (!item) return;
    setLoadingSuggestions(true);
    setSuggestions([]);
    try {
      const res = await aiApi.suggest({
        title: item.title,
        description: item.description,
        type: selectedTask ? 'task' : 'project',
        status: item.status,
        dueDate: selectedTask ? (item as Task).dueDate : undefined,
      });
      setSuggestions(res.data.suggestions);
    } catch {
      setSuggestions(['Unable to load suggestions. Please try again.']);
    } finally {
      setLoadingSuggestions(false);
    }
  };

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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white text-lg">🤖</span>
          <h2 className="text-white font-semibold text-sm">AI Assistant</h2>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex-1 text-xs py-1 rounded-md font-medium transition ${
              activeTab === 'suggestions'
                ? 'bg-white text-indigo-600'
                : 'text-white hover:bg-white/20'
            }`}
          >
            💡 Suggestions
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 text-xs py-1 rounded-md font-medium transition ${
              activeTab === 'chat'
                ? 'bg-white text-indigo-600'
                : 'text-white hover:bg-white/20'
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
              <div className="mb-3 p-2 bg-indigo-50 rounded-lg">
                <p className="text-xs text-indigo-600 font-medium">
                  {selectedTask ? '📋 Task' : '📁 Project'}
                </p>
                <p className="text-sm font-semibold text-gray-800 truncate">{activeItem.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeItem.status === 'done' || activeItem.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : activeItem.status === 'in-progress'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {activeItem.status}
                </span>
              </div>

              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">AI Suggestions</p>
                <button
                  onClick={fetchSuggestions}
                  disabled={loadingSuggestions}
                  className="text-xs text-indigo-500 hover:text-indigo-700 disabled:opacity-40"
                >
                  🔄 Refresh
                </button>
              </div>

              {loadingSuggestions ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {suggestions.map((s, i) => (
                    <div key={i} className="flex gap-2 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                      <span className="text-indigo-500 font-bold text-sm shrink-0">{i + 1}.</span>
                      <p className="text-sm text-gray-700 leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="text-4xl mb-3">👆</div>
              <p className="text-sm font-medium text-gray-600">Click on a project or task</p>
              <p className="text-xs text-gray-400 mt-1">AI will show smart suggestions to help you complete it</p>
              <button
                onClick={() => setActiveTab('chat')}
                className="mt-4 text-xs bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
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
                <p className="text-sm font-medium text-gray-600">Ask me anything!</p>
                <p className="text-xs text-gray-400 mt-1">I can help you plan, prioritize, and complete your work</p>
                <div className="mt-4 space-y-2 w-full">
                  {['How do I prioritize my tasks?', 'Give me a project plan template', 'How to manage deadlines?'].map((q) => (
                    <button
                      key={q}
                      onClick={() => { setChatInput(q); }}
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
                    {msg.role === 'ai' && <span className="text-xs font-semibold text-indigo-500 block mb-1">🤖 AI</span>}
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-xl rounded-bl-none">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t bg-gray-50">
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
                className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40 text-sm"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiPanel;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getSuggestions, sendChatMessage as sendChatApi } from '../store/actions/aiActions';
import { Project, Task } from '../types';

interface Props {
  selectedProject?: Project | null;
  selectedTask?: Task | null;
}

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

// Render formatted AI text: **bold**, bullet lines, numbered lines
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n').filter((l) => l.trim() !== '');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        // Bold: **text**
        const parts = line.split(/\*\*(.*?)\*\*/g);
        const rendered = parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
        );
        // Bullet
        if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-indigo-400 shrink-0">•</span>
              <span>{rendered}</span>
            </div>
          );
        }
        // Numbered
        if (/^\d+\./.test(line.trim())) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-indigo-500 font-semibold shrink-0">{line.match(/^\d+\./)?.[0]}</span>
              <span>{parts.map((part, j) =>
                j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part.replace(/^\d+\.\s*/, '')}</span>
              )}</span>
            </div>
          );
        }
        return <p key={i}>{rendered}</p>;
      })}
    </div>
  );
};

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
  const lastFetchedRef = useRef<string>(''); // prevent duplicate calls

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Animate suggestions one by one
  useEffect(() => {
    if (suggestions.length === 0) { setVisibleSuggestions([]); return; }
    setVisibleSuggestions([]);
    abortRef.current = false;
    suggestions.forEach((s, i) => {
      setTimeout(() => {
        if (!abortRef.current) setVisibleSuggestions((prev) => [...prev, s]);
      }, i * 200);
    });
    return () => { abortRef.current = true; };
  }, [suggestions]);

  const fetchSuggestions = useCallback(async (item: Project | Task, type: 'project' | 'task') => {
    // Prevent duplicate calls for same item
    const key = `${type}-${item._id}`;
    if (lastFetchedRef.current === key) return;
    lastFetchedRef.current = key;

    setLoadingSuggestions(true);
    setSuggestions([]);
    setVisibleSuggestions([]);
    setError('');
    setActiveTab('suggestions');

    try {
      const res = await getSuggestions({
        title: item.title,
        description: item.description,
        type,
        status: item.status,
        dueDate: type === 'task' ? (item as Task).dueDate : undefined,
      });
      if (res.suggestions?.length > 0) {
        setSuggestions(res.suggestions);
      } else {
        setError('No suggestions returned. Try refreshing.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to get AI suggestions.';
      if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many')) {
        setError('Gemini API quota exceeded. Please create a new API key at aistudio.google.com/app/apikey');
      } else {
        setError(msg);
      }
      lastFetchedRef.current = ''; // allow retry
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // Trigger only when selected item actually changes
  useEffect(() => {
    if (selectedTask) {
      fetchSuggestions(selectedTask, 'task');
    } else if (selectedProject) {
      fetchSuggestions(selectedProject, 'project');
    } else {
      lastFetchedRef.current = '';
      setSuggestions([]);
      setVisibleSuggestions([]);
      setError('');
    }
  }, [selectedTask?._id, selectedProject?._id]); // only _id change triggers, not object reference

  // Click suggestion → send as chat question
  const handleSuggestionClick = (suggestion: string) => {
    setActiveTab('chat');
    sendChatMessage(`Tell me more about: "${suggestion}"`);
  };

  const sendChatMessage = async (message: string) => {
    if (!message.trim() || chatLoading) return;
    setChatMessages((prev) => [...prev, { role: 'user', text: message }]);
    setChatLoading(true);
    try {
      const context = selectedTask
        ? `Working on task: "${selectedTask.title}" (${selectedTask.status})`
        : selectedProject
        ? `Working on project: "${selectedProject.title}" (${selectedProject.status})`
        : undefined;
      const res = await sendChatApi({ message, context });
      setChatMessages((prev) => [...prev, { role: 'ai', text: res.reply }]);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong.';
      setChatMessages((prev) => [...prev, { role: 'ai', text: `⚠️ ${msg}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput('');
    sendChatMessage(msg);
  };

  const handleRefresh = () => {
    lastFetchedRef.current = '';
    const item = selectedTask || selectedProject;
    if (item) fetchSuggestions(item, selectedTask ? 'task' : 'project');
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
            💬 Chat {chatMessages.length > 0 && <span className="ml-1 bg-indigo-500 text-white rounded-full px-1.5 text-xs">{chatMessages.length}</span>}
          </button>
        </div>
      </div>

      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div className="flex-1 overflow-y-auto p-4">
          {activeItem ? (
            <>
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
                  onClick={handleRefresh}
                  disabled={loadingSuggestions}
                  className="text-xs text-indigo-500 hover:text-indigo-700 disabled:opacity-40"
                >
                  🔄 Refresh
                </button>
              </div>

              {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 leading-relaxed">
                  ⚠️ {error}
                </div>
              )}

              {loadingSuggestions ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-2 p-3 bg-gray-50 rounded-lg animate-pulse">
                      <div className="w-5 h-5 bg-gray-200 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                  <p className="text-center text-xs text-indigo-400 animate-pulse mt-1">🤖 Generating suggestions...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {visibleSuggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(s)}
                      className="w-full text-left flex gap-2 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 hover:border-indigo-400 hover:shadow-sm transition-all group"
                      style={{ animation: 'fadeSlideIn 0.3s ease forwards' }}
                      title="Click to ask AI about this"
                    >
                      <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-700 leading-relaxed flex-1">{s}</p>
                      <span className="text-indigo-300 group-hover:text-indigo-500 text-xs shrink-0 mt-0.5">💬</span>
                    </button>
                  ))}
                  {visibleSuggestions.length > 0 && (
                    <p className="text-center text-xs text-gray-400 mt-2">💡 Click any suggestion to ask AI more</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="text-5xl mb-3">👆</div>
              <p className="text-sm font-semibold text-gray-600">Click any project or task</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                AI will instantly generate smart suggestions
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
                <p className="text-xs text-gray-400 mt-1">Or click a suggestion to explore it further</p>
                <div className="mt-4 space-y-2 w-full">
                  {['How do I prioritize my tasks?', 'Give me a project plan template', 'How to manage deadlines?'].map((q) => (
                    <button
                      key={q}
                      onClick={() => sendChatMessage(q)}
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
                  <div className={`max-w-[90%] px-3 py-2.5 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    {msg.role === 'ai' && (
                      <span className="text-xs font-semibold text-indigo-500 block mb-1.5">🤖 AI</span>
                    )}
                    {msg.role === 'ai' ? <FormattedText text={msg.text} /> : msg.text}
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

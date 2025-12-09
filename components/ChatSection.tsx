import React, { useState, useEffect, useRef } from 'react';
import { Task, Message } from '../types';
import { Send, Bot, User, FileText, Sparkles, Loader2, StickyNote, PenLine } from 'lucide-react';
import { generateTaskSummaryOrAdvice } from '../services/geminiService';

interface ChatSectionProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Message[]) => void;
}

export const ChatSection: React.FC<ChatSectionProps> = ({ task, onUpdateTask }) => {
  const [inputValue, setInputValue] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [task.updates]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
      isUpdate: true
    };

    const updatedMessages = [...task.updates, newMessage];
    onUpdateTask(task.id, updatedMessages);
    setInputValue('');
  };

  const handleAskAI = async () => {
    setIsAiProcessing(true);
    
    // Use existing notes as context
    const contextText = task.updates.map(m => `[${m.timestamp.toISOString()}] ${m.text}`).join('\n');
    
    // If user typed something in the box, treat it as a specific prompt, otherwise ask for general advice
    const prompt = inputValue.trim() || "Review the current notes and suggest 3 actionable next steps.";
    
    const response = await generateTaskSummaryOrAdvice(task, prompt, contextText);

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: response,
      timestamp: new Date(),
      isUpdate: false
    };

    onUpdateTask(task.id, [...task.updates, aiMessage]);
    setInputValue(''); // Clear input if it was used as a prompt
    setIsAiProcessing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric' 
    }).format(new Date(date));
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/30 rounded-xl border border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <StickyNote size={18} className="text-amber-400" />
          Project Notes & AI Insights
        </h3>
        <div className="text-xs font-medium text-slate-500 px-2 py-1 bg-slate-800 rounded-md border border-slate-700">
          {task.updates.length} entries
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {task.updates.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
             <PenLine size={48} className="mb-4 text-slate-600" />
             <p className="text-sm font-medium">No notes yet.</p>
             <p className="text-xs mt-1">Add a quick update or ask AI for suggestions.</p>
          </div>
        ) : (
          task.updates.map((msg) => (
            <div key={msg.id} className="group relative pl-4 border-l-2 border-slate-800 hover:border-slate-700 transition-colors">
              {/* Timeline dot */}
              <div className={`
                absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-slate-900 
                ${msg.sender === 'ai' ? 'bg-indigo-500' : 'bg-slate-600'}
              `}></div>

              <div className="flex items-center gap-2 mb-1.5">
                <span className={`
                  text-xs font-bold uppercase tracking-wider
                  ${msg.sender === 'ai' ? 'text-indigo-400' : 'text-slate-400'}
                `}>
                  {msg.sender === 'ai' ? 'AI Insight' : 'Update'}
                </span>
                <span className="text-[10px] text-slate-600 font-medium">
                  {formatDate(msg.timestamp)}
                </span>
              </div>

              <div className={`
                text-sm leading-relaxed p-3 rounded-lg border
                ${msg.sender === 'ai' 
                  ? 'bg-indigo-950/20 border-indigo-500/20 text-indigo-100 shadow-sm' 
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-300'}
              `}>
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))
        )}
        
        {isAiProcessing && (
          <div className="pl-4 border-l-2 border-indigo-500/30 animate-pulse">
            <div className="flex items-center gap-2 mb-2">
               <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                 <Loader2 size={12} className="animate-spin" />
                 Analyzing
               </span>
            </div>
            <div className="h-16 bg-indigo-900/10 rounded-lg w-full"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new note..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 pr-24 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 resize-none h-20 scrollbar-thin transition-all placeholder:text-slate-600"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
             <button
              onClick={handleAskAI}
              disabled={isAiProcessing}
              title={inputValue ? "Generate AI Insight based on this prompt" : "Generate AI suggestions based on notes"}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${inputValue.trim() 
                  ? 'text-indigo-400 hover:bg-indigo-500/10' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'}
              `}
            >
              <Sparkles size={14} />
              {inputValue.trim() ? 'Ask AI' : 'Generate Insight'}
            </button>
            
            {inputValue.trim() && (
              <button
                onClick={handleSend}
                className="p-1.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors shadow-lg"
              >
                <Send size={14} />
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 text-[10px] text-slate-500 flex justify-between px-1">
           <span>Records are saved automatically.</span>
        </div>
      </div>
    </div>
  );
};
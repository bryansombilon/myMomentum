
import React, { useState, useEffect, useRef } from 'react';
import { Task, Message } from '../types';
import { Send, Sparkles, Loader2, StickyNote, PenLine, ExternalLink, Clock } from 'lucide-react';
import { generateTaskSummaryOrAdvice } from '../services/geminiService';

interface ChatSectionProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Message[]) => void;
}

const renderTextWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const parts = text.split(urlRegex);
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      const cleanUrl = part.replace(/[.,;!?)]+$/, '');
      const suffix = part.slice(cleanUrl.length);
      const href = cleanUrl.toLowerCase().startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
      return (
        <React.Fragment key={index}>
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-semibold underline decoration-indigo-500/30 hover:decoration-indigo-500/60 transition-all">
            {cleanUrl}
          </a>
          {suffix}
        </React.Fragment>
      );
    }
    return part;
  });
};

export const ChatSection: React.FC<ChatSectionProps> = ({ task, onUpdateTask }) => {
  const [inputValue, setInputValue] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [task.updates]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const newMessage: Message = { id: Date.now().toString(), sender: 'user', text: inputValue, timestamp: new Date(), isUpdate: true };
    onUpdateTask(task.id, [...task.updates, newMessage]);
    setInputValue('');
  };

  const handleAskAI = async () => {
    setIsAiProcessing(true);
    const contextText = task.updates.map(m => `[${m.timestamp.toISOString()}] ${m.text}`).join('\n');
    const prompt = inputValue.trim() || "Suggest next steps.";
    const response = await generateTaskSummaryOrAdvice(task, prompt, contextText);
    const aiMessage: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: response, timestamp: new Date(), isUpdate: false };
    onUpdateTask(task.id, [...task.updates, aiMessage]);
    setInputValue(''); 
    setIsAiProcessing(false);
  };

  return (
    <div className="flex flex-col bg-slate-100/50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[350px]">
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote size={14} className="text-amber-500" />
          <h3 className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-widest">Insights</h3>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-semibold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
          <Clock size={10} /> {task.updates.length} Updates
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[450px]">
        {task.updates.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 py-10">
             <PenLine size={20} className="mb-2 opacity-30" />
             <p className="text-[11px] font-semibold uppercase tracking-widest">No activity yet</p>
          </div>
        ) : (
          task.updates.map((msg) => (
            <div key={msg.id} className="relative pl-6">
              <div className={`absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full ${msg.sender === 'ai' ? 'bg-indigo-500' : 'bg-slate-400 dark:bg-slate-600'}`}></div>
              <div className="absolute left-[2.5px] top-3 bottom-[-15px] w-[1px] bg-slate-200 dark:bg-slate-800"></div>
              <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {msg.sender === 'ai' ? 'AI Assistant' : 'Team Update'} • {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(new Date(msg.timestamp))}
              </div>
              <div className={`text-[13px] p-3 rounded-lg border ${msg.sender === 'ai' ? 'bg-indigo-600 text-white border-indigo-500 font-medium' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm'}`}>
                {renderTextWithLinks(msg.text)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Add update or ask AI..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 pr-24 text-[12px] font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none h-16 placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
             <button onClick={handleAskAI} disabled={isAiProcessing} className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold uppercase tracking-tight hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors border border-indigo-100 dark:border-indigo-800/50">
               {isAiProcessing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} AI
             </button>
             {inputValue.trim() && (
               <button onClick={handleSend} className="p-1.5 bg-slate-800 dark:bg-slate-700 text-white rounded hover:bg-slate-900 transition-colors shadow-sm">
                 <Send size={12} />
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

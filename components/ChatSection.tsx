import React, { useState, useEffect, useRef } from 'react';
import { Task, Message } from '../types';
import { Send, Sparkles, Loader2, StickyNote, PenLine } from 'lucide-react';
import { generateTaskSummaryOrAdvice } from '../services/geminiService';

interface ChatSectionProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Message[]) => void;
}

// Helper function to render text with clickable links
const renderTextWithLinks = (text: string) => {
  // Regex to identify URLs (http/https)
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      // Handle trailing punctuation that shouldn't be part of the URL
      // e.g. "Check google.com." -> link should be "google.com" not "google.com."
      const trailingPunctuationMatch = part.match(/[.,;!?)]+$/);
      let cleanUrl = part;
      let suffix = '';

      if (trailingPunctuationMatch) {
        suffix = trailingPunctuationMatch[0];
        cleanUrl = part.slice(0, -suffix.length);
      }

      return (
        <React.Fragment key={index}>
          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:underline hover:text-indigo-800 dark:hover:text-indigo-300 break-all transition-colors font-medium"
            onClick={(e) => e.stopPropagation()}
          >
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
    <div className="flex flex-col h-full bg-white/50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="p-3 md:p-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0 transition-colors">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <StickyNote size={16} className="text-amber-500 dark:text-amber-400 md:w-[18px] md:h-[18px]" />
          <span className="truncate">Notes & Insights</span>
        </h3>
        <div className="text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-500 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-colors">
          {task.updates.length} entries
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 md:space-y-6">
        {task.updates.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-60">
             <PenLine size={40} className="mb-3 text-slate-400 dark:text-slate-600 md:w-[48px] md:h-[48px]" />
             <p className="text-sm font-medium">No notes yet.</p>
             <p className="text-xs mt-1 text-center max-w-[200px] md:max-w-none">Add a quick update or ask AI for suggestions.</p>
          </div>
        ) : (
          task.updates.map((msg) => (
            <div key={msg.id} className="group relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              {/* Timeline dot */}
              <div className={`
                absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-slate-50 dark:border-slate-900 
                ${msg.sender === 'ai' ? 'bg-indigo-500' : 'bg-slate-400 dark:bg-slate-600'}
              `}></div>

              <div className="flex items-center gap-2 mb-1.5">
                <span className={`
                  text-xs font-bold uppercase tracking-wider
                  ${msg.sender === 'ai' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}
                `}>
                  {msg.sender === 'ai' ? 'AI Insight' : 'Update'}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-600 font-medium">
                  {formatDate(msg.timestamp)}
                </span>
              </div>

              <div className={`
                text-sm leading-relaxed p-2.5 md:p-3 rounded-lg border
                ${msg.sender === 'ai' 
                  ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-500/20 text-indigo-900 dark:text-indigo-100 shadow-sm' 
                  : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300'}
              `}>
                <div className="whitespace-pre-wrap text-xs md:text-sm">
                  {renderTextWithLinks(msg.text)}
                </div>
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
            <div className="h-16 bg-indigo-100 dark:bg-indigo-900/10 rounded-lg w-full"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 md:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 transition-colors">
        <div className="relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new note..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 pr-24 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 resize-none h-14 md:h-20 scrollbar-thin transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
          <div className="absolute bottom-2.5 right-2 md:bottom-3 md:right-3 flex items-center gap-2">
             <button
              onClick={handleAskAI}
              disabled={isAiProcessing}
              title={inputValue ? "Generate AI Insight based on this prompt" : "Generate AI suggestions based on notes"}
              className={`
                flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg text-[10px] md:text-xs font-medium transition-all
                ${inputValue.trim() 
                  ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'}
              `}
            >
              <Sparkles size={14} className="md:w-[14px] md:h-[14px] w-3 h-3" />
              {inputValue.trim() ? 'Ask AI' : 'Generate Insight'}
            </button>
            
            {inputValue.trim() && (
              <button
                onClick={handleSend}
                className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shadow-lg"
              >
                <Send size={14} className="md:w-[14px] md:h-[14px] w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 flex justify-between px-1">
           <span>Records are saved automatically.</span>
        </div>
      </div>
    </div>
  );
};
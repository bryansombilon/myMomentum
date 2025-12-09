import React from 'react';
import { Task, Message } from '../types';
import { PROJECT_CONFIG, STATUS_CONFIG } from '../constants';
import { ExternalLink, Calendar, CheckCircle2, Trash2 } from 'lucide-react';
import { ChatSection } from './ChatSection';

interface TaskDetailProps {
  task: Task | null;
  onUpdateTask: (taskId: string, updates: Message[]) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ task, onUpdateTask, onStatusChange, onDeleteTask }) => {
  if (!task) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-500 select-none">
        <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-800">
           <CheckCircle2 size={40} className="opacity-20" />
        </div>
        <h2 className="text-xl font-semibold mb-2 text-slate-400">No Task Selected</h2>
        <p className="text-sm">Select a task from the list to view details.</p>
      </div>
    );
  }

  const project = PROJECT_CONFIG[task.project];

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-slate-800 bg-slate-900/30 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent opacity-50"></div>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/50 shadow-sm self-start">
            <span 
              className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" 
              style={{ backgroundColor: project.color, color: project.color }} 
            />
            <span className="text-xs font-bold tracking-wide text-slate-300 uppercase">
              {project.name}
            </span>
          </div>
          
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800 shadow-sm">
               {(['todo', 'in-progress', 'on-hold', 'done'] as const).map((s) => {
                 const config = STATUS_CONFIG[s];
                 const isActive = task.status === s;
                 return (
                  <button
                    key={s}
                    onClick={() => onStatusChange(task.id, s)}
                    className={`
                      px-3 py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all capitalize tracking-wide whitespace-nowrap
                      ${isActive 
                        ? `${config.color} ${config.text} shadow-md` 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}
                    `}
                  >
                    {config.label}
                  </button>
                 );
               })}
            </div>

            <div className="w-px h-8 bg-slate-800 mx-1"></div>

            <button
              onClick={() => onDeleteTask(task.id)}
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all"
              title="Delete Task"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight leading-tight">
          {task.title}
        </h1>
        
        <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-3xl mb-6">
          {task.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800">
            <Calendar size={16} className="text-indigo-400" />
            <span className="font-medium text-slate-300">
              Due {new Date(task.deadline).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          
          {task.clickupLink && (
            <a 
              href={task.clickupLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:text-indigo-400 transition-all group shadow-sm hover:shadow-indigo-500/10"
            >
              <ExternalLink size={16} />
              <span className="font-medium">Open in ClickUp</span>
            </a>
          )}
        </div>
      </div>

      {/* Content Body: Chat/Updates */}
      <div className="flex-1 p-6 md:p-8 min-h-0 bg-gradient-to-b from-slate-950 to-slate-900/50">
        <ChatSection task={task} onUpdateTask={onUpdateTask} />
      </div>
    </div>
  );
};
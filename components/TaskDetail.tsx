import React from 'react';
import { Task, Message } from '../types';
import { PROJECT_CONFIG, STATUS_CONFIG } from '../constants';
import { ExternalLink, Calendar, CheckCircle2, Trash2, Briefcase, Link as LinkIcon, Pencil } from 'lucide-react';
import { ChatSection } from './ChatSection';

interface TaskDetailProps {
  task: Task | null;
  onUpdateTask: (taskId: string, updates: Message[]) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ task, onUpdateTask, onStatusChange, onDeleteTask, onEditTask }) => {
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
  const deadlineDate = new Date(task.deadline);
  const isOverdue = deadlineDate < new Date() && task.status !== 'done';

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-950 overflow-hidden">
      {/* Header Section */}
      <div className="p-6 md:p-8 border-b border-slate-800 bg-slate-900/30 relative">
        {/* Background Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent opacity-50"></div>
        
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8">
            {/* Title & Description (Left Side) */}
            <div className="flex-1 min-w-0 space-y-3">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight break-words">
                  {task.title}
                </h1>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                  {task.description}
                </p>
            </div>

            {/* Actions & Status (Right Side) */}
            <div className="flex flex-col items-start xl:items-end gap-3 flex-shrink-0">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Status Buttons */}
                    <div className="flex items-center bg-slate-900/80 rounded-lg p-1 border border-slate-800 shadow-sm backdrop-blur-sm overflow-x-auto max-w-full no-scrollbar">
                        {(['todo', 'in-progress', 'under-review', 'on-hold', 'done'] as const).map((s) => {
                            const config = STATUS_CONFIG[s];
                            const isActive = task.status === s;
                            return (
                                <button
                                    key={s}
                                    onClick={() => onStatusChange(task.id, s)}
                                    className={`
                                      px-3 py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all capitalize tracking-wide whitespace-nowrap
                                      ${isActive 
                                        ? `${config.color} ${config.text} shadow-md scale-105` 
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}
                                    `}
                                >
                                    {config.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-slate-800 hidden md:block"></div>
                    
                    {/* Edit/Delete Actions */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onEditTask(task)}
                            className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg border border-transparent hover:border-indigo-500/20 transition-all"
                            title="Edit Task"
                        >
                            <Pencil size={18} />
                        </button>

                        <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all"
                            title="Delete Task"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Project Card */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 transition-colors hover:border-slate-700">
                <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
                    <Briefcase size={18} />
                </div>
                <div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Project</div>
                    <div className="text-sm font-medium text-slate-200 flex items-center gap-2">
                        <span 
                            className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" 
                            style={{ backgroundColor: project.color, color: project.color }} 
                        />
                        {project.name}
                    </div>
                </div>
            </div>

            {/* Deadline Card */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 transition-colors hover:border-slate-700">
                <div className={`p-2 rounded-lg ${isOverdue ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Calendar size={18} />
                </div>
                <div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Deadline</div>
                    <div className={`text-sm font-medium ${isOverdue ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
                        {deadlineDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        {isOverdue && <span className="ml-2 text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded uppercase">Overdue</span>}
                    </div>
                </div>
            </div>

            {/* ClickUp Link Card */}
             <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 group hover:border-indigo-500/30 transition-colors cursor-pointer">
                <div className="p-2 rounded-lg bg-slate-800 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                    <LinkIcon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Reference</div>
                    {task.clickupLink ? (
                        <a 
                          href={task.clickupLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-indigo-400 hover:text-indigo-300 truncate flex items-center gap-1.5 transition-colors"
                        >
                          Open in ClickUp <ExternalLink size={12} />
                        </a>
                    ) : (
                        <span className="text-sm text-slate-500 italic">No link attached</span>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Content Body: Chat/Updates */}
      <div className="flex-1 p-6 md:p-8 min-h-0 bg-gradient-to-b from-slate-950 to-slate-900/50">
        <ChatSection task={task} onUpdateTask={onUpdateTask} />
      </div>
    </div>
  );
};
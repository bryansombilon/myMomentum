import React from 'react';
import { Task, Message, Priority } from '../types';
import { PROJECT_CONFIG, STATUS_CONFIG, PRIORITY_CONFIG } from '../constants';
import { ExternalLink, Calendar, CheckCircle2, Trash2, Briefcase, Link as LinkIcon, Pencil, AlertTriangle, Clock, Check, Flag } from 'lucide-react';
import { ChatSection } from './ChatSection';

interface TaskDetailProps {
  task: Task | null;
  onUpdateTask: (taskId: string, updates: Message[]) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onPriorityChange: (taskId: string, priority: Priority) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

// Sub-component for metadata items to ensure consistent layout and styling
interface MetadataItemProps {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  iconBgClass?: string;
  iconColorClass?: string;
  className?: string;
  onClick?: () => void;
}

const MetadataItem: React.FC<MetadataItemProps> = ({ 
  icon: Icon, 
  label, 
  children, 
  iconBgClass = "bg-slate-100 dark:bg-slate-800", 
  iconColorClass = "text-slate-400 dark:text-slate-400",
  className = "",
  onClick
}) => (
  <div 
    onClick={onClick}
    className={`
      flex items-center gap-3 p-3 rounded-xl 
      bg-white/50 dark:bg-slate-900/50 
      border border-slate-200 dark:border-slate-800/60 
      transition-all duration-200
      ${onClick 
        ? 'cursor-pointer hover:border-indigo-400/50 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-900 group shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95' 
        : 'hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-900/80'} 
      ${className}
    `}
  >
    <div className={`p-2 rounded-lg flex-shrink-0 transition-colors ${iconBgClass} ${iconColorClass}`}>
      <Icon size={18} />
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-sm font-medium text-slate-900 dark:text-slate-200 flex items-center gap-2 truncate">
        {children}
      </div>
    </div>
  </div>
);

export const TaskDetail: React.FC<TaskDetailProps> = ({ task, onUpdateTask, onStatusChange, onPriorityChange, onDeleteTask, onEditTask }) => {
  if (!task) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 select-none transition-colors">
        <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-200 dark:border-slate-800">
           <CheckCircle2 size={40} className="opacity-20" />
        </div>
        <h2 className="text-xl font-semibold mb-2 text-slate-500 dark:text-slate-400">No Task Selected</h2>
        <p className="text-sm">Select a task from the list to view details.</p>
      </div>
    );
  }

  const project = PROJECT_CONFIG[task.project];
  const deadlineDate = new Date(task.deadline);
  
  // Deadline Logic
  const now = new Date();
  // Reset time for accurate date comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineDay = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
  
  const isOverdue = deadlineDay < today && task.status !== 'done';
  
  // Due soon logic: not overdue, not done, and within next 3 days
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);
  const isDueSoon = !isOverdue && task.status !== 'done' && deadlineDay <= threeDaysFromNow && deadlineDay >= today;

  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG['not-urgent'];
  const isUrgent = task.priority === 'urgent';

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      {/* Header Section */}
      <div className="p-4 md:p-6 xl:p-8 border-b border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 relative shrink-0 transition-colors">
        {/* Background Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent opacity-50"></div>
        
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 md:gap-6 mb-5 md:mb-8">
            {/* Title & Description (Left Side) */}
            <div className="flex-1 min-w-0 space-y-2 md:space-y-3">
                <div className="flex items-start gap-3">
                   <h1 className="text-xl md:text-2xl xl:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight break-words">
                     {task.title}
                   </h1>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 pt-1 pb-1">
                  <button
                    onClick={() => onEditTask(task)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm"
                  >
                    <Pencil size={12} />
                    Edit Task
                  </button>
                  
                  {task.status !== 'done' && (
                    <button
                      onClick={() => onStatusChange(task.id, 'done')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-500/20 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-colors shadow-sm"
                    >
                      <Check size={12} />
                      Mark as Done
                    </button>
                  )}
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed line-clamp-3 md:line-clamp-none">
                  {task.description}
                </p>
            </div>

            {/* Actions & Status (Right Side) */}
            <div className="flex flex-col items-start xl:items-end gap-3 flex-shrink-0 w-full xl:w-auto">
                <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full xl:w-auto">
                    {/* Status Buttons */}
                    <div className="flex-1 xl:flex-none flex items-center bg-white/50 dark:bg-slate-900/80 rounded-lg p-1 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-sm overflow-x-auto max-w-full no-scrollbar transition-colors">
                        {(['todo', 'in-progress', 'under-review', 'on-hold', 'follow-up', 'done'] as const).map((s) => {
                            const config = STATUS_CONFIG[s];
                            const isActive = task.status === s;
                            return (
                                <button
                                    key={s}
                                    onClick={() => onStatusChange(task.id, s)}
                                    className={`
                                      px-2.5 py-1.5 md:px-3 text-[10px] md:text-xs font-bold rounded-md transition-all capitalize tracking-wide whitespace-nowrap flex-shrink-0
                                      ${isActive 
                                        ? `${config.color} ${config.text} shadow-md scale-105` 
                                        : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}
                                    `}
                                >
                                    {config.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
                    
                    {/* Edit/Delete Actions */}
                    <div className="flex items-center gap-1 ml-auto xl:ml-0">
                        <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-200 dark:hover:border-red-500/20 transition-all"
                            title="Delete Task"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Refactored Metadata Grid: 4 Columns on XL for clean row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
            {/* Project Card */}
            <MetadataItem 
                icon={Briefcase} 
                label="Project"
            >
                <span 
                    className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] flex-shrink-0" 
                    style={{ backgroundColor: project.color, color: project.color }} 
                />
                <span className="truncate">{project.name}</span>
            </MetadataItem>

            {/* Priority Card - Enhanced Prominence & Toggle Interaction */}
            <MetadataItem 
                icon={Flag}
                label="Priority"
                onClick={() => onPriorityChange(task.id, isUrgent ? 'not-urgent' : 'urgent')}
                className={isUrgent 
                  ? "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 shadow-[0_0_15px_rgba(239,68,68,0.15)] dark:shadow-none" 
                  : "hover:bg-slate-100/50"}
                iconBgClass={isUrgent 
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/40 ring-2 ring-red-100 dark:ring-red-900 scale-110" 
                  : "bg-slate-200 dark:bg-slate-700"}
                iconColorClass={isUrgent ? "text-white" : "text-slate-500 dark:text-slate-400"}
            >
                <span className={`truncate uppercase tracking-wide flex-1 ${
                  isUrgent 
                    ? "text-lg font-black text-red-700 dark:text-red-400 drop-shadow-sm" 
                    : "font-bold text-slate-600 dark:text-slate-400"
                }`}>
                    {priorityConfig.label}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase font-semibold">
                  {isUrgent ? 'Set Low' : 'Set High'}
                </span>
            </MetadataItem>

            {/* Deadline Card */}
            <MetadataItem 
                icon={Calendar} 
                label={isOverdue ? 'Deadline (Overdue)' : isDueSoon ? 'Deadline (Soon)' : 'Deadline'}
                iconBgClass={
                  isOverdue ? 'bg-red-100 dark:bg-red-500/10' : 
                  isDueSoon ? 'bg-amber-100 dark:bg-amber-500/10' : 
                  'bg-slate-100 dark:bg-slate-800'
                }
                iconColorClass={
                  isOverdue ? 'text-red-600 dark:text-red-400' : 
                  isDueSoon ? 'text-amber-600 dark:text-amber-400' :
                  'text-slate-400 dark:text-slate-400'
                }
            >
                <span className={`truncate ${
                  isOverdue ? 'text-red-600 dark:text-red-400 font-bold' : 
                  isDueSoon ? 'text-amber-600 dark:text-amber-400 font-bold' : 
                  ''
                }`}>
                    {deadlineDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                {isOverdue && (
                    <span className="ml-auto text-[10px] bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wide">
                        Overdue
                    </span>
                )}
                {isDueSoon && (
                    <span className="ml-auto text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wide flex items-center gap-1">
                        <Clock size={10} /> Soon
                    </span>
                )}
            </MetadataItem>

            {/* Reference/Link Card */}
            <MetadataItem 
                icon={LinkIcon} 
                label="Reference"
                onClick={task.clickupLink ? () => window.open(task.clickupLink, '_blank') : undefined}
                iconBgClass="group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors"
                iconColorClass="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
            >
                 {task.clickupLink ? (
                    <>
                      <span className="truncate text-indigo-600 dark:text-indigo-400 group-hover:underline">Open in ClickUp</span>
                      <ExternalLink size={12} className="text-indigo-400 flex-shrink-0" />
                    </>
                ) : (
                    <span className="text-slate-400 dark:text-slate-500 italic">No link attached</span>
                )}
            </MetadataItem>
        </div>
      </div>

      {/* Content Body: Chat/Updates */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 min-h-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900/50 transition-colors">
        <ChatSection task={task} onUpdateTask={onUpdateTask} />
      </div>
    </div>
  );
};

import React from 'react';
import { Task, Message, Priority } from '../types';
import { PROJECT_CONFIG, STATUS_CONFIG } from '../constants';
import { Calendar, CheckCircle2, Trash2, Briefcase, Link as LinkIcon, Pencil, AlertTriangle, Flag } from 'lucide-react';
import { ChatSection } from './ChatSection';

interface TaskDetailProps {
  task: Task | null;
  onUpdateTask: (taskId: string, updates: Message[]) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onPriorityChange: (taskId: string, priority: Priority) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onNavigateToTask?: (taskId: string) => void;
}

const safeFormatDate = (date: Date | string | number, options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' }) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'No Deadline Set';
  try {
    return new Intl.DateTimeFormat('en-US', options).format(d);
  } catch (e) {
    return 'Invalid Date';
  }
};

const MetadataCard: React.FC<{ icon: React.ElementType; label: string; children: React.ReactNode; onClick?: () => void; iconColor?: string }> = ({ 
  icon: Icon, label, children, onClick, iconColor = "text-slate-500"
}) => (
  <div onClick={onClick} className={`flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 transition-all ${onClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 hover:border-indigo-200 dark:hover:border-indigo-900' : ''}`}>
    <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${iconColor}`}><Icon size={16} /></div>
    <div className="min-w-0">
      <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase leading-none mb-1">{label}</div>
      <div className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate leading-none">{children}</div>
    </div>
  </div>
);

export const TaskDetail: React.FC<TaskDetailProps> = ({ task, onUpdateTask, onStatusChange, onPriorityChange, onDeleteTask, onEditTask }) => {
  if (!task) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400 select-none">
        <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-200 dark:border-slate-800">
           <CheckCircle2 size={32} className="opacity-20" />
        </div>
        <h2 className="text-lg font-bold text-slate-600 dark:text-slate-300">Select a Task</h2>
        <p className="text-[11px] font-bold uppercase opacity-50">Choose from the list to begin</p>
      </div>
    );
  }

  const project = PROJECT_CONFIG[task.project];
  const deadlineDate = new Date(task.deadline);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineDay = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
  
  const isDateValid = !isNaN(deadlineDate.getTime());
  const isOverdue = isDateValid && deadlineDay < today && task.status !== 'done';
  const isUrgent = task.priority === 'urgent';
  
  // Extract ID from full ClickUp link
  const clickupId = task.clickupLink ? task.clickupLink.replace(/.*\/t\//, '') : '';

  const handleDelete = () => {
    if (window.confirm('Delete this task permanently? This action cannot be undone.')) {
      onDeleteTask(task.id);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-full px-4 md:px-5 lg:px-6 py-6 pb-32 space-y-5">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold uppercase rounded border border-indigo-200 dark:border-indigo-800/50">
                {task.project}
              </span>
              {clickupId && (
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-mono font-bold uppercase rounded border border-slate-200 dark:border-slate-700">
                  #{clickupId}
                </span>
              )}
              {isUrgent && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white text-[11px] font-bold uppercase rounded shadow-sm shadow-red-500/20">
                  <AlertTriangle size={10} /> Urgent
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-snug break-words">
              {task.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => onEditTask(task)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
              <Pencil size={18} />
            </button>
            {task.status !== 'done' && (
              <button onClick={() => onStatusChange(task.id, 'done')} className="px-4 py-2 text-[13px] font-bold text-white bg-emerald-600 dark:bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-all shadow-md shadow-emerald-500/20 active:scale-95 uppercase">
                Mark Done
              </button>
            )}
            <button onClick={handleDelete} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-all" title="Delete Task">
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Action/Status Bar */}
        <div className="bg-white dark:bg-slate-900/40 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-sm">
          {Object.keys(STATUS_CONFIG).map((key) => {
            const s = key as keyof typeof STATUS_CONFIG;
            const config = STATUS_CONFIG[s];
            const isActive = task.status === s;
            return (
              <button
                key={s}
                onClick={() => onStatusChange(task.id, s)}
                className={`px-4 py-2 text-[11px] font-bold rounded-lg transition-all uppercase whitespace-nowrap ${isActive ? `${config.color} ${config.text} shadow-md` : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <MetadataCard icon={Briefcase} label="Project" iconColor="text-indigo-600 dark:text-indigo-400">
            <span className="w-2 h-2 rounded-full mr-2 inline-block" style={{ backgroundColor: project.color }} />
            {project.name}
          </MetadataCard>
          <MetadataCard icon={Flag} label="Priority" onClick={() => onPriorityChange(task.id, isUrgent ? 'not-urgent' : 'urgent')} iconColor={isUrgent ? 'text-red-600 dark:text-red-400' : 'text-slate-500'}>
            <span className={isUrgent ? 'text-red-600 dark:text-red-400 font-bold' : 'font-bold'}>{isUrgent ? 'Urgent' : 'Normal'}</span>
          </MetadataCard>
          <MetadataCard icon={Calendar} label="Due Date" iconColor={isOverdue ? 'text-red-600 dark:text-red-400' : 'text-slate-500'}>
            <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-bold' : 'font-bold'}>
              {safeFormatDate(task.deadline)}
            </span>
          </MetadataCard>
          <MetadataCard icon={LinkIcon} label="Hub Access" onClick={task.clickupLink ? () => window.open(task.clickupLink, '_blank') : undefined} iconColor="text-emerald-600 dark:text-emerald-400">
            {task.clickupLink ? `ID: ${clickupId}` : 'None Linked'}
          </MetadataCard>
        </div>

        {/* Description Section */}
        <div className="bg-white dark:bg-slate-900/30 p-5 md:p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2.5">Task Overview</div>
          <p className="text-slate-800 dark:text-slate-200 text-[16px] leading-relaxed font-medium">
            {task.description || 'No detailed briefing available.'}
          </p>
        </div>

        {/* Project Insights */}
        <div className="w-full">
          <ChatSection task={task} onUpdateTask={onUpdateTask} />
        </div>
      </div>
    </div>
  );
};

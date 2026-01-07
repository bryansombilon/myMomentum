import React from 'react';
import { Task, Message, Priority } from '../types';
import { PROJECT_CONFIG, STATUS_CONFIG } from '../constants';
import { Calendar, CheckCircle2, Trash2, Briefcase, Link as LinkIcon, Pencil, AlertTriangle, Flag, ChevronLeft } from 'lucide-react';
import { ChatSection } from './ChatSection';

interface TaskDetailProps {
  task: Task | null;
  onUpdateTask: (taskId: string, updates: Message[]) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onPriorityChange: (taskId: string, priority: Priority) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onNavigateToTask?: (taskId: string) => void;
  onBack?: () => void;
}

const MetadataCard: React.FC<{ icon: React.ElementType; label: string; children: React.ReactNode; onClick?: () => void; iconColor?: string }> = ({ 
  icon: Icon, label, children, onClick, iconColor = "text-slate-500"
}) => (
  <div onClick={onClick} className={`flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 transition-all ${onClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95' : ''}`}>
    <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${iconColor}`}><Icon size={16} /></div>
    <div className="min-w-0">
      <div className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{children}</div>
    </div>
  </div>
);

export const TaskDetail: React.FC<TaskDetailProps> = ({ task, onUpdateTask, onStatusChange, onPriorityChange, onDeleteTask, onEditTask, onBack }) => {
  if (!task) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400 select-none">
        <CheckCircle2 size={32} className="opacity-20 mb-4" />
        <h2 className="text-base font-bold tracking-tight text-slate-600 dark:text-slate-300">Select a Task</h2>
      </div>
    );
  }

  const project = PROJECT_CONFIG[task.project];
  const deadlineDate = new Date(task.deadline);
  const isUrgent = task.priority === 'urgent';

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-full px-4 py-6 space-y-5">
        
        {/* Mobile Nav Header */}
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
            <ChevronLeft size={16} /> Back to List
          </button>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold uppercase tracking-wider rounded border border-indigo-200 dark:border-indigo-800/50">
                {task.project}
              </span>
              {isUrgent && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded">
                  <AlertTriangle size={10} /> Urgent
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              {task.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => onEditTask(task)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-transparent transition-all">
              <Pencil size={18} />
            </button>
            <button onClick={() => window.confirm('Delete this task?') && onDeleteTask(task.id)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 rounded-lg transition-all">
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-white dark:bg-slate-900/40 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {Object.keys(STATUS_CONFIG).map((key) => {
            const s = key as keyof typeof STATUS_CONFIG;
            const config = STATUS_CONFIG[s];
            const isActive = task.status === s;
            return (
              <button
                key={s}
                onClick={() => onStatusChange(task.id, s)}
                className={`px-3 py-2 text-[9px] font-semibold rounded-lg transition-all uppercase tracking-wider whitespace-nowrap ${isActive ? `${config.color} ${config.text}` : 'text-slate-500 dark:text-slate-400'}`}
              >
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <MetadataCard icon={Briefcase} label="Project" iconColor="text-indigo-600">
            {project.name}
          </MetadataCard>
          <MetadataCard icon={Flag} label="Priority" onClick={() => onPriorityChange(task.id, isUrgent ? 'not-urgent' : 'urgent')} iconColor={isUrgent ? 'text-red-600' : 'text-slate-500'}>
            {isUrgent ? 'Urgent' : 'Normal'}
          </MetadataCard>
          <MetadataCard icon={Calendar} label="Due Date">
            {deadlineDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </MetadataCard>
          <MetadataCard icon={LinkIcon} label="ClickUp" onClick={task.clickupLink ? () => window.open(task.clickupLink, '_blank') : undefined}>
            {task.clickupLink ? 'View Link' : 'None'}
          </MetadataCard>
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
          <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
            {task.description || 'No description provided.'}
          </p>
        </div>

        <ChatSection task={task} onUpdateTask={onUpdateTask} />
      </div>
    </div>
  );
};
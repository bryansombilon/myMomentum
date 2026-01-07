import React from 'react';
import { Task, Message, Priority } from '../types';
import { PROJECT_CONFIG, STATUS_CONFIG } from '../constants';
import { Calendar, CheckCircle2, Trash2, Briefcase, Link as LinkIcon, Pencil, AlertTriangle, Check, Flag } from 'lucide-react';
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

const MetadataCard: React.FC<{ icon: React.ElementType; label: string; children: React.ReactNode; onClick?: () => void; iconColor?: string }> = ({ 
  icon: Icon, label, children, onClick, iconColor = "text-slate-400"
}) => (
  <div onClick={onClick} className={`flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 transition-colors ${onClick ? 'cursor-pointer hover:bg-slate-50 active:scale-95' : ''}`}>
    <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 ${iconColor}`}><Icon size={14} /></div>
    <div className="min-w-0">
      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">{label}</div>
      <div className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 truncate leading-none">{children}</div>
    </div>
  </div>
);

export const TaskDetail: React.FC<TaskDetailProps> = ({ task, onUpdateTask, onStatusChange, onPriorityChange, onDeleteTask, onEditTask }) => {
  if (!task) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400 select-none">
        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center mb-4 shadow-sm border border-slate-200 dark:border-slate-800">
           <CheckCircle2 size={20} className="opacity-20" />
        </div>
        <h2 className="text-sm font-semibold tracking-tight">Nothing Selected</h2>
        <p className="text-[9px] font-medium uppercase tracking-widest opacity-50">Choose a task from the list</p>
      </div>
    );
  }

  const project = PROJECT_CONFIG[task.project];
  const deadlineDate = new Date(task.deadline);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineDay = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
  const isOverdue = deadlineDay < today && task.status !== 'done';
  const isUrgent = task.priority === 'urgent';

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-5xl mx-auto p-5 md:p-6 lg:p-7 space-y-4">
        
        {/* Compact Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[8px] font-bold uppercase tracking-wider rounded border border-indigo-100 dark:border-indigo-800/30">
                {task.project}
              </span>
              {isUrgent && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-600 text-white text-[8px] font-bold uppercase tracking-wider rounded">
                  <AlertTriangle size={8} /> Urgent
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug break-words">
              {task.title}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => onEditTask(task)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
              <Pencil size={14} />
            </button>
            {task.status !== 'done' && (
              <button onClick={() => onStatusChange(task.id, 'done')} className="px-3 py-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-lg hover:bg-emerald-100 transition-all">
                Complete
              </button>
            )}
            <button onClick={() => window.confirm('Delete?') && onDeleteTask(task.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-all">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Action/Status Bar */}
        <div className="bg-white dark:bg-slate-900/40 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {(['todo', 'in-progress', 'under-review', 'done'] as const).map((s) => {
            const config = STATUS_CONFIG[s];
            const isActive = task.status === s;
            return (
              <button
                key={s}
                onClick={() => onStatusChange(task.id, s)}
                className={`px-3 py-1.5 text-[8px] font-bold rounded-lg transition-all capitalize tracking-wider ${isActive ? `${config.color} ${config.text} shadow-sm` : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <MetadataCard icon={Briefcase} label="Project" iconColor="text-indigo-500">
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 inline-block" style={{ backgroundColor: project.color }} />
            {project.name}
          </MetadataCard>
          <MetadataCard icon={Flag} label="Priority" onClick={() => onPriorityChange(task.id, isUrgent ? 'not-urgent' : 'urgent')} iconColor={isUrgent ? 'text-red-500' : 'text-slate-400'}>
            {isUrgent ? 'Urgent' : 'Normal'}
          </MetadataCard>
          <MetadataCard icon={Calendar} label="Due Date" iconColor={isOverdue ? 'text-red-500' : 'text-slate-400'}>
            <span className={isOverdue ? 'text-red-500' : ''}>{deadlineDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
          </MetadataCard>
          <MetadataCard icon={LinkIcon} label="Resources" onClick={task.clickupLink ? () => window.open(task.clickupLink, '_blank') : undefined} iconColor="text-emerald-500">
            {task.clickupLink ? 'ClickUp' : 'None'}
          </MetadataCard>
        </div>

        {/* Description Section */}
        <div className="bg-white dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60">
          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Briefing</div>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
            {task.description || 'Provide more details in the edit menu.'}
          </p>
        </div>

        {/* Project Insights - Always full row */}
        <div className="w-full">
          <ChatSection task={task} onUpdateTask={onUpdateTask} />
        </div>
      </div>
    </div>
  );
};
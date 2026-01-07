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

const MetadataCard: React.FC<{ icon: React.ElementType; label: string; children: React.ReactNode; onClick?: () => void; iconColor?: string }> = ({ 
  icon: Icon, label, children, onClick, iconColor = "text-slate-400"
}) => (
  <div onClick={onClick} className={`flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 transition-colors ${onClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95' : ''}`}>
    <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${iconColor}`}><Icon size={16} /></div>
    <div className="min-w-0">
      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</div>
      <div className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate leading-none">{children}</div>
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
        <h2 className="text-base font-semibold tracking-tight">Select a Task</h2>
        <p className="text-[10px] font-medium uppercase tracking-widest opacity-50">Choose from the list to begin</p>
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
      <div className="w-full px-4 md:px-5 lg:px-6 py-6 space-y-5">
        
        {/* Compact Header */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded border border-indigo-100 dark:border-indigo-800/30">
                {task.project}
              </span>
              {isUrgent && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded">
                  <AlertTriangle size={10} /> Urgent
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug break-words">
              {task.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => onEditTask(task)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
              <Pencil size={18} />
            </button>
            {task.status !== 'done' && (
              <button onClick={() => onStatusChange(task.id, 'done')} className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-lg hover:bg-emerald-100 transition-all shadow-sm">
                Mark Done
              </button>
            )}
            <button onClick={() => window.confirm('Delete this task permanently?') && onDeleteTask(task.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-all">
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
                className={`px-4 py-2 text-[10px] font-bold rounded-lg transition-all capitalize tracking-wider whitespace-nowrap ${isActive ? `${config.color} ${config.text} shadow-sm` : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <MetadataCard icon={Briefcase} label="Project" iconColor="text-indigo-500">
            <span className="w-2 h-2 rounded-full mr-2 inline-block" style={{ backgroundColor: project.color }} />
            {project.name}
          </MetadataCard>
          <MetadataCard icon={Flag} label="Priority" onClick={() => onPriorityChange(task.id, isUrgent ? 'not-urgent' : 'urgent')} iconColor={isUrgent ? 'text-red-500' : 'text-slate-400'}>
            {isUrgent ? 'Urgent' : 'Normal'}
          </MetadataCard>
          <MetadataCard icon={Calendar} label="Due Date" iconColor={isOverdue ? 'text-red-500' : 'text-slate-400'}>
            <span className={isOverdue ? 'text-red-500' : ''}>{deadlineDate.toLocaleDateString([], { month: 'long', day: 'numeric' })}</span>
          </MetadataCard>
          <MetadataCard icon={LinkIcon} label="Hub Access" onClick={task.clickupLink ? () => window.open(task.clickupLink, '_blank') : undefined} iconColor="text-emerald-500">
            {task.clickupLink ? 'View ClickUp' : 'None Linked'}
          </MetadataCard>
        </div>

        {/* Description Section */}
        <div className="bg-white dark:bg-slate-900/30 p-5 md:p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Task Overview</div>
          <p className="text-slate-600 dark:text-slate-300 text-[15px] leading-relaxed font-medium">
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
import React from 'react';
import { Task, Message, Priority } from '../types';
import { PROJECT_CONFIG, STATUS_CONFIG, PRIORITY_CONFIG } from '../constants';
import { ExternalLink, Calendar, Trash2, Briefcase, Link as LinkIcon, Pencil, AlertTriangle, Clock, Check, Flag, ChevronRight, Layout } from 'lucide-react';
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

export const TaskDetail: React.FC<TaskDetailProps> = ({ task, onUpdateTask, onStatusChange, onPriorityChange, onDeleteTask, onEditTask }) => {
  if (!task) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-12 text-center transition-colors">
        <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-indigo-500/5">
          <Layout size={48} className="text-slate-200 dark:text-slate-800" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Select a Task</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs text-sm">Pick an item from the organizer to start tracking progress and adding updates.</p>
      </div>
    );
  }

  // Safety: handle cases where local storage might have outdated/invalid project/status names
  const project = PROJECT_CONFIG[task.project] || PROJECT_CONFIG['Awards' as any] || { name: 'Unknown', color: '#cbd5e1' };
  const isUrgent = task.priority === 'urgent';
  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG['todo'];

  return (
    <div className="flex-1 h-full flex flex-col bg-white dark:bg-slate-950 overflow-hidden transition-colors">
      {/* Header Area */}
      <div className="p-6 lg:p-10 border-b border-slate-100 dark:border-slate-900 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border" 
                    style={{ backgroundColor: `${project.color}10`, borderColor: `${project.color}30`, color: project.color }}>
                <Briefcase size={12} />
                {project.name}
              </span>
              {isUrgent && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500 text-white shadow-lg shadow-red-500/20 animate-pulse">
                  <AlertTriangle size={12} /> Urgent
                </span>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {task.title}
            </h1>
            
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
              {task.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
             <button 
              onClick={() => onEditTask(task)}
              className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
              title="Edit Task"
            >
              <Pencil size={20} />
            </button>
            <button 
              onClick={() => { if(window.confirm('Delete this task?')) onDeleteTask(task.id); }}
              className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
              title="Delete Task"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Tracker Metadata Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DetailStat 
            icon={Clock} 
            label="Current Status" 
            value={statusConfig.label} 
            colorClass={statusConfig.color}
            isPill
          />
          <DetailStat 
            icon={Calendar} 
            label="Deadline" 
            value={new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} 
          />
          <DetailStat 
            icon={Flag} 
            label="Priority" 
            value={isUrgent ? 'Urgent' : 'Standard'} 
            onClick={() => onPriorityChange(task.id, isUrgent ? 'not-urgent' : 'urgent')}
            isInteractive
          />
          <DetailStat 
            icon={LinkIcon} 
            label="Reference" 
            value={task.clickupLink ? 'ClickUp' : 'None'} 
            onClick={task.clickupLink ? () => window.open(task.clickupLink, '_blank') : undefined}
            isInteractive={!!task.clickupLink}
          />
        </div>

        {/* Status Quick Switcher */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
           {(['todo', 'in-progress', 'under-review', 'on-hold', 'done'] as const).map(s => (
             <button
                key={s}
                onClick={() => onStatusChange(task.id, s)}
                className={`flex-1 min-w-[100px] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  task.status === s 
                    ? `${STATUS_CONFIG[s].color} ${STATUS_CONFIG[s].text} shadow-lg shadow-indigo-500/10` 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800'
                }`}
             >
               {STATUS_CONFIG[s].label}
             </button>
           ))}
        </div>
      </div>

      {/* Tracking Content / Chat */}
      <div className="flex-1 min-h-0 bg-slate-50 dark:bg-slate-950 p-6 lg:p-10">
        <ChatSection task={task} onUpdateTask={onUpdateTask} />
      </div>
    </div>
  );
};

interface DetailStatProps {
  icon: React.ElementType;
  label: string;
  value: string;
  colorClass?: string;
  isPill?: boolean;
  isInteractive?: boolean;
  onClick?: () => void;
}

const DetailStat: React.FC<DetailStatProps> = ({ icon: Icon, label, value, colorClass, isPill, isInteractive, onClick }) => (
  <div 
    onClick={onClick}
    className={`p-4 rounded-2xl border transition-all ${
      onClick ? 'cursor-pointer hover:bg-white dark:hover:bg-slate-900 hover:shadow-md' : 'bg-white/40 dark:bg-slate-900/40'
    } border-slate-100 dark:border-slate-800 flex items-center gap-4`}
  >
    <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 ${onClick ? 'group-hover:text-indigo-600' : ''}`}>
      <Icon size={18} />
    </div>
    <div className="min-w-0">
      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</div>
      <div className={`text-sm font-bold truncate ${isPill ? `${colorClass} px-2 py-0.5 rounded text-white text-[10px] uppercase` : 'text-slate-700 dark:text-slate-200'}`}>
        {value}
      </div>
    </div>
    {isInteractive && <ChevronRight size={14} className="ml-auto text-slate-300" />}
  </div>
);
import React, { useState, useMemo } from 'react';
import { Reorder, useDragControls, motion } from 'framer-motion';
import { Task } from '../types';
import { PROJECT_CONFIG, STATUS_CONFIG } from '../constants';
import { Calendar, GripVertical, Plus, Search, Home } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  selectedTaskId: string | null;
  onSelectTask: (task: Task) => void;
  onAddNewTask: () => void;
  onGoHome?: () => void;
}

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onSelect: (task: Task) => void;
  isDragEnabled: boolean;
}

const TaskItem: React.FC<TaskItemProps> = React.memo(({ 
  task, 
  isSelected, 
  onSelect,
  isDragEnabled
}) => {
  const controls = useDragControls();
  const statusStyle = STATUS_CONFIG[task.status] || STATUS_CONFIG['todo'];
  const isUrgent = task.priority === 'urgent';

  const Content = (
    <>
      <div className={`w-[3px] ${statusStyle.color} shrink-0`} />
      <div className="flex-1 p-3 flex flex-col min-w-0 gap-1">
        {/* Top: Project & Urgency */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PROJECT_CONFIG[task.project].color }} />
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              {PROJECT_CONFIG[task.project].name}
            </span>
            {isUrgent && (
              <span className="text-[8px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-1 rounded border border-red-100 dark:border-red-500/20">
                Urgent
              </span>
            )}
          </div>
          {isDragEnabled && (
            <div onPointerDown={(e) => controls.start(e)} className="text-slate-300 dark:text-slate-700 cursor-grab active:cursor-grabbing p-0.5 touch-none">
              <GripVertical size={12} />
            </div>
          )}
        </div>

        {/* Middle: Title */}
        <h3 className={`font-semibold text-[13px] leading-tight truncate ${isSelected ? 'text-indigo-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
          {task.title}
        </h3>

        {/* Bottom: Date & Status */}
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1 text-[9px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-tight">
            <Calendar size={10} />
            <span className={new Date(task.deadline) < new Date() && task.status !== 'done' ? 'text-red-500 font-bold' : ''}>
              {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(task.deadline))}
            </span>
          </div>
          <div className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter ${statusStyle.color} ${statusStyle.text}`}>
            {statusStyle.label}
          </div>
        </div>
      </div>
    </>
  );

  const containerClasses = `
    relative group border cursor-pointer select-none overflow-hidden touch-none transition-all duration-200 rounded-lg flex mb-1.5
    ${isSelected 
      ? 'bg-white dark:bg-slate-800 border-indigo-500 dark:border-indigo-400 shadow-md ring-1 ring-indigo-500/20 z-10' 
      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-sm'}
  `;

  return isDragEnabled ? (
    <Reorder.Item value={task} id={task.id} dragListener={false} dragControls={controls} className={containerClasses} onClick={() => onSelect(task)}>
      {Content}
    </Reorder.Item>
  ) : (
    <motion.div className={containerClasses} onClick={() => onSelect(task)}>{Content}</motion.div>
  );
});

export const TaskList: React.FC<TaskListProps> = ({ tasks, setTasks, selectedTaskId, onSelectTask, onAddNewTask, onGoHome }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchSearch = !searchQuery || task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'all' || task.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [tasks, searchQuery, filterStatus]);

  const isFiltered = searchQuery !== '' || filterStatus !== 'all';

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 md:w-72 flex-shrink-0">
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2">
          {onGoHome && (
            <button onClick={onGoHome} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 border border-slate-200 dark:border-slate-700">
              <Home size={14} />
            </button>
          )}
          <h2 className="text-lg font-bold tracking-tight uppercase text-slate-800 dark:text-slate-100">Tasks</h2>
        </div>
        <button onClick={onAddNewTask} className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md shadow transition-transform active:scale-95">
          <Plus size={16} strokeWidth={3} />
        </button>
      </div>

      <div className="p-3 space-y-2">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md pl-8 pr-2 py-1.5 text-[11px] font-medium focus:border-indigo-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          {['all', 'todo', 'in-progress', 'done'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all border ${filterStatus === s ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {!isFiltered ? (
          <Reorder.Group axis="y" values={tasks} onReorder={setTasks} className="space-y-1">
            {filteredTasks.map((task) => (
              <TaskItem key={task.id} task={task} isSelected={selectedTaskId === task.id} onSelect={onSelectTask} isDragEnabled={true} />
            ))}
          </Reorder.Group>
        ) : (
          <div className="space-y-1">
            {filteredTasks.map((task) => (
              <TaskItem key={task.id} task={task} isSelected={selectedTaskId === task.id} onSelect={onSelectTask} isDragEnabled={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
import React, { useState, useMemo } from 'react';
import { Reorder, useDragControls, motion } from 'framer-motion';
import { Task, ProjectType } from '../types';
import { PROJECT_CONFIG, STATUS_CONFIG } from '../constants';
import { Calendar, GripVertical, Plus, Search, Home, Filter, Clock, Flag, Briefcase, Activity } from 'lucide-react';

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
      <div className={`w-[3.5px] ${statusStyle.color} shrink-0`} />
      <div className="flex-1 p-3.5 flex flex-col min-w-0 gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PROJECT_CONFIG[task.project].color }} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 truncate">
              {PROJECT_CONFIG[task.project].name}
            </span>
            {isUrgent && (
              <span className="text-[9px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-500/20">
                Urgent
              </span>
            )}
          </div>
          {isDragEnabled && (
            <div onPointerDown={(e) => controls.start(e)} className="text-slate-400 dark:text-slate-600 cursor-grab active:cursor-grabbing p-0.5 touch-none">
              <GripVertical size={14} />
            </div>
          )}
        </div>

        <h3 className={`font-semibold text-[14px] leading-tight break-words ${isSelected ? 'text-indigo-950 dark:text-white' : 'text-slate-800 dark:text-slate-100'}`}>
          {task.title}
        </h3>

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
            <Calendar size={12} className="text-slate-400 dark:text-slate-500" />
            <span className={new Date(task.deadline) < new Date() && task.status !== 'done' ? 'text-red-600 dark:text-red-400 font-bold' : ''}>
              {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(task.deadline))}
            </span>
          </div>
          <div className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-tighter ${statusStyle.color} ${statusStyle.text}`}>
            {statusStyle.label}
          </div>
        </div>
      </div>
    </>
  );

  const containerClasses = `
    relative group border cursor-pointer select-none overflow-hidden touch-none transition-all duration-200 rounded-lg flex mb-2
    ${isSelected 
      ? 'bg-white dark:bg-slate-800 border-indigo-500 dark:border-indigo-400 shadow-md ring-1 ring-indigo-500/10 z-10' 
      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'}
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
  const [filterProject, setFilterProject] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterTime, setFilterTime] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchSearch = !searchQuery || task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchProject = filterProject === 'all' || task.project === filterProject;
      const matchPriority = filterPriority === 'all' || task.priority === filterPriority;

      let matchTime = true;
      if (filterTime !== 'all') {
        const deadline = new Date(task.deadline);
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        if (filterTime === 'overdue') {
          matchTime = deadline < startOfDay && task.status !== 'done';
        } else if (filterTime === 'today') {
          matchTime = deadline >= startOfDay && deadline <= endOfDay;
        } else if (filterTime === 'week') {
          const nextWeek = new Date(startOfDay);
          nextWeek.setDate(nextWeek.getDate() + 7);
          matchTime = deadline >= startOfDay && deadline <= nextWeek;
        }
      }

      return matchSearch && matchStatus && matchProject && matchPriority && matchTime;
    });
  }, [tasks, searchQuery, filterStatus, filterProject, filterPriority, filterTime]);

  const isFiltered = searchQuery !== '' || filterStatus !== 'all' || filterProject !== 'all' || filterPriority !== 'all' || filterTime !== 'all';

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 md:w-80 flex-shrink-0">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          {onGoHome && (
            <button 
              onClick={onGoHome} 
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
              title="Return Home"
            >
              <Home size={18} />
            </button>
          )}
          <h2 className="text-2xl font-bold tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-br from-indigo-500 to-blue-600">TaskFlow</h2>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-md transition-all border ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-inner' : 'bg-white border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700'}`}
                title="Toggle Filters"
            >
                <Filter size={18} />
            </button>
            <button onClick={onAddNewTask} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md shadow transition-transform active:scale-95">
                <Plus size={18} strokeWidth={2} />
            </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-2 text-xs font-semibold focus:border-indigo-500 dark:focus:border-indigo-400 outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            {/* Status Filter */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Activity size={10} /> Status
                </label>
                <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-[11px] font-semibold outline-none cursor-pointer focus:border-indigo-500 dark:text-slate-200"
                >
                    <option value="all">All Statuses</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="on-hold">On Hold</option>
                    <option value="under-review">Under Review</option>
                    <option value="follow-up">Follow Up</option>
                    <option value="done">Done</option>
                </select>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Briefcase size={10} /> Project
                </label>
                <select 
                    value={filterProject} 
                    onChange={(e) => setFilterProject(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-[11px] font-semibold outline-none cursor-pointer focus:border-indigo-500 dark:text-slate-200"
                >
                    <option value="all">All Projects</option>
                    {Object.values(ProjectType).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Flag size={10} /> Priority
                    </label>
                    <select 
                        value={filterPriority} 
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-[11px] font-semibold outline-none cursor-pointer focus:border-indigo-500 dark:text-slate-200"
                    >
                        <option value="all">Any</option>
                        <option value="urgent">Urgent</option>
                        <option value="not-urgent">Normal</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Clock size={10} /> Schedule
                    </label>
                    <select 
                        value={filterTime} 
                        onChange={(e) => setFilterTime(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-[11px] font-semibold outline-none cursor-pointer focus:border-indigo-500 dark:text-slate-200"
                    >
                        <option value="all">Anytime</option>
                        <option value="overdue">Overdue</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                    </select>
                </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
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
            {filteredTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-600">
                    <Search size={24} className="mb-2 opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No matching results</p>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
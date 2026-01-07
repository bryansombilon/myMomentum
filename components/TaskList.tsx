import React, { useState, useMemo } from 'react';
import { Reorder, useDragControls, AnimatePresence, motion } from 'framer-motion';
import { Task, ProjectType, Priority } from '../types';
import { PROJECT_CONFIG, STATUS_CONFIG, PRIORITY_CONFIG } from '../constants';
import { Calendar, GripVertical, Plus, Filter, X, Search, Home } from 'lucide-react';

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
  const project = PROJECT_CONFIG[task.project];
  const isUrgent = task.priority === 'urgent';

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(date));
  };

  const content = (
    <div className="relative flex items-center p-3 pl-4 gap-3">
      {/* Visual Status Indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusStyle.color} opacity-80`} />
      
      {/* Drag Handle */}
      {isDragEnabled && (
        <div 
          onPointerDown={(e) => controls.start(e)}
          className="cursor-grab active:cursor-grabbing p-1.5 -ml-1.5 rounded-md text-slate-300 dark:text-slate-600 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all"
        >
          <GripVertical size={16} />
        </div>
      )}

      <div className="flex-1 min-w-0 pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">
            {project.name}
          </span>
          {isUrgent && (
            <span className="ml-auto text-[8px] font-black uppercase bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20">
              Urgent
            </span>
          )}
        </div>
        
        <h3 className={`text-sm font-bold truncate transition-colors duration-200 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
          {task.title}
        </h3>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
            <Calendar size={12} className="shrink-0" />
            {formatDate(task.deadline)}
          </div>
          <div className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm ${statusStyle.color} ${statusStyle.text} bg-opacity-90`}>
            {statusStyle.label}
          </div>
        </div>
      </div>
    </div>
  );

  const containerClasses = `
    group relative mb-2 rounded-xl border transition-colors duration-300 overflow-hidden cursor-pointer select-none
    ${isSelected 
      ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-lg ring-1 ring-indigo-500/20 z-10' 
      : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'}
  `;

  return (
    <Reorder.Item
      value={task}
      id={task.id}
      dragListener={false}
      dragControls={controls}
      dragEnabled={isDragEnabled}
      className={containerClasses}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 600, 
        damping: 35, 
        mass: 1
      }}
      whileDrag={{ 
        scale: 1.05, 
        rotate: 1,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        zIndex: 50,
        backgroundColor: "rgb(255, 255, 255)",
      }}
      onClick={() => onSelect(task)}
    >
      {content}
    </Reorder.Item>
  );
});

export const TaskList: React.FC<TaskListProps> = ({ tasks, setTasks, selectedTaskId, onSelectTask, onAddNewTask, onGoHome }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('all');

  const filteredTasks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return tasks.filter(t => 
      (t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) &&
      (filterProject === 'all' || t.project === filterProject)
    );
  }, [tasks, searchQuery, filterProject]);

  const completionRate = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100);
  }, [tasks]);

  const isFiltered = searchQuery !== '' || filterProject !== 'all';

  // Reorder.Group requires the 'values' prop to match the list being rendered for smooth operation
  const currentDisplayTasks = isFiltered ? filteredTasks : tasks;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-full md:w-80 lg:w-96 flex-shrink-0 transition-colors">
      {/* Dashboard Summary Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <button onClick={onGoHome} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors">
               <Home size={18} />
             </button>
             <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Organizer</h1>
          </div>
          <button 
            onClick={onAddNewTask}
            className="w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Global Tracker Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Progress</span>
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{completionRate}%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="h-full bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"
            />
          </div>
          <p className="mt-2 text-[10px] font-bold text-slate-500 text-center">
            {tasks.filter(t => t.status !== 'done').length} tasks remaining
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <select 
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="w-full pl-4 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Projects</option>
                {Object.values(PROJECT_CONFIG).map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
            </div>
            {isFiltered && (
              <button 
                onClick={() => { setSearchQuery(''); setFilterProject('all'); }}
                className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Task List - Reorderable */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <Reorder.Group 
          axis="y" 
          values={currentDisplayTasks} 
          onReorder={(newOrder) => {
            // Only update the main tasks state if we aren't filtering
            if (!isFiltered) setTasks(newOrder);
          }} 
          className="space-y-1"
          style={{ listStyle: 'none' }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {currentDisplayTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                isSelected={selectedTaskId === task.id} 
                onSelect={onSelectTask}
                isDragEnabled={!isFiltered}
              />
            ))}
          </AnimatePresence>
          
          {isFiltered && currentDisplayTasks.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                <Search className="text-slate-200 dark:text-slate-700" size={32} />
              </div>
              <p className="text-sm font-bold text-slate-400">No matching tasks</p>
            </div>
          )}
        </Reorder.Group>
      </div>
    </div>
  );
};
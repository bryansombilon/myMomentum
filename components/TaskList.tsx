import React, { useState, useMemo } from 'react';
import { Reorder, useDragControls, AnimatePresence, motion } from 'framer-motion';
import { Task, ProjectType } from '../types';
import { PROJECT_CONFIG, STATUS_CONFIG } from '../constants';
import { Calendar, GripVertical, ChevronRight, Plus, Filter, X, AlertTriangle, Clock } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  selectedTaskId: string | null;
  onSelectTask: (task: Task) => void;
  onAddNewTask: () => void;
}

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onSelect: (task: Task) => void;
  isDragEnabled: boolean;
}

// Sub-component to handle individual drag controls properly
const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  isSelected, 
  onSelect,
  isDragEnabled
}) => {
  const controls = useDragControls();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

  const statusStyle = STATUS_CONFIG[task.status] || STATUS_CONFIG['todo'];
  const isUrgent = task.priority === 'urgent';

  // Common inner content
  const Content = (
    <>
      {/* Prominent Status Strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusStyle.color} transition-colors duration-200`} />

      <div className="flex items-start gap-3 p-3 pl-5">
        {/* Drag Handle - Only visible if drag is enabled */}
        {isDragEnabled ? (
          <div 
            onPointerDown={(e) => controls.start(e)}
            className="mt-1.5 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors touch-none"
          >
            <GripVertical size={16} />
          </div>
        ) : (
          // Spacer if drag disabled to keep alignment
          <div className="mt-1.5 w-[24px] h-[24px]" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <div 
              className="w-2 h-2 rounded-full flex-shrink-0 shadow-[0_0_8px_currentColor]" 
              style={{ backgroundColor: PROJECT_CONFIG[task.project].color, color: PROJECT_CONFIG[task.project].color }}
            />
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
              {PROJECT_CONFIG[task.project].name}
            </span>
            {isUrgent && (
              <span className="ml-auto flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-500/20">
                <AlertTriangle size={10} /> Urgent
              </span>
            )}
          </div>
          
          <h3 className={`font-medium text-sm mb-3 truncate leading-snug ${isSelected ? 'text-indigo-700 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-200'}`}>
            {task.title}
          </h3>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar size={12} />
              <span className={new Date(task.deadline) < new Date() ? 'text-red-500 dark:text-red-400 font-bold' : ''}>
                {formatDate(new Date(task.deadline))}
              </span>
            </div>
            
            <div className={`
              text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wide
              ${statusStyle.color} ${statusStyle.text} shadow-sm bg-opacity-90 backdrop-blur-sm
            `}>
              {statusStyle.label}
            </div>
          </div>
        </div>
        
        {isSelected && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500">
            <ChevronRight size={16} />
          </div>
        )}
      </div>
    </>
  );

  const containerClasses = `
    relative group rounded-xl border cursor-pointer select-none overflow-hidden touch-none transition-all
    ${isSelected 
      ? 'bg-indigo-50 dark:bg-slate-800 border-indigo-500 shadow-md dark:shadow-indigo-500/10' 
      : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}
  `;

  // Render Reorder.Item if draggable, otherwise standard motion.div
  if (isDragEnabled) {
    return (
      <Reorder.Item
        value={task}
        id={task.id}
        dragListener={false}
        dragControls={controls}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileDrag={{ 
          scale: 1.03, 
          zIndex: 50,
          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
          cursor: "grabbing",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30, mass: 1 }}
        className={containerClasses}
        onClick={() => onSelect(task)}
      >
        {Content}
      </Reorder.Item>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={containerClasses}
      onClick={() => onSelect(task)}
    >
      {Content}
    </motion.div>
  );
};

export const TaskList: React.FC<TaskListProps> = ({ tasks, setTasks, selectedTaskId, onSelectTask, onAddNewTask }) => {
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDeadline, setFilterDeadline] = useState<string>('all');

  const filteredTasks = useMemo(() => {
    const now = new Date();
    // Normalize now to start of day for cleaner comparison if needed, 
    // but straight comparison works for "Due Soon" relative to current moment.
    
    return tasks.filter(task => {
      const matchProject = filterProject === 'all' || task.project === filterProject;
      const matchStatus = filterStatus === 'all' || task.status === filterStatus;
      
      let matchDeadline = true;
      const deadline = new Date(task.deadline);

      if (filterDeadline === 'due-soon') {
        // Due within next 3 days and not completed
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3);
        matchDeadline = deadline >= now && deadline <= threeDaysFromNow && task.status !== 'done';
      } else if (filterDeadline === 'overdue') {
        // Past deadline and not completed
        matchDeadline = deadline < now && task.status !== 'done';
      }

      return matchProject && matchStatus && matchDeadline;
    });
  }, [tasks, filterProject, filterStatus, filterDeadline]);

  const isFiltered = filterProject !== 'all' || filterStatus !== 'all' || filterDeadline !== 'all';

  const clearFilters = () => {
    setFilterProject('all');
    setFilterStatus('all');
    setFilterDeadline('all');
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-full md:w-80 lg:w-96 flex-shrink-0 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="w-4 h-1 bg-indigo-500 rounded-full"></span>
              <span className="w-2 h-1 bg-indigo-500/50 rounded-full"></span>
            </div>
            TaskFlow
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full ml-1 border border-slate-300 dark:border-slate-700">
              {filteredTasks.length}
            </span>
          </h2>
          
          <button
            onClick={onAddNewTask}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95 border border-indigo-400/20"
            title="Create New Task"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2">
           {/* Project Filter */}
           <div className="flex-1 relative min-w-0">
             <select
               value={filterProject}
               onChange={(e) => setFilterProject(e.target.value)}
               className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-lg pl-3 pr-6 py-2 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer truncate"
             >
               <option value="all">All Projects</option>
               {Object.values(PROJECT_CONFIG).map((proj) => (
                 <option key={proj.name} value={proj.name}>{proj.name}</option>
               ))}
             </select>
             <Filter size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
           </div>

           {/* Status Filter */}
           <div className="flex-1 relative min-w-0">
             <select
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
               className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-lg pl-3 pr-6 py-2 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer truncate"
             >
               <option value="all">All Status</option>
               {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                 <option key={key} value={key}>{config.label}</option>
               ))}
             </select>
             <Filter size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
           </div>

           {/* Deadline Filter */}
           <div className="flex-1 relative min-w-0">
             <select
               value={filterDeadline}
               onChange={(e) => setFilterDeadline(e.target.value)}
               className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-lg pl-3 pr-6 py-2 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer truncate"
             >
               <option value="all">Any Time</option>
               <option value="due-soon">Due Soon (3 Days)</option>
               <option value="overdue">Overdue</option>
             </select>
             <Clock size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
           </div>

           {isFiltered && (
             <button 
               onClick={clearFilters}
               className="p-2 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors flex-shrink-0"
               title="Clear Filters"
             >
               <X size={14} />
             </button>
           )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
        {!isFiltered ? (
          <Reorder.Group 
            axis="y" 
            values={tasks} 
            onReorder={setTasks} 
            className="space-y-3"
            layoutScroll
          >
            <AnimatePresence initial={false} mode="popLayout">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isSelected={selectedTaskId === task.id}
                  onSelect={onSelectTask}
                  isDragEnabled={true}
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>
        ) : (
          <div className="space-y-3">
             <AnimatePresence initial={false} mode="popLayout">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isSelected={selectedTaskId === task.id}
                    onSelect={onSelectTask}
                    isDragEnabled={false}
                  />
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-center py-10 text-slate-500 text-sm"
                >
                  No tasks match current filters.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
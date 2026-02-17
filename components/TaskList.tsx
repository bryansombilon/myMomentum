
import React, { useState, useMemo, useRef } from 'react';
import { Reorder, useDragControls, motion, AnimatePresence } from 'framer-motion';
import { Task, ProjectType } from '../types';
import { PROJECT_CONFIG, STATUS_CONFIG } from '../constants';
import { Calendar, GripVertical, Plus, Search, Filter, Clock, Flag, Briefcase, Activity, ChevronLeft, Menu, FileUp, AlertCircle, Check, X, Trash2 } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  selectedTaskId: string | null;
  onSelectTask: (task: Task) => void;
  onAddNewTask: () => void;
  onDeleteTask: (taskId: string) => void;
}

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onSelect: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isDragEnabled: boolean;
}

const SPRING_TRANSITION = { 
  type: "spring" as const, 
  stiffness: 450, 
  damping: 38, 
  mass: 0.8 
};

const STATUS_PRIORITY: Record<string, number> = {
  'follow-up': 0,
  'under-review': 1,
  'todo': 2,
  'in-progress': 3,
  'watcher': 4,
  'on-hold': 5,
  'done': 6
};

const safeFormatDate = (date: Date | string | number, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  try {
    return new Intl.DateTimeFormat('en-US', options).format(d);
  } catch (e) {
    return 'Error Date';
  }
};

const MAP_CSV_STATUS = (status: string): Task['status'] => {
  const s = (status || '').toLowerCase().replace(/[\s-]/g, '');
  if (s.includes('follow')) return 'follow-up';
  if (s.includes('review')) return 'under-review';
  if (s.includes('todo')) return 'todo';
  if (s.includes('progress')) return 'in-progress';
  if (s.includes('watch')) return 'watcher';
  if (s.includes('hold')) return 'on-hold';
  if (s.includes('done') || s.includes('complete')) return 'done';
  return 'todo';
};

const TaskItem: React.FC<TaskItemProps> = React.memo(({ 
  task, 
  isSelected, 
  onSelect,
  onDelete,
  isDragEnabled
}) => {
  const controls = useDragControls();
  const statusStyle = STATUS_CONFIG[task.status] || STATUS_CONFIG['todo'];
  const isUrgent = task.priority === 'urgent';
  const deadlineDate = new Date(task.deadline);
  const isValidDate = !isNaN(deadlineDate.getTime());
  const isOverdue = isValidDate && deadlineDate < new Date() && task.status !== 'done';
  
  const handleDelete = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete task "${task.title}"?`)) {
      onDelete(task.id);
    }
  };

  const Content = (
    <>
      <div className={`w-[4px] ${statusStyle.color} shrink-0`} />
      <div className="flex-1 p-3.5 flex flex-col min-w-0 gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PROJECT_CONFIG[task.project].color }} />
            <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 truncate">
              {PROJECT_CONFIG[task.project].name}
            </span>
            {isUrgent && (
              <span className="text-[9px] font-bold uppercase text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-500/20">
                Urgent
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            <button 
              type="button"
              onClick={handleDelete}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none"
              title="Delete Task"
            >
              <Trash2 size={14} />
            </button>
            {isDragEnabled && (
              <div 
                onPointerDown={(e) => controls.start(e)} 
                className="text-slate-300 dark:text-slate-600 cursor-grab active:cursor-grabbing p-1.5 touch-none hover:text-indigo-500 transition-colors"
              >
                <GripVertical size={14} />
              </div>
            )}
          </div>
        </div>

        <h3 className={`font-semibold text-[14px] leading-tight break-words ${isSelected ? 'text-indigo-950 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
          {task.title}
        </h3>

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">
            <Calendar size={12} />
            <span className={isOverdue ? 'text-red-500' : ''}>
              {safeFormatDate(task.deadline)}
            </span>
          </div>
          <div className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${statusStyle.color} ${statusStyle.text}`}>
            {statusStyle.label}
          </div>
        </div>
      </div>
    </>
  );

  const containerClasses = `
    relative group border cursor-pointer select-none overflow-hidden rounded-xl flex mb-2
    ${isSelected 
      ? 'bg-white dark:bg-slate-800 border-indigo-500 dark:border-indigo-400 shadow-lg shadow-indigo-500/10 z-10' 
      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'}
  `;

  const itemVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  if (isDragEnabled) {
    return (
      <Reorder.Item 
        value={task} 
        id={task.id} 
        dragListener={false} 
        dragControls={controls} 
        className={containerClasses} 
        onClick={() => onSelect(task)}
        layout
        variants={itemVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover={{ 
          scale: isSelected ? 1 : 1.015,
        }}
        whileTap={{ scale: 0.98 }}
        whileDrag={{ 
          scale: 1.04,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          zIndex: 50
        }}
        transition={SPRING_TRANSITION}
      >
        {Content}
      </Reorder.Item>
    );
  }

  return (
    <motion.div 
      layout
      className={containerClasses} 
      onClick={() => onSelect(task)}
      variants={itemVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={SPRING_TRANSITION}
    >
      {Content}
    </motion.div>
  );
});

export const TaskList: React.FC<TaskListProps> = ({ tasks, setTasks, selectedTaskId, onSelectTask, onAddNewTask, onDeleteTask }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filterPriorityValue, setFilterPriority] = useState('all');
  const [filterTime, setFilterTime] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [duplicateSummary, setDuplicateSummary] = useState<{ duplicates: any[], unique: any[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const q = (searchQuery || '').toLowerCase();
      const matchSearch = !searchQuery || 
        (task.title || '').toLowerCase().includes(q) || 
        (task.clickupLink && task.clickupLink.toLowerCase().includes(q));
      
      const matchStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchProject = filterProject === 'all' || task.project === filterProject;
      const matchPriority = filterPriorityValue === 'all' || task.priority === filterPriorityValue;

      let matchTime = true;
      if (filterTime !== 'all') {
        const deadline = new Date(task.deadline);
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        if (!isNaN(deadline.getTime())) {
          if (filterTime === 'overdue') {
            matchTime = deadline < startOfDay && task.status !== 'done';
          } else if (filterTime === 'today') {
            matchTime = deadline >= startOfDay && deadline <= endOfDay;
          } else if (filterTime === 'week') {
            const nextWeek = new Date(startOfDay);
            nextWeek.setDate(nextWeek.getDate() + 7);
            matchTime = deadline >= startOfDay && deadline <= nextWeek;
          }
        } else {
          matchTime = filterTime === 'all';
        }
      }

      return matchSearch && matchStatus && matchProject && matchPriority && matchTime;
    }).sort((a, b) => {
      const priorityA = STATUS_PRIORITY[a.status] ?? 99;
      const priorityB = STATUS_PRIORITY[b.status] ?? 99;
      if (priorityA !== priorityB) return priorityA - priorityB;
      const dateA = new Date(a.deadline).getTime();
      const dateB = new Date(b.deadline).getTime();
      return (isNaN(dateA) ? Infinity : dateA) - (isNaN(dateB) ? Infinity : dateB);
    });
  }, [tasks, searchQuery, filterStatus, filterProject, filterPriorityValue, filterTime]);

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length === 0) return;

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const idIdx = headers.findIndex(h => h.includes('id'));
      const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('title'));
      const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('due'));
      const statusIdx = headers.findIndex(h => h.includes('status'));

      if (idIdx === -1 || nameIdx === -1) {
        alert("Could not find required columns (Task ID, Task Name) in CSV headers.");
        return;
      }

      const parsedItems = lines.slice(1).map(line => {
        const cols = line.split(',');
        const clickupId = (cols[idIdx] || '').trim();
        const title = (cols[nameIdx] || '').trim() || 'Untitled Task';
        const deadlineStr = dateIdx !== -1 ? (cols[dateIdx] || '').trim() : '';
        const csvStatus = statusIdx !== -1 ? (cols[statusIdx] || '').trim() : 'todo';
        
        let deadline = new Date(deadlineStr);
        if (isNaN(deadline.getTime())) {
          deadline = new Date();
        }
        
        return {
          clickupId,
          title,
          deadline,
          status: MAP_CSV_STATUS(csvStatus)
        };
      });

      const uniqueItems: any[] = [];
      const duplicateItems: any[] = [];

      parsedItems.forEach(item => {
        const isDuplicate = tasks.some(t => {
          const existingId = (t.clickupLink || '').replace(/.*\/t\//, '');
          return existingId && existingId === item.clickupId;
        });
        if (isDuplicate) duplicateItems.push(item);
        else uniqueItems.push(item);
      });

      if (duplicateItems.length > 0) {
        setDuplicateSummary({ unique: uniqueItems, duplicates: duplicateItems });
      } else {
        finalizeImport(uniqueItems);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const finalizeImport = (newItems: any[]) => {
    const tasksToAdd = newItems.map(item => ({
      id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: item.title,
      description: 'Imported via CSV',
      deadline: item.deadline,
      clickupLink: item.clickupId ? `https://app.clickup.com/t/${item.clickupId}` : '',
      project: ProjectType.GALA,
      updates: [],
      status: item.status,
      priority: 'not-urgent' as any
    }));

    setTasks([...tasksToAdd, ...tasks]);
    setDuplicateSummary(null);
  };

  const isFiltered = searchQuery !== '' || filterStatus !== 'all' || filterProject !== 'all' || filterPriorityValue !== 'all' || filterTime !== 'all';

  const handleSelectTask = (task: Task) => {
    onSelectTask(task);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className={`relative h-full flex flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-full md:w-80' : 'w-0 overflow-hidden md:w-16'}`}>
      <div className={`flex-1 flex flex-col h-full ${!isSidebarOpen && 'md:opacity-0'}`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
          <h2 className="text-xl md:text-2xl font-bold uppercase bg-clip-text text-transparent bg-gradient-to-br from-indigo-500 to-blue-600 truncate mr-2">TaskFlow</h2>
          <div className="flex gap-1 md:gap-2 shrink-0">
              <input type="file" ref={fileInputRef} onChange={handleCsvImport} accept=".csv" className="hidden" />
              <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 md:p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                  title="Import CSV"
              >
                  <FileUp size={16} />
              </button>
              <button 
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-1.5 md:p-2 rounded-md transition-all border ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-inner' : 'bg-white border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700'}`}
                  title="Toggle Filters"
              >
                  <Filter size={16} />
              </button>
              <button type="button" onClick={onAddNewTask} className="p-1.5 md:p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md shadow transition-transform active:scale-95">
                  <Plus size={16} strokeWidth={2} />
              </button>
              <button type="button" onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1.5 text-slate-500 bg-white border border-slate-200 rounded-md">
                  <ChevronLeft size={16} />
              </button>
          </div>
        </div>

        <div className="p-4 space-y-4 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-2 text-[13px] font-semibold focus:border-indigo-500 outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
            />
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 overflow-hidden"
              >
                <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <Activity size={10} /> Status
                    </label>
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-[11px] font-bold outline-none cursor-pointer focus:border-indigo-500 dark:text-slate-200"
                    >
                        <option value="all">All Statuses</option>
                        <option value="follow-up">Follow Up</option>
                        <option value="under-review">Under Review</option>
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="watcher">Watcher</option>
                        <option value="on-hold">On Hold</option>
                        <option value="done">Done</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <Briefcase size={10} /> Project
                    </label>
                    <select 
                        value={filterProject} 
                        onChange={(e) => setFilterProject(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-[11px] font-bold outline-none cursor-pointer focus:border-indigo-500 dark:text-slate-200"
                    >
                        <option value="all">All Projects</option>
                        {Object.values(ProjectType).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                            <Flag size={10} /> Priority
                        </label>
                        <select 
                            value={filterPriorityValue} 
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-[11px] font-bold outline-none cursor-pointer focus:border-indigo-500 dark:text-slate-200"
                        >
                            <option value="all">Any</option>
                            <option value="urgent">Urgent</option>
                            <option value="not-urgent">Normal</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                            <Clock size={10} /> Schedule
                        </label>
                        <select 
                            value={filterTime} 
                            onChange={(e) => setFilterTime(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-[11px] font-bold outline-none cursor-pointer focus:border-indigo-500 dark:text-slate-200"
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
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-32 space-y-1 relative scroll-smooth overscroll-contain no-scrollbar">
          {!isFiltered ? (
            <Reorder.Group 
              axis="y" 
              values={filteredTasks} 
              onReorder={(newOrder) => {
                setTasks(newOrder);
              }} 
              className="space-y-1"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredTasks.map((task) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    isSelected={selectedTaskId === task.id} 
                    onSelect={handleSelectTask} 
                    onDelete={onDeleteTask}
                    isDragEnabled={true} 
                  />
                ))}
              </AnimatePresence>
            </Reorder.Group>
          ) : (
            <div className="space-y-1">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredTasks.map((task) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    isSelected={selectedTaskId === task.id} 
                    onSelect={handleSelectTask} 
                    onDelete={onDeleteTask}
                    isDragEnabled={false} 
                  />
                ))}
              </AnimatePresence>
              {filteredTasks.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600 text-center"
                  >
                      <Search size={32} className="mb-4 opacity-10" />
                      <p className="text-[10px] font-bold uppercase">No Matches</p>
                  </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {duplicateSummary && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Import Summary</h3>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">Found {duplicateSummary.duplicates.length} Duplicate Task IDs</p>
                </div>
                <button type="button" onClick={() => setDuplicateSummary(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex gap-4">
                  <AlertCircle className="text-amber-600 shrink-0" size={20} />
                  <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                    The following task IDs already exist in your system. Would you like to import them anyway, or only the {duplicateSummary.unique.length} new tasks?
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Duplicate IDs</h4>
                  <div className="space-y-2">
                    {duplicateSummary.duplicates.slice(0, 5).map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate pr-4">{d.title}</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">#{d.clickupId}</span>
                      </div>
                    ))}
                    {duplicateSummary.duplicates.length > 5 && (
                      <p className="text-[10px] text-slate-400 text-center uppercase font-bold tracking-widest">+ {duplicateSummary.duplicates.length - 5} others</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                <button 
                  type="button"
                  onClick={() => finalizeImport(duplicateSummary.unique)} 
                  className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all"
                >
                  Import New Only ({duplicateSummary.unique.length})
                </button>
                <button 
                  type="button"
                  onClick={() => finalizeImport([...duplicateSummary.unique, ...duplicateSummary.duplicates])} 
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  Import All ({duplicateSummary.unique.length + duplicateSummary.duplicates.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {!isSidebarOpen && (
        <button 
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="hidden md:flex absolute top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md text-slate-500 hover:text-indigo-600 transition-all"
        >
          <Menu size={20} />
        </button>
      )}

      {!isSidebarOpen && (
        <button 
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-lg"
        >
          <Menu size={20} />
        </button>
      )}
    </div>
  );
};

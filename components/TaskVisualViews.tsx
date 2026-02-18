
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, ProjectType, Priority } from '../types';
import { STATUS_CONFIG, PROJECT_CONFIG } from '../constants';
import { 
  Table as TableIcon, Calendar as CalendarIcon, 
  ChevronRight, ArrowRight, Trash2, CheckCircle2,
  Clock, AlertTriangle, Search, X, Filter, Briefcase, Activity, Flag
} from 'lucide-react';

interface ViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export const KanbanView: React.FC<ViewProps> = ({ tasks, onSelectTask, onStatusChange, onDeleteTask }) => {
  const columns: (Task['status'])[] = ['todo', 'in-progress', 'under-review', 'done'];
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

  // Filter state
  const [projectFilter, setProjectFilter] = useState('all');
  const [deadlineFilter, setDeadlineFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Helper for week boundaries (Sunday to Saturday)
    const getWeekBoundaries = (date: Date) => {
      const start = new Date(date);
      start.setDate(date.getDate() - date.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    };

    const thisWeek = getWeekBoundaries(startOfToday);
    const nextWeekStart = new Date(thisWeek.end);
    nextWeekStart.setMilliseconds(nextWeekStart.getMilliseconds() + 1);
    const nextWeek = getWeekBoundaries(nextWeekStart);

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    return tasks.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchProject = projectFilter === 'all' || t.project === projectFilter;
      
      let matchDeadline = true;
      const deadline = new Date(t.deadline);
      if (deadlineFilter !== 'all') {
        if (isNaN(deadline.getTime())) {
          matchDeadline = false;
        } else {
          switch (deadlineFilter) {
            case 'today':
              matchDeadline = deadline >= startOfToday && deadline <= endOfToday;
              break;
            case 'this-week':
              matchDeadline = deadline >= thisWeek.start && deadline <= thisWeek.end;
              break;
            case 'next-week':
              matchDeadline = deadline >= nextWeek.start && deadline <= nextWeek.end;
              break;
            case 'this-month':
              matchDeadline = deadline >= startOfThisMonth && deadline <= endOfThisMonth;
              break;
            case 'overdue':
              matchDeadline = deadline < startOfToday && t.status !== 'done';
              break;
          }
        }
      }

      return matchSearch && matchProject && matchDeadline;
    });
  }, [tasks, projectFilter, deadlineFilter, searchQuery]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.4';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTaskId(null);
    setDragOverStatus(null);
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  const handleDrop = (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onStatusChange(taskId, newStatus);
    }
    setDragOverStatus(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Kanban Filter Bar */}
      <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 shrink-0 transition-colors">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search board..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-slate-200"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Project Filter */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
             <Briefcase size={12} className="text-slate-400" />
             <select 
               value={projectFilter}
               onChange={(e) => setProjectFilter(e.target.value)}
               className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none text-slate-600 dark:text-slate-300 border-none focus:ring-0 p-0 cursor-pointer"
             >
               <option value="all">All Projects</option>
               {Object.values(ProjectType).map(p => <option key={p} value={p}>{p}</option>)}
             </select>
          </div>

          {/* Deadline Filter */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
             <Clock size={12} className="text-slate-400" />
             <select 
               value={deadlineFilter}
               onChange={(e) => setDeadlineFilter(e.target.value)}
               className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none text-slate-600 dark:text-slate-300 border-none focus:ring-0 p-0 cursor-pointer"
             >
               <option value="all">Any Deadline</option>
               <option value="today">Today</option>
               <option value="this-week">This Week</option>
               <option value="next-week">Next Week</option>
               <option value="this-month">This Month</option>
               <option value="overdue">Overdue</option>
             </select>
          </div>

          <div className="ml-auto hidden sm:block">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{filteredTasks.length} Visible</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex h-full gap-6 overflow-x-auto p-6 pb-20 no-scrollbar select-none">
        {columns.map(status => {
          const columnTasks = filteredTasks.filter(t => t.status === status);
          const config = STATUS_CONFIG[status];
          const isOver = dragOverStatus === status;
          
          return (
            <div 
              key={status} 
              className={`flex-shrink-0 w-80 flex flex-col rounded-2xl transition-all duration-200 ${isOver ? 'bg-indigo-50/50 dark:bg-indigo-500/5 ring-2 ring-indigo-500/20' : ''}`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={() => setDragOverStatus(null)}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex items-center justify-between mb-4 px-2 pt-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {config.label}
                  </h3>
                  <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3 p-1 min-h-[200px]">
                <AnimatePresence mode="popLayout">
                  {columnTasks.map(task => (
                    <motion.div 
                      key={task.id} 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onSelectTask(task)}
                      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-500/50 transition-colors group relative ${draggedTaskId === task.id ? 'z-50' : 'z-10'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PROJECT_CONFIG[task.project].color }} />
                        <span className="text-[9px] font-bold uppercase text-slate-400 tracking-tighter truncate">{task.project}</span>
                        {task.priority === 'urgent' && <AlertTriangle size={10} className="text-red-500" />}
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight mb-3 line-clamp-2">
                        {task.title}
                      </h4>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                          <Clock size={12} />
                          {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'done'); }} className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg">
                            <CheckCircle2 size={14} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {columnTasks.length === 0 && (
                  <div className={`h-32 border-2 border-dashed rounded-2xl flex items-center justify-center transition-colors ${isOver ? 'border-indigo-500/50 text-indigo-500' : 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 opacity-20'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {isOver ? 'Drop Here' : 'Empty'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const TableView: React.FC<ViewProps> = ({ tasks, onSelectTask, onStatusChange, onDeleteTask, onUpdateTask }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const q = filterQuery.toLowerCase();
      const matchText = t.title.toLowerCase().includes(q) || 
                        t.description.toLowerCase().includes(q) ||
                        t.clickupLink.toLowerCase().includes(q);
      
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchProject = projectFilter === 'all' || t.project === projectFilter;
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;

      let matchTime = true;
      if (timeFilter !== 'all') {
        const deadline = new Date(t.deadline);
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        if (!isNaN(deadline.getTime())) {
          if (timeFilter === 'overdue') {
            matchTime = deadline < startOfDay && t.status !== 'done';
          } else if (timeFilter === 'today') {
            matchTime = deadline >= startOfDay && deadline <= endOfDay;
          } else if (timeFilter === 'week') {
            const nextWeek = new Date(startOfDay);
            nextWeek.setDate(nextWeek.getDate() + 7);
            matchTime = deadline >= startOfDay && deadline <= nextWeek;
          }
        } else {
          matchTime = timeFilter === 'all';
        }
      }

      return matchText && matchStatus && matchProject && matchPriority && matchTime;
    });
  }, [tasks, filterQuery, statusFilter, projectFilter, priorityFilter, timeFilter]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search tasks..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-slate-200"
          />
          {filterQuery && (
            <button onClick={() => setFilterQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
             <Activity size={12} className="text-slate-400" />
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none text-slate-600 dark:text-slate-300 border-none focus:ring-0 p-0"
             >
               <option value="all">All Statuses</option>
               {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                 <option key={val} value={val}>{cfg.label}</option>
               ))}
             </select>
          </div>

          {/* Project Filter */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
             <Briefcase size={12} className="text-slate-400" />
             <select 
               value={projectFilter}
               onChange={(e) => setProjectFilter(e.target.value)}
               className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none text-slate-600 dark:text-slate-300 border-none focus:ring-0 p-0"
             >
               <option value="all">All Projects</option>
               {Object.values(ProjectType).map(p => <option key={p} value={p}>{p}</option>)}
             </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
             <Flag size={12} className="text-slate-400" />
             <select 
               value={priorityFilter}
               onChange={(e) => setPriorityFilter(e.target.value)}
               className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none text-slate-600 dark:text-slate-300 border-none focus:ring-0 p-0"
             >
               <option value="all">All Priorities</option>
               <option value="urgent">Urgent</option>
               <option value="not-urgent">Normal</option>
             </select>
          </div>

          {/* Time Filter */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
             <Clock size={12} className="text-slate-400" />
             <select 
               value={timeFilter}
               onChange={(e) => setTimeFilter(e.target.value)}
               className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none text-slate-600 dark:text-slate-300 border-none focus:ring-0 p-0"
             >
               <option value="all">All Time</option>
               <option value="overdue">Overdue</option>
               <option value="today">Today</option>
               <option value="week">This Week</option>
             </select>
          </div>

          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-auto">{filteredTasks.length} Entries</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 pb-32 no-scrollbar">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="w-1/3 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">Task Protocol</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">Project</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">Priority</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">Deadline</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">Status</th>
                <th className="w-24 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTasks.map(task => {
                const statusConfig = STATUS_CONFIG[task.status];
                return (
                  <tr 
                    key={task.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <input 
                          value={task.title}
                          onChange={(e) => onUpdateTask(task.id, { title: e.target.value })}
                          className="font-bold text-sm text-slate-800 dark:text-slate-100 bg-transparent border-none focus:ring-0 focus:outline-none w-full p-0"
                        />
                        <input 
                          value={task.description}
                          placeholder="Add description..."
                          onChange={(e) => onUpdateTask(task.id, { description: e.target.value })}
                          className="text-[10px] font-medium text-slate-400 bg-transparent border-none focus:ring-0 focus:outline-none w-full p-0"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={task.project}
                        onChange={(e) => onUpdateTask(task.id, { project: e.target.value as ProjectType })}
                        className="bg-transparent border-none text-[11px] font-bold uppercase tracking-tight focus:ring-0 outline-none cursor-pointer"
                        style={{ color: PROJECT_CONFIG[task.project].color }}
                      >
                        {Object.values(ProjectType).map(p => <option key={p} value={p} className="text-slate-800 dark:text-slate-100">{p}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={task.priority}
                        onChange={(e) => onUpdateTask(task.id, { priority: e.target.value as Priority })}
                        className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase bg-transparent border border-transparent focus:ring-0 outline-none cursor-pointer transition-colors ${task.priority === 'urgent' ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 border-red-200' : 'text-slate-500'}`}
                      >
                        <option value="not-urgent">Normal</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="date"
                        value={new Date(task.deadline).toISOString().split('T')[0]}
                        onChange={(e) => onUpdateTask(task.id, { deadline: new Date(e.target.value) })}
                        className="bg-transparent border-none text-[11px] font-bold text-slate-500 dark:text-slate-400 focus:ring-0 outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-block px-3 py-1.5 rounded-full ${statusConfig.color} shadow-sm border border-black/5`}>
                        <select 
                          value={task.status}
                          onChange={(e) => onStatusChange(task.id, e.target.value as any)}
                          className={`bg-transparent border-none text-[10px] font-black uppercase cursor-pointer p-0 focus:ring-0 outline-none ${statusConfig.text}`}
                        >
                          {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                            <option key={val} value={val} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{cfg.label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onSelectTask(task)}
                          className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredTasks.length === 0 && (
            <div className="py-20 text-center text-slate-400 opacity-30">
              <span className="text-sm font-bold uppercase tracking-widest">No Matches Found</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const TaskCalendarView: React.FC<ViewProps> = ({ tasks, onSelectTask }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const calendarDays = useMemo(() => {
    const totalDays = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);
    return days;
  }, [currentDate]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(t => {
      const d = new Date(t.deadline);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  return (
    <div className="h-full flex flex-col p-8 pb-32 no-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          {currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><ArrowRight className="rotate-180" size={16} /></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest">Today</button>
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><ArrowRight size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl flex-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="bg-slate-50 dark:bg-slate-900 p-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {d}
          </div>
        ))}
        {calendarDays.map((day, idx) => {
          const dateKey = day ? `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}` : '';
          const dayTasks = day ? tasksByDate[dateKey] || [] : [];
          const isToday = day && new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

          return (
            <div key={idx} className={`bg-white dark:bg-slate-900 p-3 min-h-[140px] flex flex-col gap-2 transition-colors ${day ? 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30' : ''}`}>
              {day && (
                <>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-black ${isToday ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 dark:text-slate-700'}`}>
                    {day}
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    {dayTasks.map(t => (
                      <div 
                        key={t.id} 
                        onClick={() => onSelectTask(t)}
                        className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[9px] font-bold truncate flex items-center gap-1.5 cursor-pointer hover:border-indigo-500/50 transition-all"
                      >
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: PROJECT_CONFIG[t.project].color }} />
                        <span className="truncate text-slate-700 dark:text-slate-300 uppercase tracking-tighter">{t.title}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

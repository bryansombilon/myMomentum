
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventActivity, ProjectType, Task } from '../types';
import { PROJECT_CONFIG } from '../constants';
import { 
  Plus, Calendar as CalendarIcon, List as ListIcon, Trash2, 
  ChevronLeft, ChevronRight, Rocket,
  Pencil, X, CalendarDays as CalendarDaysIcon, Briefcase, ChevronDown,
  ArrowRight, AlignLeft, CheckSquare, ExternalLink, Calendar as CalendarIconLucide,
  Layers, Menu
} from 'lucide-react';

interface MakersAndMoversAppProps {
  activities: EventActivity[];
  tasks: Task[];
  onSaveActivities: (activities: EventActivity[]) => void;
  onNavigateToTask?: (taskId: string) => void;
}

// Unified interface for calendar display
interface CalendarDisplayItem {
  id: string;
  title: string;
  details: string;
  dateStr: string; // The specific day it appears on
  project: ProjectType;
  type: 'activity' | 'task';
  status: string;
  originalItem: EventActivity | Task;
}

/**
 * Helper to get YYYY-MM-DD string from a Date object using local time parts.
 */
const formatLocalYMD = (date: Date | string | number) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const MakersAndMoversApp: React.FC<MakersAndMoversAppProps> = ({ activities, tasks, onSaveActivities, onNavigateToTask }) => {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<EventActivity | null>(null);
  const [focusedDate, setFocusedDate] = useState<string | null>(null);
  const [activeProjectFilter, setActiveProjectFilter] = useState<ProjectType | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<'all' | 'activity' | 'task'>('all');

  // Form State for Activities
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [startDate, setStartDate] = useState(formatLocalYMD(new Date()));
  const [endDate, setEndDate] = useState(formatLocalYMD(new Date()));
  const [project, setProject] = useState<ProjectType>(ProjectType.MAKERS_MOVERS);
  const [status, setStatus] = useState<EventActivity['status']>('planned');

  const todayStr = useMemo(() => formatLocalYMD(new Date()), []);

  const openModal = (activity?: EventActivity, defaultDate?: string) => {
    if (activity) {
      setEditingActivity(activity);
      setTitle(activity.title);
      setDetails(activity.details);
      setStartDate(formatLocalYMD(activity.startDate));
      setEndDate(formatLocalYMD(activity.endDate));
      setProject(activity.project);
      setStatus(activity.status);
    } else {
      setEditingActivity(null);
      setTitle('');
      setDetails('');
      const dateVal = defaultDate || formatLocalYMD(new Date());
      setStartDate(dateVal);
      setEndDate(dateVal);
      setProject(ProjectType.MAKERS_MOVERS);
      setStatus('planned');
    }
    setShowModal(true);
  };

  // Convert tasks and activities into a flat list
  const allItems = useMemo(() => {
    const activityItems: CalendarDisplayItem[] = activities.map(a => ({
      id: a.id,
      title: a.title,
      details: a.details,
      dateStr: formatLocalYMD(a.startDate),
      project: a.project,
      type: 'activity',
      status: a.status,
      originalItem: a
    }));

    const taskItems: CalendarDisplayItem[] = tasks.map(t => ({
      id: t.id,
      title: t.title,
      details: t.description,
      dateStr: formatLocalYMD(t.deadline),
      project: t.project,
      type: 'task',
      status: t.status,
      originalItem: t
    }));

    return [...activityItems, ...taskItems].filter(item => {
      const matchProject = activeProjectFilter === 'All' || item.project === activeProjectFilter;
      const matchType = typeFilter === 'all' || item.type === typeFilter;
      return matchProject && matchType;
    });
  }, [activities, tasks, activeProjectFilter, typeFilter]);

  const sortedListItems = useMemo(() => {
    return [...allItems].sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  }, [allItems]);

  // Group items by month for the list view
  const groupedListItems = useMemo(() => {
    const groups: { monthYear: string; items: CalendarDisplayItem[] }[] = [];
    sortedListItems.forEach(item => {
      const [y, m, d] = item.dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.monthYear === monthYear) {
        lastGroup.items.push(item);
      } else {
        groups.push({ monthYear, items: [item] });
      }
    });
    return groups;
  }, [sortedListItems]);

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) return;

    const activityData: EventActivity = {
      id: editingActivity?.id || Date.now().toString(),
      title,
      details,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      project,
      status
    };

    if (editingActivity) {
      onSaveActivities(activities.map(a => a.id === editingActivity.id ? activityData : a));
    } else {
      onSaveActivities([...activities, activityData]);
    }
    
    setShowModal(false);
    setEditingActivity(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this activity?')) {
      onSaveActivities(activities.filter(a => a.id !== id));
    }
  };

  // Calendar Logic
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const calendarDays = useMemo(() => {
    const totalDays = daysInMonth(currentMonth);
    const firstDay = firstDayOfMonth(currentMonth);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);
    return days;
  }, [currentMonth]);

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const getItemsForDate = (dateStr: string) => {
    return allItems.filter(item => {
      if (item.type === 'task') return item.dateStr === dateStr;
      const act = item.originalItem as EventActivity;
      const start = formatLocalYMD(act.startDate);
      const end = formatLocalYMD(act.endDate);
      return dateStr >= start && dateStr <= end;
    });
  };

  const focusedDateItems = useMemo(() => {
    if (!focusedDate) return [];
    return getItemsForDate(focusedDate);
  }, [allItems, focusedDate]);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="px-4 md:px-8 py-4 md:py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between transition-colors shrink-0 gap-4">
          <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
            <div className="p-2 md:p-3 bg-purple-600 rounded-xl text-white shadow-lg shadow-purple-500/20 shrink-0">
              <CalendarDaysIcon size={20} className="md:size-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight truncate">Activities</h1>
              <p className="hidden md:block text-[10px] font-semibold uppercase tracking-widest text-slate-400">Integrated EventFlow & TaskFlow</p>
            </div>
            <button 
              onClick={() => openModal()}
              className="md:hidden ml-auto p-2.5 bg-purple-600 text-white rounded-xl"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto overflow-x-auto no-scrollbar py-1 md:py-0">
             <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shrink-0">
               <button 
                 onClick={() => setView('calendar')}
                 className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'calendar' ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 Calendar
               </button>
               <button 
                 onClick={() => setView('list')}
                 className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'list' ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 List
               </button>
             </div>

             <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-2 py-1.5 border border-slate-200 dark:border-slate-700 shrink-0">
               <Briefcase size={12} className="text-slate-400" />
               <select 
                 value={activeProjectFilter} 
                 onChange={(e) => setActiveProjectFilter(e.target.value as any)}
                 className="bg-transparent text-[9px] md:text-[11px] font-bold uppercase tracking-widest outline-none text-slate-600 dark:text-slate-300"
               >
                 <option value="All">Projects</option>
                 {Object.values(ProjectType).map(p => <option key={p} value={p}>{p}</option>)}
               </select>
             </div>
            
            <button 
              onClick={() => openModal()}
              className="hidden md:flex p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-95"
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto no-scrollbar transition-all ${view === 'calendar' ? 'p-0' : 'p-4 md:p-8 pb-40'}`}>
          <AnimatePresence mode="wait">
            {view === 'calendar' ? (
              <motion.div key="calendar-v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col p-4 md:p-8 pb-32">
                <div className="flex items-center justify-between mb-6 px-2">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                    {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentMonth)}
                  </h2>
                  <div className="flex items-center gap-1 md:gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-slate-200 rounded-lg"><ChevronLeft size={18} /></button>
                    <button onClick={() => setCurrentMonth(new Date())} className="px-2 py-1 text-[8px] md:text-[10px] font-bold uppercase tracking-widest bg-white dark:bg-slate-800 border border-slate-200 rounded-lg">Today</button>
                    <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-slate-200 rounded-lg"><ChevronRight size={18} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 rounded-2xl md:rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-slate-50 dark:bg-slate-900 p-2 md:p-4 text-center text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {day[0]}
                    </div>
                  ))}
                  {calendarDays.map((day, i) => {
                    const dateObj = day ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) : null;
                    const dateStr = dateObj ? formatLocalYMD(dateObj) : '';
                    const dayItems = day ? getItemsForDate(dateStr) : [];
                    const activityCount = dayItems.length;
                    const isToday = dateStr === todayStr;
                    
                    return (
                      <div 
                        key={i} 
                        onClick={() => dateStr && (setFocusedDate(dateStr), setShowDayModal(true))}
                        className={`bg-white dark:bg-slate-900 min-h-[80px] md:min-h-[140px] p-2 md:p-4 border-t border-slate-100 dark:border-slate-800 group relative transition-colors ${dateStr ? 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer' : ''} ${isToday ? 'bg-indigo-50/20' : ''}`}
                      >
                        {day && (
                          <>
                            <div className="flex items-center justify-between mb-1 md:mb-2">
                              <span className={`text-[10px] md:text-sm font-semibold flex items-center justify-center ${isToday ? 'bg-indigo-600 text-white w-5 h-5 md:w-7 md:h-7 rounded-full' : 'text-slate-300 dark:text-slate-700'}`}>
                                {day}
                              </span>
                            </div>
                            <div className="space-y-1 md:space-y-1.5 pointer-events-none">
                              {dayItems.slice(0, 3).map(item => (
                                <div key={item.id} className="h-1.5 md:h-2 rounded-full w-full opacity-60 md:opacity-100" style={{ backgroundColor: PROJECT_CONFIG[item.project].color }} />
                              ))}
                              {activityCount > 3 && <div className="hidden md:block text-[8px] text-slate-400 pl-1 uppercase">+ {activityCount - 3}</div>}
                              {activityCount > 0 && <div className="md:hidden w-1 h-1 bg-slate-300 rounded-full mx-auto" />}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div key="list-v" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto space-y-8 md:space-y-12">
                {groupedListItems.map(group => (
                  <div key={group.monthYear} className="space-y-4 md:space-y-6">
                    <div className="sticky top-0 z-10 py-2 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md">
                      <div className="flex items-center gap-2 md:gap-4">
                        <h3 className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-indigo-600 dark:text-indigo-400">
                          {group.monthYear}
                        </h3>
                        <div className="h-px w-full bg-indigo-500/10" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:gap-4">
                      {group.items.map(item => (
                        <CalendarListItem 
                          key={item.id} 
                          item={item} 
                          onDelete={item.type === 'activity' ? () => handleDelete(item.id) : undefined} 
                          onEdit={item.type === 'activity' ? () => openModal(item.originalItem as EventActivity) : undefined} 
                          onNavigateToTask={onNavigateToTask}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {showDayModal && focusedDate && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-3xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] mb-0 sm:mb-0 pb-12 sm:pb-0">
              <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between shrink-0">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight truncate mr-4">
                  {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(focusedDate.split('-').map(Number)[0], focusedDate.split('-').map(Number)[1] - 1, focusedDate.split('-').map(Number)[2]))}
                </h2>
                <button onClick={() => setShowDayModal(false)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-3 md:space-y-4 no-scrollbar">
                {focusedDateItems.map(item => (
                  <div key={item.id} className="group bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-5 flex items-center gap-3 md:gap-4 relative">
                    <div className="w-1 md:w-1.5 self-stretch rounded-full shrink-0" style={{ backgroundColor: PROJECT_CONFIG[item.project].color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                        <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.project}</span>
                      </div>
                      <h4 className="text-sm md:text-base font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                    </div>
                    {item.type === 'task' && onNavigateToTask && (
                      <button 
                        onClick={() => { setShowDayModal(false); onNavigateToTask(item.id); }}
                        className="p-2 bg-indigo-600 text-white rounded-lg"
                      >
                        <ExternalLink size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] pb-12 sm:pb-0">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between shrink-0">
                 <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">New Activity</h2>
                 <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-200 rounded-lg"><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveActivity} className="p-6 md:p-8 space-y-4 md:space-y-5 overflow-y-auto no-scrollbar">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Title</label>
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none dark:text-white" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Start</label>
                    <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-3 text-xs md:text-sm dark:text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">End</label>
                    <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-3 text-xs md:text-sm dark:text-white" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Project</label>
                  <select value={project} onChange={(e) => setProject(e.target.value as ProjectType)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest dark:text-white">
                    {Object.values(ProjectType).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 md:py-4 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Cancel</button>
                  <button type="submit" className="flex-1 py-3 md:py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl">Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CalendarListItem: React.FC<{ item: CalendarDisplayItem; onDelete?: () => void; onEdit?: () => void; onNavigateToTask?: (id: string) => void }> = ({ item, onDelete, onEdit, onNavigateToTask }) => {
  const projectConfig = PROJECT_CONFIG[item.project];
  const [y, m, d] = item.dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNumber = dateObj.getDate();

  return (
    <motion.div layout className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 md:p-5 rounded-2xl md:rounded-3xl flex items-center gap-4 md:gap-6 shadow-sm transition-all duration-300">
      <div className="absolute top-0 bottom-0 left-0 w-1 md:w-1.5 rounded-l-3xl" style={{ backgroundColor: projectConfig.color }} />
      
      <div className="flex flex-col items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 shrink-0">
        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{dayName}</span>
        <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{dayNumber}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
           <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate max-w-[80px] md:max-w-none">{item.project}</span>
           <div className={`px-2 py-0.5 rounded text-[7px] md:text-[8px] font-black uppercase tracking-widest ml-auto ${item.status === 'completed' || item.status === 'done' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-slate-100 text-slate-500'}`}>
              {item.status}
           </div>
        </div>

        <h3 className="text-sm md:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
          {item.title}
        </h3>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
         {item.type === 'task' && onNavigateToTask && (
           <button onClick={() => onNavigateToTask(item.id)} className="p-2 md:p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl"><ExternalLink size={16} /></button>
         )}
         {onEdit && (
           <button onClick={onEdit} className="p-2 md:p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl"><Pencil size={16} /></button>
         )}
      </div>
    </motion.div>
  );
};

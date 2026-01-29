
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventActivity, ProjectType, Task } from '../types';
import { PROJECT_CONFIG } from '../constants';
import { 
  Plus, Calendar as CalendarIcon, List as ListIcon, Trash2, 
  ChevronLeft, ChevronRight, Rocket,
  Pencil, X, CalendarDays as CalendarDaysIcon, Briefcase, ChevronDown,
  ArrowRight, AlignLeft, CheckSquare, ExternalLink, Calendar as CalendarIconLucide
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

export const MakersAndMoversApp: React.FC<MakersAndMoversAppProps> = ({ activities, tasks, onSaveActivities, onNavigateToTask }) => {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<EventActivity | null>(null);
  const [focusedDate, setFocusedDate] = useState<string | null>(null);
  const [activeProjectFilter, setActiveProjectFilter] = useState<ProjectType | 'All'>('All');

  // Form State for Activities
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [project, setProject] = useState<ProjectType>(ProjectType.MAKERS_MOVERS);
  const [status, setStatus] = useState<EventActivity['status']>('planned');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const openModal = (activity?: EventActivity, defaultDate?: string) => {
    if (activity) {
      setEditingActivity(activity);
      setTitle(activity.title);
      setDetails(activity.details);
      setStartDate(new Date(activity.startDate).toISOString().split('T')[0]);
      setEndDate(new Date(activity.endDate).toISOString().split('T')[0]);
      setProject(activity.project);
      setStatus(activity.status);
    } else {
      setEditingActivity(null);
      setTitle('');
      setDetails('');
      const dateVal = defaultDate || new Date().toISOString().split('T')[0];
      setStartDate(dateVal);
      setEndDate(dateVal);
      setProject(ProjectType.MAKERS_MOVERS);
      setStatus('planned');
    }
    setShowModal(true);
  };

  // Convert tasks and activities into a flat list for calendar logic
  const allItems = useMemo(() => {
    const activityItems: CalendarDisplayItem[] = activities.map(a => {
      return {
        id: a.id,
        title: a.title,
        details: a.details,
        dateStr: new Date(a.startDate).toISOString().split('T')[0],
        project: a.project,
        type: 'activity',
        status: a.status,
        originalItem: a
      };
    });

    const taskItems: CalendarDisplayItem[] = tasks.map(t => ({
      id: t.id,
      title: t.title,
      details: t.description,
      dateStr: new Date(t.deadline).toISOString().split('T')[0],
      project: t.project,
      type: 'task',
      status: t.status,
      originalItem: t
    }));

    return [...activityItems, ...taskItems].filter(item => 
      activeProjectFilter === 'All' || item.project === activeProjectFilter
    );
  }, [activities, tasks, activeProjectFilter]);

  const sortedListItems = useMemo(() => {
    return [...allItems].sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  }, [allItems]);

  // Group items by month for the list view
  const groupedListItems = useMemo(() => {
    const groups: { monthYear: string; items: CalendarDisplayItem[] }[] = [];
    sortedListItems.forEach(item => {
      const date = new Date(item.dateStr);
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
      if (item.type === 'task') {
        return item.dateStr === dateStr;
      } else {
        // For activities, check range
        const act = item.originalItem as EventActivity;
        const start = new Date(act.startDate).toISOString().split('T')[0];
        const end = new Date(act.endDate).toISOString().split('T')[0];
        return dateStr >= start && dateStr <= end;
      }
    });
  };

  const focusedDateItems = useMemo(() => {
    if (!focusedDate) return [];
    return getItemsForDate(focusedDate);
  }, [allItems, focusedDate]);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors">
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600 rounded-xl text-white shadow-lg shadow-purple-500/20">
              <CalendarDaysIcon size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Calendar of Activities</h1>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Integrated EventFlow & TaskFlow</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
               <button 
                 onClick={() => setView('calendar')}
                 className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'calendar' ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 Calendar
               </button>
               <button 
                 onClick={() => setView('list')}
                 className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'list' ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 List
               </button>
             </div>

             <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700">
               <Briefcase size={14} className="text-slate-400" />
               <select 
                 value={activeProjectFilter} 
                 onChange={(e) => setActiveProjectFilter(e.target.value as any)}
                 className="bg-transparent text-[11px] font-bold uppercase tracking-widest outline-none text-slate-600 dark:text-slate-300"
               >
                 <option value="All">All Projects</option>
                 {Object.values(ProjectType).map(p => <option key={p} value={p}>{p}</option>)}
               </select>
            </div>
            
            <button 
              onClick={() => openModal()}
              className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-95"
              title="Add Activity"
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto no-scrollbar transition-all ${view === 'calendar' ? 'p-0' : 'p-8 pb-40'}`}>
          <AnimatePresence mode="wait">
            {view === 'calendar' ? (
              <motion.div key="calendar-v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col p-4 md:p-8 pb-32">
                <div className="flex items-center justify-between mb-8 px-2">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentMonth)}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
                    <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">Today</button>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"><ChevronRight size={20} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl h-auto">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-slate-50 dark:bg-slate-900 p-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day, i) => {
                    const dateObj = day ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) : null;
                    const dateStr = dateObj ? dateObj.toISOString().split('T')[0] : '';
                    const dayItems = day ? getItemsForDate(dateStr) : [];
                    const activityCount = dayItems.length;
                    const isToday = dateStr === todayStr;
                    
                    return (
                      <div 
                        key={i} 
                        onClick={() => dateStr && (setFocusedDate(dateStr), setShowDayModal(true))}
                        className={`bg-white dark:bg-slate-900 min-h-[160px] p-4 border-t border-slate-100 dark:border-slate-800 group relative transition-colors ${dateStr ? 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer' : ''} ${isToday ? 'bg-indigo-50/20 dark:bg-indigo-900/10' : ''}`}
                      >
                        {day && (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-sm font-semibold transition-colors flex items-center justify-center ${isToday ? 'bg-indigo-600 text-white w-7 h-7 rounded-full -ml-1.5' : 'text-slate-300 dark:text-slate-700 group-hover:text-purple-600'}`}>
                                {day}
                              </span>
                            </div>
                            <div className="space-y-1.5 pointer-events-none pb-4">
                              {dayItems.slice(0, 5).map(item => (
                                <div key={item.id} style={{ borderLeft: `3px solid ${PROJECT_CONFIG[item.project].color}` }} className="text-[10px] p-1.5 rounded bg-slate-50 dark:bg-slate-800/60 font-semibold truncate text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-1.5">
                                  {item.type === 'task' && <CheckSquare size={10} className="text-indigo-500 shrink-0" />}
                                  <span className="truncate">{item.title}</span>
                                </div>
                              ))}
                              {activityCount > 5 && <div className="text-[9px] font-medium text-slate-400 pl-1 uppercase tracking-widest">+ {activityCount - 5} more</div>}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div key="list-v" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto space-y-12">
                {groupedListItems.length > 0 ? (
                  groupedListItems.map(group => (
                    <div key={group.monthYear} className="space-y-6">
                      <div className="sticky top-0 z-10 py-2 bg-slate-50 dark:bg-slate-950 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                          <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                            {group.monthYear}
                          </h3>
                          <div className="h-px w-full bg-gradient-to-r from-indigo-500/30 to-transparent" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
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
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-40 opacity-20">
                    <CalendarIconLucide size={64} className="mb-4 text-slate-400" />
                    <p className="text-lg font-bold uppercase tracking-widest text-slate-400">Empty Portfolio</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {showDayModal && focusedDate && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-3xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                     {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(focusedDate))}
                   </h2>
                </div>
                <button onClick={() => setShowDayModal(false)} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-colors"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
                {focusedDateItems.map(item => (
                  <div key={item.id} className="group bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex items-center gap-4 relative">
                    <div className="w-1.5 self-stretch rounded-full shrink-0" style={{ backgroundColor: PROJECT_CONFIG[item.project].color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {item.type === 'task' && (
                          <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest">TaskFlow Item</span>
                        )}
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{item.project}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 italic mt-1 whitespace-pre-wrap">{item.details || 'No details.'}</p>
                    </div>
                    {item.type === 'task' && onNavigateToTask && (
                      <button 
                        onClick={() => { setShowDayModal(false); onNavigateToTask(item.id); }}
                        className="p-3 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all shadow-sm flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shrink-0"
                      >
                        Go to Tasks <ExternalLink size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {focusedDateItems.length === 0 && (
                   <div className="py-20 flex flex-col items-center justify-center text-slate-400 opacity-40">
                      <X size={48} className="mb-4" />
                      <p className="font-bold uppercase tracking-widest">No activities scheduled</p>
                   </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{editingActivity ? 'Modify Activity' : 'Plot Activity'}</h2>
                 <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveActivity} className="p-8 space-y-5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Activity Title</label>
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:border-indigo-500 outline-none dark:text-white transition-colors" />
                </div>
                
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block flex items-center gap-1.5">
                    <AlignLeft size={12} /> Activity Description
                  </label>
                  <textarea 
                    value={details} 
                    onChange={(e) => setDetails(e.target.value)} 
                    placeholder="Briefing, agenda or key notes..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:border-indigo-500 outline-none dark:text-white h-24 resize-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Start Date</label>
                    <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">End Date</label>
                    <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Project Portfolio</label>
                    <select value={project} onChange={(e) => setProject(e.target.value as ProjectType)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest dark:text-white cursor-pointer transition-colors">
                      {Object.values(ProjectType).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Current Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest dark:text-white cursor-pointer transition-colors">
                      <option value="planned">Planned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-[11px] font-semibold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95">Save Activity</button>
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
  const dateObj = new Date(item.dateStr);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNumber = dateObj.getDate();

  return (
    <motion.div layout className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex items-center gap-6 shadow-sm hover:shadow-xl hover:border-indigo-500/50 transition-all duration-300">
      {/* Visual Marker */}
      <div className="absolute top-0 bottom-0 left-0 w-1.5 rounded-l-3xl" style={{ backgroundColor: projectConfig.color }} />
      
      {/* Enhanced Date Display */}
      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 shrink-0">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 leading-none mb-1">{dayName}</span>
        <span className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{dayNumber}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
           {item.type === 'task' && (
             <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[8px] font-black uppercase tracking-widest">TASKFLOW</span>
           )}
           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{item.project}</span>
           <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: projectConfig.color }} />
           <div className="ml-auto flex items-center gap-1.5">
             <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${item.status === 'completed' || item.status === 'done' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                {item.status}
             </div>
           </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-2">
          {item.type === 'task' && <CheckSquare size={16} className="text-indigo-500 shrink-0" />}
          <span className="truncate">{item.title}</span>
        </h3>
        
        <p className="text-[12px] text-slate-500 dark:text-slate-400 italic line-clamp-1 mt-1 font-medium opacity-80">
          {item.details || 'No additional briefings.'}
        </p>
      </div>

      <div className="flex items-center gap-2 pr-2">
         {onEdit && (
           <button onClick={onEdit} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all opacity-0 group-hover:opacity-100 shadow-sm">
             <Pencil size={18} />
           </button>
         )}
         {item.type === 'task' && onNavigateToTask && (
           <button 
             onClick={() => onNavigateToTask(item.id)} 
             className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"
             title="View in TaskFlow"
           >
             <ExternalLink size={18} />
           </button>
         )}
         {onDelete && (
           <button onClick={onDelete} className="p-2.5 bg-rose-50 dark:bg-rose-900/20 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100 shadow-sm">
             <Trash2 size={18} />
           </button>
         )}
      </div>
    </motion.div>
  );
};

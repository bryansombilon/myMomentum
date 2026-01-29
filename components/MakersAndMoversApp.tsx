
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventActivity, ProjectType } from '../types';
import { PROJECT_CONFIG } from '../constants';
import { 
  Plus, Calendar as CalendarIcon, List as ListIcon, Trash2, 
  ChevronLeft, ChevronRight, Rocket,
  Pencil, X, CalendarDays as CalendarDaysIcon, Briefcase, ChevronDown,
  ArrowRight
} from 'lucide-react';

interface MakersAndMoversAppProps {
  activities: EventActivity[];
  onSaveActivities: (activities: EventActivity[]) => void;
}

export const MakersAndMoversApp: React.FC<MakersAndMoversAppProps> = ({ activities, onSaveActivities }) => {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<EventActivity | null>(null);
  const [focusedDate, setFocusedDate] = useState<string | null>(null);
  const [activeProjectFilter, setActiveProjectFilter] = useState<ProjectType | 'All'>('All');

  // Form State
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

  const filteredActivities = useMemo(() => {
    return activities.filter(a => activeProjectFilter === 'All' || a.project === activeProjectFilter);
  }, [activities, activeProjectFilter]);

  const sortedActivities = useMemo(() => {
    return [...filteredActivities].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [filteredActivities]);

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

  const getActivitiesForDate = (dateStr: string) => {
    return filteredActivities.filter(a => {
      const start = new Date(a.startDate).toISOString().split('T')[0];
      const end = new Date(a.endDate).toISOString().split('T')[0];
      return dateStr >= start && dateStr <= end;
    });
  };

  const focusedDateActivities = useMemo(() => {
    if (!focusedDate) return [];
    return getActivitiesForDate(focusedDate);
  }, [filteredActivities, focusedDate]);

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
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Integrated EventFlow</p>
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
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto no-scrollbar transition-all ${view === 'calendar' ? 'p-0' : 'p-8 pb-32'}`}>
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
                    const dayActivities = day ? getActivitiesForDate(dateStr) : [];
                    const activityCount = dayActivities.length;
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
                              {dayActivities.slice(0, 5).map(a => (
                                <div key={a.id} style={{ borderLeft: `3px solid ${PROJECT_CONFIG[a.project].color}` }} className="text-[10px] p-1.5 rounded bg-slate-50 dark:bg-slate-800/60 font-semibold truncate text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700">
                                  {a.title}
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
              <motion.div key="list-v" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-5xl mx-auto space-y-6 pb-32">
                {sortedActivities.map((activity) => (
                  <ActivityListItem key={activity.id} activity={activity} onDelete={() => handleDelete(activity.id)} onEdit={() => openModal(activity)} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {showDayModal && focusedDate && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
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
                {focusedDateActivities.map(activity => (
                  <div key={activity.id} className="group bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-1.5 self-stretch rounded-full shrink-0" style={{ backgroundColor: PROJECT_CONFIG[activity.project].color }} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">{activity.title}</h4>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 italic mt-1">{activity.details || 'No details.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{editingActivity ? 'Modify Activity' : 'Plot Activity'}</h2>
                 <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveActivity} className="p-8 space-y-5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Activity Title</label>
                  <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:border-indigo-500 outline-none dark:text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white" />
                  <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select value={project} onChange={(e) => setProject(e.target.value as ProjectType)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest dark:text-white">
                    {Object.values(ProjectType).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest dark:text-white">
                    <option value="planned">Planned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all">Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ActivityListItem: React.FC<{ activity: EventActivity; onDelete: () => void; onEdit: () => void }> = ({ activity, onDelete, onEdit }) => {
  const projectConfig = PROJECT_CONFIG[activity.project];

  return (
    <motion.div layout className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex items-start gap-6 shadow-sm hover:shadow-lg transition-all">
      <div style={{ backgroundColor: `${projectConfig.color}15`, borderColor: `${projectConfig.color}40`, color: projectConfig.color }} className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border">
        <span className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">{new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(activity.startDate))}</span>
        <span className="text-xl font-bold leading-none">{new Date(activity.startDate).getDate()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{activity.project}</span>
           <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: projectConfig.color }} />
           <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto">
             {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(activity.startDate))}
             <ArrowRight size={10} className="text-slate-300" />
             {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(activity.endDate))}
           </div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2 group-hover:text-purple-600 transition-colors">{activity.title}</h3>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 italic">{activity.details || 'No briefing available.'}</p>
      </div>
      <div className="flex flex-col gap-2">
         <button onClick={onEdit} className="p-2 text-slate-300 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100"><Pencil size={18} /></button>
         <button onClick={onDelete} className="p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
      </div>
    </motion.div>
  );
};


import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventActivity } from '../types';
import { 
  Plus, Calendar as CalendarIcon, List as ListIcon, Home, Trash2, 
  ChevronLeft, ChevronRight, Clock, MapPin, CheckCircle2, AlertCircle, Rocket,
  Pencil, X
} from 'lucide-react';

interface MakersAndMoversAppProps {
  activities: EventActivity[];
  onSaveActivities: (activities: EventActivity[]) => void;
  onGoHome: () => void;
}

export const MakersAndMoversApp: React.FC<MakersAndMoversAppProps> = ({ activities, onSaveActivities, onGoHome }) => {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<EventActivity | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<EventActivity['status']>('planned');

  // Handle opening modal for edit vs add
  const openModal = (activity?: EventActivity) => {
    if (activity) {
      setEditingActivity(activity);
      setTitle(activity.title);
      setDetails(activity.details);
      setDate(new Date(activity.date).toISOString().split('T')[0]);
      setStatus(activity.status);
    } else {
      setEditingActivity(null);
      setTitle('');
      setDetails('');
      setDate(new Date().toISOString().split('T')[0]);
      setStatus('planned');
    }
    setShowModal(true);
  };

  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [activities]);

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    if (editingActivity) {
      const updated = activities.map(a => a.id === editingActivity.id ? {
        ...a,
        title,
        details,
        date: new Date(date),
        status
      } : a);
      onSaveActivities(updated);
    } else {
      const newActivity: EventActivity = {
        id: Date.now().toString(),
        title,
        details,
        date: new Date(date),
        status
      };
      onSaveActivities([...activities, newActivity]);
    }
    
    setShowModal(false);
    setEditingActivity(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this milestone?')) {
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

    // Padding for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Actual days
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }

    return days;
  }, [currentMonth]);

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors">
      
      {/* Sidebar Navigation */}
      <div className="w-20 md:w-24 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center py-8 gap-8 transition-colors">
        <button 
          onClick={onGoHome} 
          className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-purple-600 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <Home size={24} />
        </button>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => setView('list')}
            className={`p-3 rounded-2xl transition-all ${view === 'list' ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/30' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <ListIcon size={24} />
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={`p-3 rounded-2xl transition-all ${view === 'calendar' ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/30' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <CalendarIcon size={24} />
          </button>
        </div>

        <button 
          onClick={() => openModal()}
          className="mt-auto p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-xl hover:scale-105 transition-transform active:scale-95"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600 rounded-xl text-white shadow-lg shadow-purple-500/20">
              <Rocket size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Makers & Movers</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Event Project Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
               <div className="text-[14px] font-black text-slate-900 dark:text-white">{activities.length} Activities</div>
               <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Milestones</div>
            </div>
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto no-scrollbar transition-all ${view === 'calendar' ? 'p-4 md:p-6 lg:p-10' : 'p-8'}`}>
          <AnimatePresence mode="wait">
            {view === 'list' ? (
              <motion.div 
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                {sortedActivities.map((activity) => (
                  <ActivityCard 
                    key={activity.id} 
                    activity={activity} 
                    onDelete={() => handleDelete(activity.id)} 
                    onEdit={() => openModal(activity)}
                  />
                ))}
                {activities.length === 0 && (
                   <div className="py-40 text-center opacity-20">
                      <Rocket size={80} className="mx-auto mb-6 text-slate-400" />
                      <p className="text-[14px] font-black uppercase tracking-[0.4em]">No activities logged</p>
                   </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="calendar"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full h-full flex flex-col"
              >
                <div className="flex items-center justify-between mb-8 px-2">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                    {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentMonth)}
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"><ChevronRight size={20} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-slate-50 dark:bg-slate-900 p-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day, i) => {
                    const dateStr = day ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0] : '';
                    const dayActivities = activities.filter(a => new Date(a.date).toISOString().split('T')[0] === dateStr);
                    
                    return (
                      <div key={i} className="bg-white dark:bg-slate-900 min-h-[160px] p-4 border-t border-slate-100 dark:border-slate-800 group relative transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        {day && (
                          <>
                            <span className="text-sm font-black text-slate-300 dark:text-slate-700 group-hover:text-purple-600 transition-colors">{day}</span>
                            <div className="mt-2 space-y-1.5">
                              {dayActivities.map(a => (
                                <button 
                                  key={a.id} 
                                  onClick={() => openModal(a)}
                                  className={`w-full text-left text-[11px] p-2.5 rounded-xl border font-bold truncate transition-all active:scale-[0.98] ${a.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-800/40' : 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800/50 hover:bg-purple-100 dark:hover:bg-purple-800/40'}`}
                                  title={a.title}
                                >
                                  {a.title}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add / Edit Milestone Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
                 <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{editingActivity ? 'Edit Activity' : 'Add Activity'}</h2>
                 <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleSaveActivity} className="p-8 space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Milestone Title</label>
                  <input 
                    required 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold focus:border-purple-500 outline-none dark:text-white"
                    placeholder="e.g. Speakers Briefing"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Date</label>
                    <input 
                      type="date"
                      required 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold focus:border-purple-500 outline-none dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Status</label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider focus:border-purple-500 outline-none dark:text-white"
                    >
                      <option value="planned">Planned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Details</label>
                  <textarea 
                    value={details} 
                    onChange={(e) => setDetails(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold focus:border-purple-500 outline-none dark:text-white resize-none"
                    placeholder="Describe logistics, attendees, or requirements..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 active:scale-95 transition-all">
                    {editingActivity ? 'Save Changes' : 'Create Milestone'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

const ActivityCard: React.FC<{ activity: EventActivity; onDelete: () => void; onEdit: () => void }> = ({ activity, onDelete, onEdit }) => {
  const isCompleted = activity.status === 'completed';
  const isInProgress = activity.status === 'in-progress';

  return (
    <motion.div 
      layout
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex items-start gap-6 shadow-sm hover:shadow-xl hover:border-purple-500/30 transition-all"
    >
      <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border ${isCompleted ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20' : 'bg-purple-50 border-purple-100 text-purple-600 dark:bg-purple-900/20'}`}>
        <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(activity.date))}</span>
        <span className="text-[20px] font-black leading-none mt-1">{new Date(activity.date).getDate()}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
           <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${isCompleted ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : isInProgress ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
             {activity.status}
           </span>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto">{new Date(activity.date).getFullYear()}</span>
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2 group-hover:text-purple-600 transition-colors">{activity.title}</h3>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed italic">{activity.details || 'No additional details provided for this milestone.'}</p>
      </div>

      <div className="flex flex-col gap-2">
         <button onClick={onEdit} className="p-2 text-slate-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100">
           <Pencil size={18} />
         </button>
         <button onClick={onDelete} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100">
           <Trash2 size={18} />
         </button>
      </div>
    </motion.div>
  );
};

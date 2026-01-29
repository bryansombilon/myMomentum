
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, StickyNote, Calendar, Download, 
  Upload, ShieldCheck, Globe, Sun, Moon, CalendarDays, 
  Rocket, ChevronRight, Activity, AlarmClock,
  Clock, AlertCircle, FileText
} from 'lucide-react';
import { AppView, Task, EventActivity } from '../types';
import { PROJECT_CONFIG } from '../constants';

interface HomeProps {
  onLaunchApp: (view: AppView) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  tasks: Task[];
  activities: EventActivity[];
  onNavigateToTask: (taskId: string) => void;
}

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } }
};

export const Home: React.FC<HomeProps> = ({ 
  onLaunchApp, 
  onExport, 
  onImport, 
  isDarkMode, 
  toggleTheme,
  tasks,
  activities,
  onNavigateToTask
}) => {
  const [time, setTime] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const weeklyActivities = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const taskItems = tasks
      .filter(t => {
        const d = new Date(t.deadline);
        const deadlineDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        return deadlineDate >= startOfWeek && deadlineDate <= endOfWeek && t.status !== 'done';
      })
      .map(t => ({
        id: t.id,
        title: t.title,
        date: new Date(t.deadline),
        project: t.project,
        type: 'task' as const,
        priority: t.priority
      }));

    const eventItems = activities
      .filter(a => {
        const start = new Date(a.startDate);
        const end = new Date(a.endDate);
        const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        return (startDate <= endOfWeek && endDate >= startOfWeek);
      })
      .map(a => ({
        id: a.id,
        title: a.title,
        date: new Date(a.startDate),
        project: a.project,
        type: 'activity' as const,
        priority: 'not-urgent' as any
      }));

    return [...taskItems, ...eventItems].sort((a, b) => {
      const timeDiff = a.date.getTime() - b.date.getTime();
      if (timeDiff !== 0) return timeDiff;
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
      if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
      return 0;
    });
  }, [tasks, activities]);

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date: Date) => date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  const apps = [
    { id: 'tasks' as AppView, name: 'Tasks', icon: CheckSquare, color: 'bg-indigo-600', shadow: 'shadow-indigo-500/40', desc: 'TaskFlow' },
    { id: 'notes' as AppView, name: 'Notes', icon: StickyNote, color: 'bg-amber-500', shadow: 'shadow-amber-500/40', desc: 'NoteFlow' },
    { id: 'links' as AppView, name: 'Hub', icon: Globe, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/40', desc: 'LinkFlow' },
    { id: 'sop' as AppView, name: 'SOP', icon: FileText, color: 'bg-rose-500', shadow: 'shadow-rose-500/40', desc: 'DocFlow' },
    { id: 'leaves' as AppView, name: 'Leaves', icon: CalendarDays, color: 'bg-sky-500', shadow: 'shadow-sky-500/40', desc: 'LeaveFlow' },
    { id: 'event-timeline' as AppView, name: 'Calendar', icon: Rocket, color: 'bg-purple-600', shadow: 'shadow-purple-500/40', desc: 'EventFlow' },
    { id: 'engagement' as AppView, name: 'Protocol', icon: AlarmClock, color: 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900', shadow: 'shadow-slate-500/40', desc: 'Engagement' },
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-8 overflow-hidden bg-slate-100 dark:bg-slate-950 transition-colors duration-500">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full" />

      <div className="absolute top-8 right-8 z-20 flex items-center gap-4">
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleTheme} className="p-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 shadow-lg text-slate-700 dark:text-slate-200">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>
      </div>

      <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center z-10">
        <div className="text-[90px] leading-none font-black text-slate-900 dark:text-white mb-4 select-none drop-shadow-sm tracking-tightest">{formatTime(time)}</div>
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-4 bg-white/40 dark:bg-slate-900/40 px-6 py-2.5 rounded-full backdrop-blur-md border border-white/20 dark:border-slate-800/50 shadow-sm">
          <Calendar size={12} className="text-indigo-600 dark:text-indigo-400" /> {formatDate(time)}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }}
        className="w-full max-w-5xl mb-10 z-10"
      >
        <div className="flex items-center justify-between mb-4 px-4">
          <div className="flex items-center gap-2">
             <Activity size={12} className="text-indigo-500" />
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Next 7 Days</span>
          </div>
          <button onClick={() => onLaunchApp('event-timeline')} className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-500 flex items-center gap-1 transition-all">
            Full View <ChevronRight size={12} />
          </button>
        </div>

        <div className="flex items-center gap-3 py-2 overflow-x-auto no-scrollbar snap-x px-4">
          {weeklyActivities.length > 0 ? (
            weeklyActivities.slice(0, 10).map((item) => (
              <motion.div 
                key={item.id} 
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (item.type === 'task') onNavigateToTask(item.id);
                  else onLaunchApp('event-timeline');
                }}
                className="min-w-[190px] w-[190px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 rounded-2xl p-4 shadow-xl shadow-slate-950/5 flex flex-col gap-3 cursor-pointer transition-all snap-start relative group"
              >
                <div 
                  className="absolute top-4 right-4 w-2 h-2 rounded-full" 
                  style={{ backgroundColor: PROJECT_CONFIG[item.project].color }} 
                />
                
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center justify-center w-10 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shrink-0">
                    <span className="text-[8px] font-black uppercase text-indigo-600 dark:text-indigo-400 leading-none mb-0.5">
                      {item.date.toLocaleDateString([], { weekday: 'short' })}
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white leading-none">
                      {item.date.getDate()}
                    </span>
                  </div>
                  
                  <div className="flex flex-col min-w-0 pt-0.5">
                    <div className="flex items-center gap-1 mb-0.5">
                      {item.type === 'task' ? <CheckSquare size={10} className="text-indigo-500" /> : <Rocket size={10} className="text-purple-500" />}
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 truncate">
                        {item.date.toLocaleDateString([], { month: 'short' })}
                      </span>
                    </div>
                    <h4 className="text-[12px] font-bold text-slate-800 dark:text-slate-100 line-clamp-1 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/50">
                  <span className="text-[8px] font-black uppercase text-slate-400 truncate max-w-[120px]">
                    {item.project}
                  </span>
                  {item.priority === 'urgent' && (
                    <div className="flex items-center gap-1">
                      <AlertCircle size={8} className="text-red-500" />
                      <span className="text-[7px] font-black uppercase text-red-500">Urgent</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="w-full text-center py-8 bg-white/20 dark:bg-slate-900/20 px-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800/50">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center justify-center gap-3">
                 <Clock size={14} /> Clear Agenda for the week
               </p>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div 
        variants={CONTAINER_VARIANTS} 
        initial="hidden" 
        animate="show" 
        className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-x-12 md:gap-y-8 z-10 max-w-4xl"
      >
        {apps.map((app) => (
          <motion.button key={app.id} variants={ITEM_VARIANTS} whileHover={{ y: -12, scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onLaunchApp(app.id)} className="group flex flex-col items-center gap-4 outline-none">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-[2.2rem] ${app.color} ${app.shadow} shadow-2xl flex items-center justify-center transition-all duration-300 group-hover:brightness-110 group-hover:rotate-2`}>
              <app.icon size={36} className="drop-shadow-lg" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <div className="font-semibold text-slate-500 dark:text-slate-400 text-[9px] uppercase mb-0.5">{app.desc}</div>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-base">{app.name}</div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-16 z-10 flex flex-col xl:flex-row items-center gap-6 p-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 dark:border-slate-800/60 shadow-2xl">
        <div className="flex items-center gap-6 px-4">
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300">Flow OS 2.0</span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <button onClick={() => onLaunchApp('engagement')} className="flex items-center gap-3 group px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-2xl transition-all text-left">
             <Activity size={18} className="text-indigo-600 dark:text-indigo-400" />
             <div>
               <div className="text-[9px] font-black uppercase text-slate-500">Engagement</div>
               <div className="text-[11px] font-bold text-slate-800 dark:text-white flex items-center gap-1">Protocol Standby <ChevronRight size={14} /></div>
             </div>
          </button>
        </div>
        <div className="flex items-center gap-4 p-1">
          <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} accept=".json" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold uppercase">
            <Upload size={16} /> Restore
          </button>
          <button onClick={onExport} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/30 text-[11px] font-semibold uppercase">
            <Download size={16} /> Export
          </button>
        </div>
      </motion.div>
    </div>
  );
};

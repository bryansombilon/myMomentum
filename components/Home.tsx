
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
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 260, damping: 20 } }
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

  const greeting = useMemo(() => {
    const hour = time.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, [time]);

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
    { id: 'engagement' as AppView, name: 'Protocol', icon: AlarmClock, color: 'bg-slate-800 dark:bg-indigo-950', shadow: 'shadow-slate-800/40', desc: 'Engagement' },
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto no-scrollbar bg-slate-100 dark:bg-slate-950 transition-colors duration-500">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[150px] rounded-full" />

      {/* Top Bar (Theme Toggle) */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
        <motion.button 
          whileHover={{ scale: 1.1 }} 
          whileTap={{ scale: 0.9 }} 
          onClick={toggleTheme} 
          className="p-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 shadow-lg text-slate-700 dark:text-slate-200"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>
      </div>

      {/* Side-by-Side Main Layout */}
      <div className="relative z-10 w-full max-w-7xl flex flex-col lg:flex-row items-stretch justify-center gap-10 lg:gap-16 pb-32 pt-16 lg:pt-0">
        
        {/* Left Side: Time, Date & Activities */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <motion.div 
            initial={{ opacity: 0, x: -40 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="mb-8 lg:mb-10 text-center lg:text-left"
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-2 text-[14px] md:text-[16px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]"
            >
              {greeting}, Bryan
            </motion.div>
            <div className="text-[56px] sm:text-[72px] lg:text-[90px] leading-none font-bold text-slate-900 dark:text-white mb-4 select-none drop-shadow-sm tracking-tightest">
              {formatTime(time)}
            </div>
            <div className="inline-flex items-center gap-3 bg-white/40 dark:bg-slate-900/40 px-5 sm:px-6 py-2 rounded-full backdrop-blur-md border border-white/20 dark:border-slate-800/50 shadow-sm">
              <Calendar size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                {formatDate(time)}
              </span>
            </div>
          </motion.div>

          {/* Vertical Agenda Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="w-full max-w-md mx-auto lg:mx-0 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                 <Activity size={14} className="text-indigo-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">This Week's Agenda</span>
              </div>
            </div>

            <div className="space-y-3 max-h-[300px] lg:max-h-[380px] overflow-y-auto no-scrollbar pr-2 py-1 overflow-x-hidden">
              {weeklyActivities.length > 0 ? (
                weeklyActivities.slice(0, 5).map((item) => (
                  <motion.div 
                    key={item.id} 
                    whileHover={{ x: 8, backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)' }}
                    onClick={() => {
                      if (item.type === 'task') onNavigateToTask(item.id);
                      else onLaunchApp('event-timeline');
                    }}
                    className="flex items-center gap-4 bg-slate-400/5 dark:bg-slate-800/20 backdrop-blur-xl border border-white/10 dark:border-slate-800/40 rounded-2xl p-4 shadow-xl shadow-slate-950/5 cursor-pointer transition-all relative group"
                  >
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 rounded-r-full" 
                      style={{ backgroundColor: PROJECT_CONFIG[item.project].color }} 
                    />
                    
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shrink-0">
                      <span className="text-[8px] font-black uppercase text-indigo-600 dark:text-indigo-400 leading-none mb-0.5">
                        {item.date.toLocaleDateString([], { weekday: 'short' })}
                      </span>
                      <span className="text-lg font-black text-slate-900 dark:text-white leading-none">
                        {item.date.getDate()}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-1.5 mb-1">
                        {item.type === 'task' ? <CheckSquare size={10} className="text-indigo-500" /> : <Rocket size={10} className="text-purple-500" />}
                        <span className="text-[9px] font-bold uppercase text-slate-400 truncate">
                          {item.project}
                        </span>
                      </div>
                      <h4 className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.title}
                      </h4>
                    </div>

                    {item.priority === 'urgent' && (
                      <div className="p-1 rounded bg-red-50 dark:bg-red-900/20 text-red-500 shrink-0">
                        <AlertCircle size={14} />
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-10 bg-white/10 dark:bg-slate-900/10 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800/50">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center justify-center gap-3">
                     <Clock size={14} /> Agenda Clear
                   </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Center Vertical Separator */}
        <div className="hidden lg:block w-[3px] self-stretch bg-gradient-to-b from-transparent via-slate-300 dark:via-indigo-500/30 to-transparent rounded-full opacity-60" />

        {/* Right Side: App Hub - Responsive Grid */}
        <div className="flex-[1.2] flex flex-col items-center justify-center">
          <motion.div 
            variants={CONTAINER_VARIANTS} 
            initial="hidden" 
            animate="show" 
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10"
          >
            {apps.map((app) => (
              <motion.button 
                key={app.id} 
                variants={ITEM_VARIANTS} 
                whileHover={{ y: -12, scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={() => onLaunchApp(app.id)} 
                className="group flex flex-col items-center gap-3 sm:gap-4 outline-none"
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-22 lg:h-22 rounded-[1.8rem] sm:rounded-[2.5rem] ${app.color} ${app.shadow} shadow-2xl flex items-center justify-center transition-all duration-300 group-hover:brightness-110 group-hover:rotate-2 relative`}>
                  <app.icon className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 drop-shadow-lg text-white" strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-slate-500 dark:text-slate-400 text-[8px] sm:text-[10px] uppercase mb-0.5 tracking-widest">{app.desc}</div>
                  <div className="font-black text-slate-900 dark:text-white text-sm sm:text-base">{app.name}</div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer / System Bar - Enhanced for Mobile Visibility */}
      <motion.div 
        initial={{ opacity: 0, y: 50, x: '-50%' }} 
        animate={{ opacity: 1, y: 0, x: '-50%' }} 
        transition={{ delay: 0.8 }} 
        className="fixed bottom-6 lg:bottom-10 left-1/2 z-20 flex flex-col lg:flex-row items-center gap-4 lg:gap-6 p-3 sm:p-4 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] sm:rounded-[3rem] border border-white/40 dark:border-slate-800/60 shadow-2xl whitespace-nowrap w-[90%] sm:w-auto"
      >
        <div className="flex items-center gap-4 sm:gap-6 px-2 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-[9px] sm:text-[11px] font-black uppercase text-slate-700 dark:text-slate-300">Flow OS 2.0</span>
          </div>
          <div className="h-6 sm:h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <button onClick={() => onLaunchApp('engagement')} className="flex items-center gap-2 sm:gap-3 group px-2 sm:px-4 py-1.5 sm:py-2 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-2xl transition-all text-left">
             <Activity size={18} className="text-indigo-600 dark:text-indigo-400" />
             <div className="hidden sm:block">
               <div className="text-[9px] font-black uppercase text-slate-500">Security</div>
               <div className="text-[11px] font-bold text-slate-800 dark:text-white flex items-center gap-1">Monitoring Standby <ChevronRight size={14} /></div>
             </div>
             <div className="sm:hidden text-[10px] font-bold dark:text-white">Secure</div>
          </button>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 p-0.5 sm:p-1 w-full lg:w-auto">
          <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} accept=".json" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-[9px] sm:text-[11px] font-bold uppercase">
            <Upload size={14} className="sm:size-4" /> <span className="hidden sm:inline">Restore</span>
          </button>
          <button onClick={onExport} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/30 text-[9px] sm:text-[11px] font-bold uppercase">
            <Download size={14} className="sm:size-4" /> <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};


import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, StickyNote, LayoutGrid, Calendar, Download, 
  Upload, ShieldCheck, Globe, Sun, Moon, CalendarDays, 
  Rocket, Linkedin, BellRing, ChevronRight, Activity, AlarmClock
} from 'lucide-react';
import { AppView } from '../types';

interface HomeProps {
  onLaunchApp: (view: AppView) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } }
};

export const Home: React.FC<HomeProps> = ({ onLaunchApp, onExport, onImport, isDarkMode, toggleTheme }) => {
  const [time, setTime] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date: Date) => date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  const apps = [
    { id: 'tasks' as AppView, name: 'Tasks', icon: CheckSquare, color: 'bg-indigo-600', shadow: 'shadow-indigo-500/40', desc: 'TaskFlow' },
    { id: 'notes' as AppView, name: 'Notes', icon: StickyNote, color: 'bg-amber-500', shadow: 'shadow-amber-500/40', desc: 'NoteFlow' },
    { id: 'links' as AppView, name: 'Hub', icon: Globe, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/40', desc: 'LinkFlow' },
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

      <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center z-10">
        <div className="text-[100px] leading-none font-bold tracking-tightest text-slate-900 dark:text-white mb-6 select-none">{formatTime(time)}</div>
        <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300 flex items-center justify-center gap-3 bg-white/40 dark:bg-slate-900/40 px-6 py-2 rounded-full backdrop-blur-sm border border-white/20 dark:border-slate-800/50">
          <Calendar size={16} className="text-indigo-600 dark:text-indigo-400" /> {formatDate(time)}
        </div>
      </motion.div>

      <motion.div variants={CONTAINER_VARIANTS} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-10 z-10">
        {apps.map((app) => (
          <motion.button key={app.id} variants={ITEM_VARIANTS} whileHover={{ y: -12, scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onLaunchApp(app.id)} className="group flex flex-col items-center gap-6 outline-none">
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-[2.5rem] ${app.color} ${app.shadow} shadow-2xl flex items-center justify-center transition-all duration-300 group-hover:brightness-110 group-hover:rotate-2`}>
              <app.icon size={44} className="drop-shadow-lg" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <div className="font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest mb-1">{app.desc}</div>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-lg tracking-tight">{app.name}</div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-20 z-10 flex flex-col xl:flex-row items-center gap-6 p-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 dark:border-slate-800/60 shadow-2xl">
        <div className="flex items-center gap-6 px-4">
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Flow OS 2.0</span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <button onClick={() => onLaunchApp('engagement')} className="flex items-center gap-3 group px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-2xl transition-all text-left">
             <Activity size={18} className="text-indigo-600 dark:text-indigo-400" />
             <div>
               <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">System Engagement</div>
               <div className="text-[11px] font-bold text-slate-800 dark:text-white flex items-center gap-1">Protocol Standby <ChevronRight size={14} /></div>
             </div>
          </button>
        </div>
        <div className="flex items-center gap-4 p-1">
          <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} accept=".json" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold uppercase tracking-widest">
            <Upload size={16} /> Restore
          </button>
          <button onClick={onExport} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/30 text-[11px] font-semibold uppercase tracking-widest">
            <Download size={16} /> Export
          </button>
        </div>
      </motion.div>
    </div>
  );
};

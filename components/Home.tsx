
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, StickyNote, LayoutGrid, Calendar, Download, Upload, ShieldCheck, Globe, Sun, Moon, CalendarDays, Rocket } from 'lucide-react';
import { AppView } from '../types';

interface HomeProps {
  onLaunchApp: (view: AppView) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Home: React.FC<HomeProps> = ({ onLaunchApp, onExport, onImport, isDarkMode, toggleTheme }) => {
  const [time, setTime] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date: Date) => date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const apps = [
    { id: 'tasks' as AppView, name: 'Tasks', icon: CheckSquare, color: 'bg-indigo-600', shadow: 'shadow-indigo-500/40', desc: 'TaskFlow' },
    { id: 'notes' as AppView, name: 'Notes', icon: StickyNote, color: 'bg-amber-500', shadow: 'shadow-amber-500/40', desc: 'NoteFlow' },
    { id: 'links' as AppView, name: 'Hub', icon: Globe, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/40', desc: 'LinkFlow' },
    { id: 'leaves' as AppView, name: 'Leaves', icon: CalendarDays, color: 'bg-sky-500', shadow: 'shadow-sky-500/40', desc: 'LeaveFlow' },
    { id: 'event-timeline' as AppView, name: 'Calendar', icon: Rocket, color: 'bg-purple-600', shadow: 'shadow-purple-500/40', desc: 'EventFlow' },
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-8 overflow-hidden bg-slate-100 dark:bg-slate-950 transition-colors duration-500">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full" />

      {/* Top Right Actions */}
      <div className="absolute top-8 right-8 z-20">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 shadow-lg text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="mb-12 text-center z-10"
      >
        <div className="mb-4">
          <span className="text-xl md:text-2xl font-semibold text-slate-600 dark:text-slate-300 tracking-tight">
            {getGreeting()}, <span className="font-bold text-slate-900 dark:text-white">Bryan</span>
          </span>
        </div>
        <div className="text-[100px] leading-none font-bold tracking-tightest text-slate-900 dark:text-white mb-6 select-none drop-shadow-sm">
          {formatTime(time)}
        </div>
        <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300 flex items-center justify-center gap-3 bg-white/40 dark:bg-slate-900/40 px-6 py-2 rounded-full backdrop-blur-sm border border-white/20 dark:border-slate-800/50">
          <Calendar size={16} className="text-indigo-600 dark:text-indigo-400" />
          {formatDate(time)}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.1, duration: 0.5 }} 
        className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-10 z-10"
      >
        {apps.map((app, index) => (
          <motion.button
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (index * 0.1) }}
            whileHover={{ y: -12, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onLaunchApp(app.id)}
            className="group flex flex-col items-center gap-6 outline-none"
          >
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] ${app.color} ${app.shadow} shadow-2xl flex items-center justify-center transition-all duration-300 group-hover:brightness-110 group-hover:rotate-2 group-focus:ring-4 group-focus:ring-indigo-500/30`}>
              <app.icon size={44} className="text-white drop-shadow-lg" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <div className="font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {app.desc}
              </div>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-lg tracking-tight">
                {app.name}
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.5 }} 
        className="mt-20 z-10 flex flex-col md:flex-row items-center gap-6 p-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/40 dark:border-slate-800/60 shadow-2xl"
      >
        <div className="px-5 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex items-center gap-3 py-2">
          <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-700 dark:text-slate-300">Flow OS System</span>
        </div>
        
        <div className="flex items-center gap-4 p-1">
          <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} accept=".json" className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all text-[11px] font-semibold uppercase tracking-widest"
          >
            <Upload size={16} /> Restore
          </button>
          <button 
            onClick={onExport} 
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-xl shadow-indigo-500/30 text-[11px] font-semibold uppercase tracking-widest active:scale-95"
          >
            <Download size={16} /> Export Backup
          </button>
        </div>
      </motion.div>

      <div className="absolute bottom-10 flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px] font-semibold tracking-[0.4em] uppercase select-none">
        <LayoutGrid size={16} className="text-slate-400 dark:text-slate-600" /> HomeFlow 2.0
      </div>
    </div>
  );
};

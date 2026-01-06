
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, StickyNote, LayoutGrid, Clock, Calendar, Download, Upload, ShieldCheck } from 'lucide-react';
import { AppView } from '../types';

interface HomeProps {
  onLaunchApp: (view: AppView) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export const Home: React.FC<HomeProps> = ({ onLaunchApp, onExport, onImport }) => {
  const [time, setTime] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  const apps = [
    { 
      id: 'tasks' as AppView, 
      name: 'Tasks', 
      icon: CheckSquare, 
      color: 'bg-indigo-600', 
      shadow: 'shadow-indigo-500/40',
      desc: 'Project tracking' 
    },
    { 
      id: 'notes' as AppView, 
      name: 'Notes', 
      icon: StickyNote, 
      color: 'bg-amber-500', 
      shadow: 'shadow-amber-500/40',
      desc: 'Thoughts & docs' 
    },
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full" />

      {/* Clock Widget */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 text-center z-10"
      >
        <div className="text-7xl font-light tracking-tighter text-slate-900 dark:text-white mb-2">
          {formatTime(time)}
        </div>
        <div className="text-lg font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
          <Calendar size={18} />
          {formatDate(time)}
        </div>
      </motion.div>

      {/* App Grid */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-2 gap-8 z-10"
      >
        {apps.map((app, index) => (
          <motion.button
            key={app.id}
            whileHover={{ y: -8, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onLaunchApp(app.id)}
            className="group flex flex-col items-center gap-4 outline-none"
          >
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] ${app.color} ${app.shadow} shadow-2xl flex items-center justify-center transition-all duration-300 group-hover:brightness-110`}>
              <app.icon size={44} className="text-white" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <div className="font-bold text-slate-800 dark:text-slate-100 text-lg">{app.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-500 font-medium">{app.desc}</div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* System Actions Bar (Backup & Restore) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-20 z-10 flex items-center gap-4 p-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-800/50 shadow-xl"
      >
        <div className="px-3 border-r border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">System Backup</span>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".json" 
          className="hidden" 
        />
        
        <button 
          onClick={handleImportClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <Upload size={14} />
          <span className="text-xs font-semibold">Restore</span>
        </button>

        <button 
          onClick={onExport}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Download size={14} />
          <span className="text-xs font-bold">Export All Data</span>
        </button>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 flex items-center gap-2 text-slate-400 dark:text-slate-600 text-sm font-semibold tracking-widest uppercase">
        <LayoutGrid size={16} />
        TaskFlow OS
      </div>
    </div>
  );
};

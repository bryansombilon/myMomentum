
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, CheckSquare, StickyNote, Globe, 
  CalendarDays, Rocket, AlarmClock, FileText
} from 'lucide-react';
import { AppView } from '../types';

interface GlobalNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const SPRING_TRANSITION = { type: 'spring', stiffness: 300, damping: 30 };

export const GlobalNav: React.FC<GlobalNavProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'home' as AppView, icon: Home, label: 'Home', color: 'bg-slate-500' },
    { id: 'tasks' as AppView, icon: CheckSquare, label: 'Tasks', color: 'bg-indigo-600' },
    { id: 'notes' as AppView, icon: StickyNote, label: 'Notes', color: 'bg-amber-500' },
    { id: 'links' as AppView, icon: Globe, label: 'Hub', color: 'bg-emerald-500' },
    { id: 'sop' as AppView, icon: FileText, label: 'SOP', color: 'bg-rose-500' },
    { id: 'leaves' as AppView, icon: CalendarDays, label: 'Leaves', color: 'bg-sky-500' },
    { id: 'event-timeline' as AppView, icon: Rocket, label: 'Events', color: 'bg-purple-600' },
    { id: 'engagement' as AppView, icon: AlarmClock, label: 'Alarm', color: 'bg-slate-900' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-3 py-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-2xl flex items-center gap-1.5 transition-all">
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        const Icon = item.icon;

        return (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate(item.id)}
            className={`relative group p-3.5 rounded-full flex flex-col items-center justify-center transition-all duration-300 ${
              isActive 
                ? `${item.color} text-white shadow-xl` 
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            {isActive && <motion.div layoutId="active-pill" className="absolute inset-0 bg-current opacity-10 rounded-full" transition={SPRING_TRANSITION} />}
            <AnimatePresence>
              <div className="absolute bottom-full mb-4 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-[9px] font-bold uppercase rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all transform group-hover:translate-y-[-4px] whitespace-nowrap shadow-2xl">
                {item.label}
              </div>
            </AnimatePresence>
          </motion.button>
        );
      })}
    </nav>
  );
};

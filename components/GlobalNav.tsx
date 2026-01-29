
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, CheckSquare, StickyNote, Globe, 
  CalendarDays, Rocket
} from 'lucide-react';
import { AppView } from '../types';

interface GlobalNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const GlobalNav: React.FC<GlobalNavProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'home' as AppView, icon: Home, label: 'Home', color: 'bg-slate-500', shadow: 'shadow-slate-500/20' },
    { id: 'tasks' as AppView, icon: CheckSquare, label: 'Tasks', color: 'bg-indigo-600', shadow: 'shadow-indigo-500/20' },
    { id: 'notes' as AppView, icon: StickyNote, label: 'Notes', color: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
    { id: 'links' as AppView, icon: Globe, label: 'Hub', color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
    { id: 'leaves' as AppView, icon: CalendarDays, label: 'Leaves', color: 'bg-sky-500', shadow: 'shadow-sky-500/20' },
    { id: 'event-timeline' as AppView, icon: Rocket, label: 'Calendar', color: 'bg-purple-600', shadow: 'shadow-purple-500/20' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-3 py-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-2xl flex items-center gap-1.5 transition-all">
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
                ? `${item.color} text-white shadow-xl ${item.shadow}` 
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            
            {/* Horizontal Pill Indicator */}
            {isActive && (
              <motion.div 
                layoutId="active-dot"
                className="absolute -bottom-1 w-1 h-1 bg-current rounded-full"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}

            {/* Tooltip hint - shown on hover */}
            <div className="absolute bottom-full mb-4 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-[9px] font-bold uppercase tracking-[0.2em] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl border border-white/10">
              {item.label}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900 dark:border-t-slate-800" />
            </div>
          </motion.button>
        );
      })}
    </nav>
  );
};

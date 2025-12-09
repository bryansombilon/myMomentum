import React from 'react';
import { Task } from '../types';
import { PROJECT_CONFIG } from '../constants';
import { CheckCircle2, Moon, Sun } from 'lucide-react';

interface ProjectProgressProps {
  tasks: Task[];
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ProjectProgress: React.FC<ProjectProgressProps> = ({ tasks, isDarkMode, toggleTheme }) => {
  const stats = Object.values(PROJECT_CONFIG).map(project => {
    const projectTasks = tasks.filter(t => t.project === project.name);
    const total = projectTasks.length;
    const done = projectTasks.filter(t => t.status === 'done').length;
    const percentage = total === 0 ? 0 : Math.round((done / total) * 100);
    
    return {
      ...project,
      total,
      done,
      percentage
    };
  });

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 shadow-lg z-20 flex items-center gap-4 transition-colors">
      <div className="flex-1 flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
        {stats.map(stat => (
          <div 
            key={stat.name} 
            className="flex-shrink-0 flex flex-col min-w-[160px] p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors snap-start group"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" 
                  style={{ backgroundColor: stat.color, color: stat.color }} 
                />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider truncate max-w-[90px]" title={stat.name}>
                  {stat.name}
                </span>
              </div>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 border border-slate-200 dark:border-transparent transition-colors`}>
                {stat.done}/{stat.total}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-1.5 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden mb-2">
              <div 
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${stat.percentage}%`, backgroundColor: stat.color }}
              />
            </div>

            {/* Percentage Text */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-500 font-medium group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">Completion</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{stat.percentage}%</span>
            </div>
          </div>
        ))}
        
        {/* Summary Card */}
        <div className="flex-shrink-0 flex items-center justify-center min-w-[100px] p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700/50 text-slate-400 dark:text-slate-500 transition-colors">
             <div className="text-center">
                 <div className="text-xs font-medium mb-0.5">Total Tasks</div>
                 <div className="text-lg font-bold text-slate-600 dark:text-slate-300">{tasks.length}</div>
             </div>
        </div>
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="flex-shrink-0 p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors border border-slate-200 dark:border-slate-700"
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  );
};
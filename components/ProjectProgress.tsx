
import React from 'react';
import { Task } from '../types';
import { PROJECT_CONFIG } from '../constants';

interface ProjectProgressProps {
  tasks: Task[];
}

export const ProjectProgress: React.FC<ProjectProgressProps> = ({ 
  tasks
}) => {
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
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 shadow-lg z-20 flex items-center gap-3 transition-colors">
      <div className="flex-1 flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
        {stats.map(stat => (
          <div 
            key={stat.name} 
            className="flex-shrink-0 flex flex-col min-w-[160px] p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors snap-start group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" 
                  style={{ backgroundColor: stat.color, color: stat.color }} 
                />
                <span className="text-[13px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider truncate max-w-[90px]" title={stat.name}>
                  {stat.name}
                </span>
              </div>
              <span className={`text-[13px] font-medium px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 border border-slate-200 dark:border-transparent transition-colors`}>
                {stat.done}/{stat.total}
              </span>
            </div>
            
            <div className="relative h-1.5 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden mb-2">
              <div 
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${stat.percentage}%`, backgroundColor: stat.color }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[15px] text-slate-500 dark:text-slate-500 font-medium group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">Completion</span>
              <span className="text-[15px] font-bold text-slate-700 dark:text-slate-200">{stat.percentage}%</span>
            </div>
          </div>
        ))}
        
        <div className="flex-shrink-0 flex items-center justify-center min-w-[100px] p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700/50 text-slate-400 dark:text-slate-500 transition-colors">
             <div className="text-center">
                 <div className="text-[15px] font-medium mb-0.5">Total Tasks</div>
                 <div className="text-[22.5px] font-bold text-slate-600 dark:text-slate-300">{tasks.length}</div>
             </div>
        </div>
      </div>
    </div>
  );
};

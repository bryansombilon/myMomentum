import React from 'react';
import { Reorder, useDragControls, AnimatePresence } from 'framer-motion';
import { Task } from '../types';
import { PROJECT_CONFIG, STATUS_CONFIG } from '../constants';
import { Calendar, GripVertical, ChevronRight, Plus } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  selectedTaskId: string | null;
  onSelectTask: (task: Task) => void;
  onAddNewTask: () => void;
}

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onSelect: (task: Task) => void;
}

// Sub-component to handle individual drag controls properly
const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  isSelected, 
  onSelect 
}) => {
  const controls = useDragControls();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

  const statusStyle = STATUS_CONFIG[task.status] || STATUS_CONFIG['todo'];

  return (
    <Reorder.Item
      value={task}
      id={task.id}
      dragListener={false}
      dragControls={controls}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileDrag={{ 
        scale: 1.05, 
        zIndex: 50,
        boxShadow: "0px 10px 20px rgba(0,0,0,0.5), 0px 4px 6px rgba(0,0,0,0.3)",
        cursor: "grabbing"
      }}
      className={`
        relative group rounded-xl border p-3 cursor-pointer transition-colors duration-200 select-none
        ${isSelected 
          ? 'bg-slate-800 border-indigo-500 shadow-lg shadow-indigo-500/10' 
          : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'}
      `}
      onClick={() => onSelect(task)}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle - Restricted Area */}
        <div 
          onPointerDown={(e) => controls.start(e)}
          className="mt-1.5 text-slate-600 hover:text-slate-200 cursor-grab active:cursor-grabbing p-1 -ml-2 rounded hover:bg-slate-700/50 transition-colors touch-none"
        >
          <GripVertical size={16} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <div 
              className="w-2 h-2 rounded-full flex-shrink-0 shadow-[0_0_8px_currentColor]" 
              style={{ backgroundColor: PROJECT_CONFIG[task.project].color, color: PROJECT_CONFIG[task.project].color }}
            />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
              {PROJECT_CONFIG[task.project].name}
            </span>
          </div>
          
          <h3 className={`font-medium text-sm mb-3 truncate leading-snug ${isSelected ? 'text-indigo-100' : 'text-slate-200'}`}>
            {task.title}
          </h3>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar size={12} />
              <span className={new Date(task.deadline) < new Date() ? 'text-red-400 font-bold' : ''}>
                {formatDate(new Date(task.deadline))}
              </span>
            </div>
            
            <div className={`
              text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide
              ${statusStyle.color} ${statusStyle.text} shadow-sm
            `}>
              {statusStyle.label}
            </div>
          </div>
        </div>
        
        {isSelected && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500">
            <ChevronRight size={16} />
          </div>
        )}
      </div>
    </Reorder.Item>
  );
};

export const TaskList: React.FC<TaskListProps> = ({ tasks, setTasks, selectedTaskId, onSelectTask, onAddNewTask }) => {
  return (
    <div className="h-full flex flex-col bg-slate-900 border-r border-slate-800 w-full md:w-80 lg:w-96 flex-shrink-0">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="w-4 h-1 bg-indigo-500 rounded-full"></span>
            <span className="w-2 h-1 bg-indigo-500/50 rounded-full"></span>
          </div>
          TaskFlow
          <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full ml-1 border border-slate-700">
            {tasks.length}
          </span>
        </h2>
        
        <button
          onClick={onAddNewTask}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95 border border-indigo-400/20"
          title="Create New Task"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
        <Reorder.Group 
          axis="y" 
          values={tasks} 
          onReorder={setTasks} 
          className="space-y-3 pb-20"
          layoutScroll
        >
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isSelected={selectedTaskId === task.id}
                onSelect={onSelectTask}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { ProjectType, Task, Priority } from '../types';
import { PROJECT_CONFIG } from '../constants';
import { X, Calendar, Link as LinkIcon, Type, AlignLeft, Briefcase, AlertTriangle, Clock } from 'lucide-react';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    description: string;
    deadline: Date;
    clickupLink: string;
    project: ProjectType;
    priority: Priority;
  }) => void;
  taskToEdit?: Task | null;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [clickupLink, setClickupLink] = useState('');
  const [project, setProject] = useState<ProjectType>(ProjectType.GALA);
  const [priority, setPriority] = useState<Priority>('not-urgent');

  // Effect to populate form when modal opens or taskToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description);
        // Format date to YYYY-MM-DD for input[type="date"]
        const dateStr = taskToEdit.deadline instanceof Date 
          ? taskToEdit.deadline.toISOString().split('T')[0] 
          : new Date(taskToEdit.deadline).toISOString().split('T')[0];
        setDeadline(dateStr);
        setClickupLink(taskToEdit.clickupLink);
        setProject(taskToEdit.project);
        setPriority(taskToEdit.priority || 'not-urgent');
      } else {
        // Reset for new task
        setTitle('');
        setDescription('');
        setDeadline('');
        setClickupLink('');
        setProject(ProjectType.GALA);
        setPriority('not-urgent');
      }
    }
  }, [isOpen, taskToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline) return;

    onSave({
      title,
      description,
      deadline: new Date(deadline),
      clickupLink,
      project,
      priority
    });
    
    // We don't reset here immediately because the parent handles closing, 
    // and the useEffect handles resetting on next open.
  };

  const isEditing = !!taskToEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 transition-colors">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Type size={14} /> Task Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Update API Documentation"
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <AlignLeft size={14} /> Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the task..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Briefcase size={14} /> Project
              </label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value as ProjectType)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {Object.values(PROJECT_CONFIG).map((proj) => (
                  <option key={proj.name} value={proj.name}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Deadline */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar size={14} /> Deadline
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {/* Priority Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <AlertTriangle size={14} /> Priority Level
            </label>
            <div className="flex items-center gap-3 p-1">
              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => setPriority(prev => prev === 'urgent' ? 'not-urgent' : 'urgent')}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 ${
                  priority === 'urgent' 
                    ? 'bg-red-500' 
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
                role="switch"
                aria-checked={priority === 'urgent'}
              >
                <span
                  className={`absolute top-1 left-1 bg-white rounded-full w-4 h-4 shadow-sm transition-transform duration-200 transform ${
                    priority === 'urgent' ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              
              {/* Label */}
              <span className={`text-sm font-medium transition-colors ${
                priority === 'urgent' 
                  ? 'text-red-600 dark:text-red-400 font-bold' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}>
                {priority === 'urgent' ? 'URGENT' : 'Not Urgent'}
              </span>
            </div>
          </div>

          {/* ClickUp Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <LinkIcon size={14} /> ClickUp URL
            </label>
            <input
              type="url"
              value={clickupLink}
              onChange={(e) => setClickupLink(e.target.value)}
              placeholder="https://clickup.com/t/..."
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95"
            >
              {isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

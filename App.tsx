import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TaskList } from './components/TaskList';
import { TaskDetail } from './components/TaskDetail';
import { NewTaskModal } from './components/NewTaskModal';
import { ProjectProgress } from './components/ProjectProgress';
import { Home } from './components/Home';
import { NotesApp } from './components/NotesApp';
import { LinksApp } from './components/LinksApp';
import { INITIAL_TASKS, INITIAL_NOTES, INITIAL_LINKS } from './constants';
import { Task, Message, Priority, AppView, Note, LinkEntry } from './types';

const STORAGE_KEY_TASKS = 'taskflow_tasks_v1';
const STORAGE_KEY_NOTES = 'taskflow_notes_v1';
const STORAGE_KEY_LINKS = 'taskflow_links_v1';
const THEME_KEY = 'taskflow_theme';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      if (saved) {
        return JSON.parse(saved).map((t: any) => ({
          ...t,
          deadline: new Date(t.deadline),
          updates: t.updates.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        }));
      }
    } catch (e) {}
    return INITIAL_TASKS;
  });

  // Notes State
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTES);
      if (saved) {
        return JSON.parse(saved).map((n: any) => ({
          ...n,
          lastModified: new Date(n.lastModified)
        }));
      }
    } catch (e) {}
    return INITIAL_NOTES;
  });

  // Links State
  const [links, setLinks] = useState<LinkEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LINKS);
      if (saved) {
        return JSON.parse(saved).map((l: any) => ({
          ...l,
          dateAdded: new Date(l.dateAdded)
        }));
      }
    } catch (e) {}
    return INITIAL_LINKS;
  });

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    return savedTheme ? savedTheme === 'dark' : true;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(links));
  }, [links]);

  // Handlers for Task App
  const handleTaskReorder = (newOrder: Task[]) => setTasks(newOrder);
  const handleUpdateTask = (taskId: string, updates: Message[]) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, updates } : t));
  };
  const handleStatusChange = (taskId: string, status: Task['status']) => {
    setTasks(prev => {
      const taskIndex = prev.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return prev;
      const updatedTask = { ...prev[taskIndex], status };
      const others = prev.filter(t => t.id !== taskId);
      return status === 'done' ? [...others, updatedTask] : prev.map(t => t.id === taskId ? updatedTask : t);
    });
  };
  const handlePriorityChange = (taskId: string, priority: Priority) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, priority } : t));
  };
  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTaskId === taskId) setSelectedTaskId(null);
  };
  const handleSaveTask = (taskData: any) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t));
      setEditingTask(null);
    } else {
      const newTask: Task = { id: Date.now().toString(), ...taskData, status: 'todo', updates: [] };
      setTasks(prev => [newTask, ...prev]);
      setSelectedTaskId(newTask.id);
    }
    setIsNewTaskModalOpen(false);
  };

  const handleExportData = () => {
    const data = { tasks, notes, links };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `taskflow-full-backup.json`;
    link.click();
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.tasks) setTasks(data.tasks.map((t: any) => ({ ...t, deadline: new Date(t.deadline), updates: t.updates.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })) })));
        if (data.notes) setNotes(data.notes.map((n: any) => ({ ...n, lastModified: new Date(n.lastModified) })));
        if (data.links) setLinks(data.links.map((l: any) => ({ ...l, dateAdded: new Date(l.dateAdded) })));
        alert("Backup restored!");
      } catch (err) { alert("Invalid backup file."); }
    };
    reader.readAsText(file);
  };

  const handleNavigateToTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setCurrentView('tasks');
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-300">
      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full h-full"
          >
            <Home 
              onLaunchApp={setCurrentView} 
              onExport={handleExportData}
              onImport={handleImportData}
              isDarkMode={isDarkMode}
              toggleTheme={() => setIsDarkMode(!isDarkMode)}
            />
          </motion.div>
        )}

        {currentView === 'tasks' && (
          <motion.div 
            key="tasks"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full h-full flex flex-col md:flex-row"
          >
            <TaskList 
              tasks={tasks} 
              setTasks={handleTaskReorder} 
              selectedTaskId={selectedTaskId}
              onSelectTask={(task) => setSelectedTaskId(task.id)}
              onAddNewTask={() => { setEditingTask(null); setIsNewTaskModalOpen(true); }}
              onGoHome={() => setCurrentView('home')}
            />
            <div className="flex flex-col flex-1 min-w-0">
              <ProjectProgress 
                tasks={tasks} 
              />
              <div className="flex-1 relative overflow-hidden">
                  <TaskDetail 
                    task={selectedTask} 
                    onUpdateTask={handleUpdateTask}
                    onStatusChange={handleStatusChange}
                    onNavigateToTask={handleNavigateToTask}
                    onPriorityChange={handlePriorityChange}
                    onDeleteTask={handleDeleteTask}
                    onEditTask={(t) => { setEditingTask(t); setIsNewTaskModalOpen(true); }}
                  />
              </div>
            </div>
            <NewTaskModal 
              isOpen={isNewTaskModalOpen}
              onClose={() => setIsNewTaskModalOpen(false)}
              onSave={handleSaveTask}
              taskToEdit={editingTask}
            />
          </motion.div>
        )}

        {currentView === 'notes' && (
          <motion.div 
            key="notes"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-full h-full"
          >
            <NotesApp 
              notes={notes} 
              tasks={tasks}
              onSaveNotes={setNotes} 
              onGoHome={() => setCurrentView('home')}
              onNavigateToTask={handleNavigateToTask}
            />
          </motion.div>
        )}

        {currentView === 'links' && (
          <motion.div 
            key="links"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            className="w-full h-full"
          >
            <LinksApp 
              links={links}
              onSaveLinks={setLinks}
              onGoHome={() => setCurrentView('home')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
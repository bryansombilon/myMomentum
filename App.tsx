
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
import { Home as HomeIcon, CheckSquare, StickyNote, Globe } from 'lucide-react';

const STORAGE_KEY_TASKS = 'taskflow_tasks_v1';
const STORAGE_KEY_NOTES = 'taskflow_notes_v1';
const STORAGE_KEY_LINKS = 'taskflow_links_v1';
const THEME_KEY = 'taskflow_theme';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
      setShowMobileDetail(false);
    }
  };
  const handleSaveTask = (taskData: any) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t));
      setEditingTask(null);
    } else {
      const newTask: Task = { id: Date.now().toString(), ...taskData, status: 'todo', updates: [] };
      setTasks(prev => [newTask, ...prev]);
      setSelectedTaskId(newTask.id);
      if (isMobile) setShowMobileDetail(true);
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
    if (isMobile) setShowMobileDetail(true);
  };

  const handleLaunchApp = (view: AppView) => {
    setCurrentView(view);
    setShowMobileDetail(false);
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  const MobileNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-50 flex items-center justify-around px-2">
      <NavButton active={currentView === 'home'} onClick={() => handleLaunchApp('home')} icon={HomeIcon} label="Home" />
      <NavButton active={currentView === 'tasks'} onClick={() => handleLaunchApp('tasks')} icon={CheckSquare} label="Tasks" />
      <NavButton active={currentView === 'notes'} onClick={() => handleLaunchApp('notes')} icon={StickyNote} label="Notes" />
      <NavButton active={currentView === 'links'} onClick={() => handleLaunchApp('links')} icon={Globe} label="Hub" />
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-300 pb-16 md:pb-0">
      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          // Fix: Using as any to bypass TypeScript error on initial/animate/exit props on motion.div
          <motion.div 
            key="home"
            {...({ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } as any)}
            className="w-full h-full"
          >
            <Home 
              onLaunchApp={handleLaunchApp} 
              onExport={handleExportData}
              onImport={handleImportData}
              isDarkMode={isDarkMode}
              toggleTheme={() => setIsDarkMode(!isDarkMode)}
            />
          </motion.div>
        )}

        {currentView === 'tasks' && (
          // Fix: Using as any to bypass TypeScript error on initial/animate props on motion.div
          <motion.div 
            key="tasks"
            {...({ initial: { opacity: 0 }, animate: { opacity: 1 } } as any)}
            className="w-full h-full flex flex-col md:flex-row"
          >
            {(!isMobile || !showMobileDetail) && (
              <TaskList 
                tasks={tasks} 
                setTasks={handleTaskReorder} 
                selectedTaskId={selectedTaskId}
                onSelectTask={(task) => {
                  setSelectedTaskId(task.id);
                  if (isMobile) setShowMobileDetail(true);
                }}
                onAddNewTask={() => { setEditingTask(null); setIsNewTaskModalOpen(true); }}
                onGoHome={() => setCurrentView('home')}
              />
            )}
            <div className={`flex flex-col flex-1 min-w-0 ${isMobile && !showMobileDetail ? 'hidden' : 'flex'}`}>
              <ProjectProgress tasks={tasks} />
              <div className="flex-1 relative overflow-hidden">
                  <TaskDetail 
                    task={selectedTask} 
                    onUpdateTask={handleUpdateTask}
                    onStatusChange={handleStatusChange}
                    onNavigateToTask={handleNavigateToTask}
                    onPriorityChange={handlePriorityChange}
                    onDeleteTask={handleDeleteTask}
                    onEditTask={(t) => { setEditingTask(t); setIsNewTaskModalOpen(true); }}
                    onBack={isMobile ? () => setShowMobileDetail(false) : undefined}
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
          // Fix: Using as any to bypass TypeScript error on initial/animate props on motion.div
          <motion.div 
            key="notes"
            {...({ initial: { opacity: 0 }, animate: { opacity: 1 } } as any)}
            className="w-full h-full"
          >
            <NotesApp 
              notes={notes} 
              tasks={tasks}
              onSaveNotes={setNotes} 
              onGoHome={() => setCurrentView('home')}
              onNavigateToTask={handleNavigateToTask}
              isMobile={isMobile}
            />
          </motion.div>
        )}

        {currentView === 'links' && (
          // Fix: Using as any to bypass TypeScript error on initial/animate props on motion.div
          <motion.div 
            key="links"
            {...({ initial: { opacity: 0 }, animate: { opacity: 1 } } as any)}
            className="w-full h-full"
          >
            <LinksApp 
              links={links}
              onSaveLinks={setLinks}
              onGoHome={() => setCurrentView('home')}
              isMobile={isMobile}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <MobileNav />
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: any; label: string }> = ({ active, onClick, icon: Icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`}>
    <Icon size={20} />
    <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

export default App;

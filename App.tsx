
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TaskList } from './components/TaskList';
import { TaskDetail } from './components/TaskDetail';
import { NewTaskModal } from './components/NewTaskModal';
import { ProjectProgress } from './components/ProjectProgress';
import { Home } from './components/Home';
import { NotesApp } from './components/NotesApp';
import { LinksApp } from './components/LinksApp';
import { LeavesApp } from './components/LeavesApp';
import { MakersAndMoversApp } from './components/MakersAndMoversApp';
import { GlobalNav } from './components/GlobalNav';
import { ReminderPopup } from './components/ReminderPopup';
import { EngagementApp } from './components/EngagementApp';
import { ClickUpApp } from './components/ClickUpApp';
import { INITIAL_TASKS, INITIAL_NOTES, INITIAL_LINKS, INITIAL_LEAVES, INITIAL_EVENT_ACTIVITIES, INITIAL_REMINDERS } from './constants';
import { Task, Message, Priority, AppView, Note, LinkEntry, LeaveEntry, EventActivity, Reminder } from './types';

const STORAGE_KEY_TASKS = 'taskflow_tasks_v1';
const STORAGE_KEY_NOTES = 'taskflow_notes_v1';
const STORAGE_KEY_LINKS = 'taskflow_links_v1';
const STORAGE_KEY_LEAVES = 'taskflow_leaves_v1';
const STORAGE_KEY_EVENTS = 'taskflow_events_v2'; 
const STORAGE_KEY_REMINDERS = 'taskflow_reminders_v1';
const THEME_KEY = 'taskflow_theme';

const SPRING_TRANSITION = { type: "spring" as const, stiffness: 260, damping: 26, mass: 1 };
const VIEW_VARIANTS = {
  initial: { opacity: 0, scale: 0.98, filter: 'blur(10px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 1.02, filter: 'blur(10px)' }
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      if (saved) {
        return JSON.parse(saved).map((t: any) => {
          const deadline = new Date(t.deadline);
          return { 
            ...t, 
            deadline: isNaN(deadline.getTime()) ? new Date() : deadline, 
            updates: Array.isArray(t.updates) ? t.updates.map((m: any) => {
              const ts = new Date(m.timestamp);
              return { ...m, timestamp: isNaN(ts.getTime()) ? new Date() : ts };
            }) : [] 
          };
        });
      }
    } catch (e) {}
    return INITIAL_TASKS;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTES);
      if (saved) return JSON.parse(saved).map((n: any) => {
        const mod = new Date(n.lastModified);
        return { ...n, lastModified: isNaN(mod.getTime()) ? new Date() : mod };
      });
    } catch (e) {}
    return INITIAL_NOTES;
  });

  const [links, setLinks] = useState<LinkEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LINKS);
      if (saved) return JSON.parse(saved).map((l: any) => {
        const ad = new Date(l.dateAdded);
        return { ...l, dateAdded: isNaN(ad.getTime()) ? new Date() : ad };
      });
    } catch (e) {}
    return INITIAL_LINKS;
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REMINDERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_REMINDERS;
  });

  const [leaves, setLeaves] = useState<LeaveEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LEAVES);
      if (saved) return JSON.parse(saved).map((l: any) => {
        const ld = new Date(l.date);
        return { ...l, date: isNaN(ld.getTime()) ? new Date() : ld };
      });
    } catch (e) {}
    return INITIAL_LEAVES;
  });

  const [eventActivities, setEventActivities] = useState<EventActivity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (saved) return JSON.parse(saved).map((e: any) => {
        const sd = new Date(e.startDate);
        const ed = new Date(e.endDate);
        return { 
          ...e, 
          startDate: isNaN(sd.getTime()) ? new Date() : sd, 
          endDate: isNaN(ed.getTime()) ? new Date() : ed 
        };
      });
    } catch (e) {}
    return INITIAL_EVENT_ACTIVITIES;
  });

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => localStorage.getItem(THEME_KEY) === 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
    localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(links));
    localStorage.setItem(STORAGE_KEY_LEAVES, JSON.stringify(leaves));
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(eventActivities));
    localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(reminders));
  }, [tasks, notes, links, leaves, eventActivities, reminders]);

  const handleTaskReorder = (newOrder: Task[]) => setTasks(newOrder);
  const handleUpdateTask = (taskId: string, updates: Message[]) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, updates } : t));
  const handleStatusChange = (taskId: string, status: Task['status']) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  const handlePriorityChange = (taskId: string, priority: Priority) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, priority } : t));
  
  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setSelectedTaskId(prevId => prevId === taskId ? null : prevId);
  }, []);

  const handleSaveTask = (taskData: any) => {
    if (editingTask) setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t));
    else {
      const newTask: Task = { id: Date.now().toString(), ...taskData, status: 'todo', updates: [] };
      setTasks(prev => [newTask, ...prev]);
      setSelectedTaskId(newTask.id);
    }
    setIsNewTaskModalOpen(false);
  };

  const handleNavigateToTask = (taskId: string) => { setSelectedTaskId(taskId); setCurrentView('tasks'); };
  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  const handleExport = () => {
    const backupData = {
      tasks,
      notes,
      links,
      reminders,
      leaves,
      eventActivities,
      isDarkMode,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `taskflow_complete_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (!result) return;
        const data = JSON.parse(result as string);
        
        if (Array.isArray(data.tasks)) {
          setTasks(data.tasks.map((t: any) => {
            const deadline = new Date(t.deadline);
            return {
              ...t,
              deadline: isNaN(deadline.getTime()) ? new Date() : deadline,
              updates: Array.isArray(t.updates) 
                ? t.updates.map((m: any) => {
                  const ts = new Date(m.timestamp);
                  return { ...m, timestamp: isNaN(ts.getTime()) ? new Date() : ts };
                }) 
                : []
            };
          }));
        }

        if (Array.isArray(data.notes)) {
          setNotes(data.notes.map((n: any) => {
            const mod = new Date(n.lastModified);
            return { ...n, lastModified: isNaN(mod.getTime()) ? new Date() : mod };
          }));
        }

        if (Array.isArray(data.links)) {
          setLinks(data.links.map((l: any) => {
            const ad = new Date(l.dateAdded);
            return { ...l, dateAdded: isNaN(ad.getTime()) ? new Date() : ad };
          }));
        }

        if (Array.isArray(data.reminders)) setReminders(data.reminders);

        if (Array.isArray(data.leaves)) {
          setLeaves(data.leaves.map((l: any) => {
            const ld = new Date(l.date);
            return { ...l, date: isNaN(ld.getTime()) ? new Date() : ld };
          }));
        }

        if (Array.isArray(data.eventActivities)) {
          setEventActivities(data.eventActivities.map((e: any) => {
            const sd = new Date(e.startDate);
            const ed = new Date(e.endDate);
            return {
              ...e,
              startDate: isNaN(sd.getTime()) ? new Date() : sd,
              endDate: isNaN(ed.getTime()) ? new Date() : ed
            };
          }));
        }

        if (typeof data.isDarkMode === 'boolean') {
          setIsDarkMode(data.isDarkMode);
        }

        setSelectedTaskId(null);
        alert('Restore successful!');
      } catch (err) {
        console.error("Restore Error:", err);
        alert('Failed to parse backup file.');
      }
    };
    reader.readAsText(file);
  };

  const renderView = () => {
    switch(currentView) {
      case 'home': return (
        <Home 
          onLaunchApp={setCurrentView} 
          onExport={handleExport} 
          onImport={handleImport} 
          isDarkMode={isDarkMode} 
          toggleTheme={() => setIsDarkMode(!isDarkMode)}
          tasks={tasks}
          activities={eventActivities}
          onNavigateToTask={handleNavigateToTask}
        />
      );
      case 'tasks': return (
        <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
          <TaskList 
            tasks={tasks} 
            setTasks={handleTaskReorder} 
            selectedTaskId={selectedTaskId} 
            onSelectTask={(task) => setSelectedTaskId(task.id)} 
            onAddNewTask={() => { setEditingTask(null); setIsNewTaskModalOpen(true); }} 
            onDeleteTask={handleDeleteTask}
          />
          <div className="flex flex-col flex-1 min-w-0">
            <ProjectProgress tasks={tasks} />
            <TaskDetail task={selectedTask} onUpdateTask={handleUpdateTask} onStatusChange={handleStatusChange} onPriorityChange={handlePriorityChange} onDeleteTask={handleDeleteTask} onEditTask={(t) => { setEditingTask(t); setIsNewTaskModalOpen(true); }} />
          </div>
        </div>
      );
      case 'notes': return <NotesApp notes={notes} tasks={tasks} onSaveNotes={setNotes} onNavigateToTask={handleNavigateToTask} />;
      case 'links': return <LinksApp links={links} onSaveLinks={setLinks} />;
      case 'leaves': return <LeavesApp leaves={leaves} onSaveLeaves={setLeaves} />;
      case 'event-timeline': return <MakersAndMoversApp activities={eventActivities} tasks={tasks} onSaveActivities={setEventActivities} onNavigateToTask={handleNavigateToTask} />;
      case 'engagement': return <EngagementApp reminders={reminders} onSaveReminders={setReminders} />;
      case 'clickup': return <ClickUpApp existingTasks={tasks} onImportTasks={(newTasks) => setTasks([...newTasks, ...tasks])} />;
      default: return null;
    }
  };

  return (
    <div className="relative flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-300">
      <div className="flex-1 relative h-full w-full">
        <AnimatePresence mode="wait">
          <motion.div key={currentView} variants={VIEW_VARIANTS} initial="initial" animate="animate" exit="exit" transition={SPRING_TRANSITION} className="w-full h-full">
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {currentView !== 'home' && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={SPRING_TRANSITION} className="z-[100]">
            <GlobalNav currentView={currentView} onNavigate={setCurrentView} />
          </motion.div>
        )}
      </AnimatePresence>
      <ReminderPopup reminders={reminders} />
      <NewTaskModal isOpen={isNewTaskModalOpen} onClose={() => setIsNewTaskModalOpen(false)} onSave={handleSaveTask} taskToEdit={editingTask} />
    </div>
  );
};

export default App;

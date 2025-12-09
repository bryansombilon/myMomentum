import React, { useState, useEffect } from 'react';
import { TaskList } from './components/TaskList';
import { TaskDetail } from './components/TaskDetail';
import { NewTaskModal } from './components/NewTaskModal';
import { ProjectProgress } from './components/ProjectProgress';
import { INITIAL_TASKS } from './constants';
import { Task, Message, ProjectType, Priority } from './types';

const STORAGE_KEY = 'taskflow_tasks_v1';
const THEME_KEY = 'taskflow_theme';

const App: React.FC = () => {
  // Initialize state from localStorage or fallback to INITIAL_TASKS
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedTasks = JSON.parse(saved);
        // Revive Date objects from ISO strings because JSON.stringify converts Dates to strings
        return parsedTasks.map((t: any) => ({
          ...t,
          deadline: new Date(t.deadline),
          updates: t.updates ? t.updates.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })) : [],
          priority: t.priority || 'not-urgent' // Default for existing tasks in storage
        }));
      }
    } catch (e) {
      console.error("Failed to load tasks from localStorage", e);
    }
    return INITIAL_TASKS;
  });

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme) return savedTheme === 'dark';
      // Default to dark mode if no preference
      return true;
    } catch {
      return true;
    }
  });

  // Apply Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDarkMode]);

  // Persist tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  const handleTaskReorder = (newOrder: Task[]) => {
    setTasks(newOrder);
  };

  const handleUpdateTask = (taskId: string, updates: Message[]) => {
    setTasks(prevTasks => 
      prevTasks.map(t => 
        t.id === taskId ? { ...t, updates } : t
      )
    );
  };

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    setTasks(prevTasks => 
      prevTasks.map(t => 
        t.id === taskId ? { ...t, status } : t
      )
    );
  };

  const handlePriorityChange = (taskId: string, priority: Priority) => {
    setTasks(prevTasks => 
      prevTasks.map(t => 
        t.id === taskId ? { ...t, priority } : t
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsNewTaskModalOpen(true);
  };

  const handleSaveTask = (taskData: {
    title: string;
    description: string;
    deadline: Date;
    clickupLink: string;
    project: ProjectType;
    priority: Priority;
  }) => {
    if (editingTask) {
      // Update existing task
      setTasks(prev => prev.map(t => 
        t.id === editingTask.id 
          ? { ...t, ...taskData } 
          : t
      ));
      setEditingTask(null);
    } else {
      // Create new task
      const newTask: Task = {
        id: Date.now().toString(),
        ...taskData,
        status: 'todo',
        updates: []
      };
      setTasks(prev => [newTask, ...prev]);
      setSelectedTaskId(newTask.id);
    }
    setIsNewTaskModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsNewTaskModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 overflow-hidden font-inter transition-colors duration-300">
      {/* Left Panel - Full Height */}
      <TaskList 
        tasks={tasks} 
        setTasks={handleTaskReorder} 
        selectedTaskId={selectedTaskId}
        onSelectTask={(task) => setSelectedTaskId(task.id)}
        onAddNewTask={() => {
          setEditingTask(null);
          setIsNewTaskModalOpen(true);
        }}
      />

      {/* Right Column: Progress + Details */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-0">
        
        {/* Project Progress Bar */}
        <ProjectProgress 
          tasks={tasks} 
          isDarkMode={isDarkMode}
          toggleTheme={() => setIsDarkMode(!isDarkMode)}
        />

        {/* Main Details Workspace */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 relative z-0 overflow-hidden transition-colors">
           <TaskDetail 
              task={selectedTask} 
              onUpdateTask={handleUpdateTask}
              onStatusChange={handleStatusChange}
              onPriorityChange={handlePriorityChange}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
           />
        </main>
      </div>

      {/* Modals */}
      <NewTaskModal 
        isOpen={isNewTaskModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        taskToEdit={editingTask}
      />
    </div>
  );
};

export default App;
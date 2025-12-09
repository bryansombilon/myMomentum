import React, { useState, useEffect } from 'react';
import { TaskList } from './components/TaskList';
import { TaskDetail } from './components/TaskDetail';
import { NewTaskModal } from './components/NewTaskModal';
import { INITIAL_TASKS } from './constants';
import { Task, Message, ProjectType } from './types';

const STORAGE_KEY = 'taskflow_tasks_v1';

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
          })) : []
        }));
      }
    } catch (e) {
      console.error("Failed to load tasks from localStorage", e);
    }
    return INITIAL_TASKS;
  });

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

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

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
  };

  const handleCreateTask = (taskData: {
    title: string;
    description: string;
    deadline: Date;
    clickupLink: string;
    project: ProjectType;
  }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      ...taskData,
      status: 'todo',
      updates: []
    };
    
    setTasks(prev => [newTask, ...prev]);
    setIsNewTaskModalOpen(false);
    setSelectedTaskId(newTask.id);
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-inter">
      {/* Left Panel */}
      <TaskList 
        tasks={tasks} 
        setTasks={handleTaskReorder} 
        selectedTaskId={selectedTaskId}
        onSelectTask={(task) => setSelectedTaskId(task.id)}
        onAddNewTask={() => setIsNewTaskModalOpen(true)}
      />

      {/* Right Panel */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-slate-950 relative z-0">
         <TaskDetail 
            task={selectedTask} 
            onUpdateTask={handleUpdateTask}
            onStatusChange={handleStatusChange}
            onDeleteTask={handleDeleteTask}
         />
      </main>

      {/* Modals */}
      <NewTaskModal 
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSave={handleCreateTask}
      />
    </div>
  );
};

export default App;

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox, ListTodo, ExternalLink, RefreshCw, 
  Loader2, AlertCircle, CheckCircle2, Clock, 
  User, Briefcase, ChevronRight, LayoutGrid,
  DownloadCloud, Check, Info, ShieldAlert,
  Hash, Layers, ChevronDown, List as ListIcon
} from 'lucide-react';
import { Task, ProjectType } from '../types';

const CLICKUP_TOKEN = 'pk_3632680_P3WZ8FHWX9JWOW6O6YZYIDEAEP8GW7ON';
const BASE_URL = 'https://api.clickup.com/api/v2';

interface ClickUpTask {
  id: string;
  name: string;
  status: { status: string; color: string; type: string };
  priority: { priority: string; color: string } | null;
  due_date: string | null;
  url: string;
  list: { name: string; id: string };
  folder?: { name: string; id: string };
  space?: { name: string; id: string };
}

interface ClickUpNotification {
  id: string;
  title: string;
  date: string;
  task?: { id: string; name: string };
}

interface ClickUpAppProps {
  existingTasks: Task[];
  onImportTasks: (tasks: Task[]) => void;
}

export const ClickUpApp: React.FC<ClickUpAppProps> = ({ existingTasks, onImportTasks }) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'tasks'>('tasks');
  const [selectedListId, setSelectedListId] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<ClickUpTask[]>([]);
  const [notifications, setNotifications] = useState<ClickUpNotification[]>([]);
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAll = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const headers = { 'Authorization': CLICKUP_TOKEN };
      
      // 1. Authenticate User
      const userRes = await fetch(`${BASE_URL}/user`, { headers });
      if (!userRes.ok) throw new Error('Unauthorized or invalid token');
      const userData = await userRes.json();
      setUser(userData.user);

      // 2. Get Teams (Workspaces)
      const teamsRes = await fetch(`${BASE_URL}/team`, { headers });
      const teamsData = await teamsRes.json();
      
      let allTasks: ClickUpTask[] = [];
      let allNotifications: ClickUpNotification[] = [];

      // 3. Aggregate Data from ALL Teams
      for (const team of teamsData.teams) {
        // Fetch Tasks
        try {
          const tasksRes = await fetch(`${BASE_URL}/team/${team.id}/task?assignees[]=${userData.user.id}&subtasks=true`, { headers });
          if (tasksRes.ok) {
            const taskData = await tasksRes.json();
            if (taskData.tasks) {
              const activeTasks = taskData.tasks.filter((t: any) => 
                t.status.type !== 'closed' && 
                t.status.status.toLowerCase() !== 'done' &&
                t.status.status.toLowerCase() !== 'completed'
              );
              allTasks = [...allTasks, ...activeTasks];
            }
          }
        } catch (e) { console.error(`Failed to fetch tasks for team ${team.id}`); }

        // Fetch Notifications (Global Inbox Fix)
        try {
          // Changed to standard notification endpoint
          const notifyRes = await fetch(`${BASE_URL}/team/${team.id}/notification`, { headers });
          if (notifyRes.ok) {
            const notifyData = await notifyRes.json();
            if (notifyData.notifications) {
              allNotifications = [...allNotifications, ...notifyData.notifications];
            }
          }
        } catch (e) { console.error(`Failed to fetch notifications for team ${team.id}`); }
      }

      setTasks(allTasks);
      
      // Sort notifications by date (newest first)
      const sortedNotifications = allNotifications.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setNotifications(sortedNotifications);

    } catch (err: any) {
      setError(err.message || 'Failed to sync with ClickUp Architecture');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const clickUpLists = useMemo(() => {
    const listMap = new Map<string, { name: string, count: number }>();
    tasks.forEach(t => {
      const listId = t.list.id;
      if (!listMap.has(listId)) {
        listMap.set(listId, { name: t.list.name, count: 0 });
      }
      listMap.get(listId)!.count += 1;
    });
    return Array.from(listMap.entries()).sort((a, b) => a[1].name.localeCompare(b[1].name));
  }, [tasks]);

  const filteredTasksList = useMemo(() => {
    if (selectedListId === 'All') return tasks;
    return tasks.filter(t => t.list.id === selectedListId);
  }, [tasks, selectedListId]);

  const groupedTasksByProject = useMemo(() => {
    const groups: Record<string, ClickUpTask[]> = {};
    filteredTasksList.forEach(task => {
      const groupName = task.folder?.name || task.space?.name || 'General';
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(task);
    });
    return groups;
  }, [filteredTasksList]);

  const existingClickUpIds = useMemo(() => {
    return new Set(existingTasks
      .map(t => {
        const match = t.clickupLink?.match(/\/t\/([a-zA-Z0-9]+)/);
        return match ? match[1] : null;
      })
      .filter(id => id !== null));
  }, [existingTasks]);

  const handleImport = (cuTask: ClickUpTask) => {
    if (existingClickUpIds.has(cuTask.id)) {
      showToast(`Warning: Task #${cuTask.id} is already in your TaskFlow list.`, 'warning');
      return;
    }

    const newTask: Task = {
      id: `cu-${cuTask.id}-${Date.now()}`,
      title: cuTask.name,
      description: `Imported from ClickUp. List: ${cuTask.list.name} • Space: ${cuTask.space?.name || 'N/A'}`,
      deadline: cuTask.due_date ? new Date(parseInt(cuTask.due_date)) : new Date(),
      clickupLink: cuTask.url,
      project: ProjectType.GALA, 
      updates: [],
      status: 'todo',
      priority: cuTask.priority?.priority === 'urgent' ? 'urgent' : 'not-urgent'
    };

    onImportTasks([newTask]);
    showToast(`Successfully imported "${cuTask.name}" to TaskFlow.`, 'success');
  };

  const formatDate = (ts: string | null) => {
    if (!ts) return 'No Due Date';
    const d = new Date(parseInt(ts));
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-8 left-1/2 z-[1000] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-xs uppercase tracking-wider border backdrop-blur-md ${
              toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-400' :
              toast.type === 'warning' ? 'bg-amber-500 text-white border-amber-300' :
              'bg-indigo-600 text-white border-indigo-400'
            }`}
          >
            {toast.type === 'warning' ? <ShieldAlert size={18} /> : <CheckCircle2 size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 transition-colors shrink-0">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <LayoutGrid size={20} className="text-white" />
             </div>
             <div>
                <h1 className="text-lg font-black uppercase tracking-tighter text-slate-900 dark:text-white">ClickUp</h1>
                <p className="text-[8px] font-black uppercase tracking-widest text-indigo-500">Live Workspace</p>
             </div>
          </div>
          <button onClick={fetchAll} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group">
             <RefreshCw size={16} className={`${isLoading ? 'animate-spin' : 'group-active:rotate-180'} text-slate-400 transition-transform duration-500`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
          <div className="space-y-1.5">
            <button 
              onClick={() => setActiveTab('inbox')}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all ${activeTab === 'inbox' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <div className="flex items-center gap-3">
                <Inbox size={18} strokeWidth={2.5} />
                <span className="text-xs font-bold uppercase tracking-widest">Global Inbox</span>
              </div>
              {notifications.length > 0 && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === 'inbox' ? 'bg-white/20' : 'bg-rose-500 text-white animate-pulse'}`}>{notifications.length}</span>
              )}
            </button>
          </div>

          <div className="space-y-3">
            <div className="px-4 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Workspace Lists</span>
              <Layers size={12} className="text-slate-300" />
            </div>

            <div className="space-y-1">
              <button 
                onClick={() => { setActiveTab('tasks'); setSelectedListId('All'); }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all ${activeTab === 'tasks' && selectedListId === 'All' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <div className="flex items-center gap-3">
                  <ListTodo size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Everything</span>
                </div>
                <span className="text-[10px] font-black opacity-60 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{tasks.length}</span>
              </button>

              {clickUpLists.map(([id, data]) => {
                const isActive = activeTab === 'tasks' && selectedListId === id;

                return (
                  <button 
                    key={id}
                    onClick={() => { setActiveTab('tasks'); setSelectedListId(id); }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <div className="flex items-center gap-3 truncate pr-4">
                      <ListIcon size={16} className={`${isActive ? 'text-white' : 'text-slate-300 dark:text-slate-600 group-hover:text-indigo-400'}`} />
                      <span className="text-xs font-bold uppercase tracking-widest truncate">{data.name}</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md transition-all ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      {data.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
           {user && (
             <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 shadow-sm overflow-hidden">
                   <User size={22} />
                </div>
                <div className="min-w-0">
                   <p className="text-xs font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{user.username}</p>
                   <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Protocol Active</p>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="p-10 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0 transition-colors">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">
                {activeTab === 'tasks' ? (selectedListId === 'All' ? 'Workspace Core' : clickUpLists.find(l => l[0] === selectedListId)?.[1].name) : 'Signal Inbox'}
              </h2>
            </div>
            <p className="text-[10px] font-bold uppercase text-indigo-500 tracking-[0.3em]">
              {activeTab === 'tasks' ? `${filteredTasksList.length} Active Modules Found` : `System Feed • ${notifications.length} Multi-Workspace Alerts`}
            </p>
          </div>
          {isLoading && (
            <div className="flex items-center gap-3 px-5 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
               <Loader2 className="animate-spin text-indigo-600" size={16} />
               <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Syncing Hub...</span>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-10 pb-40 no-scrollbar scroll-smooth">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-6 text-slate-300 select-none">
              <div className="relative">
                 <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }} 
                    transition={{ repeat: Infinity, duration: 2 }} 
                    className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl" 
                 />
                 <Loader2 className="animate-spin relative z-10" size={56} strokeWidth={1} />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.4em] animate-pulse">Mapping Workspace Geometry...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center p-12">
               <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center text-rose-500 mb-6 border border-rose-100 dark:border-rose-900/30">
                  <AlertCircle size={40} />
               </div>
               <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2">Interface Disconnected</h3>
               <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">{error}</p>
               <button onClick={fetchAll} className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Establish Connection</button>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'tasks' ? (
                  <motion.div 
                    key="tasks-view"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-16"
                  >
                    {Object.keys(groupedTasksByProject).length > 0 ? (Object.entries(groupedTasksByProject) as [string, ClickUpTask[]][]).map(([groupName, groupTasks]) => (
                      <div key={groupName} className="space-y-6">
                        <div className="flex items-center gap-6">
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 whitespace-nowrap">{groupName}</h3>
                           </div>
                           <div className="h-px w-full bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent" />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-5">
                          {groupTasks.map(task => {
                            const isAlreadySynced = existingClickUpIds.has(task.id);
                            
                            return (
                              <motion.div 
                                key={task.id} 
                                whileHover={{ scale: 1.01, x: 4 }}
                                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] flex items-center gap-8 shadow-sm hover:shadow-2xl hover:border-indigo-500/50 transition-all duration-500 relative overflow-hidden"
                              >
                                <div className="absolute top-0 bottom-0 left-0 w-1.5" style={{ backgroundColor: task.status.color }} />
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-3">
                                    <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800/40 font-mono tracking-tighter">#{task.id}</span>
                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-lg">
                                       <Hash size={10} />
                                       {task.list.name}
                                    </div>
                                    {isAlreadySynced && (
                                      <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800/40">
                                        <Check size={11} strokeWidth={3} /> Synced
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="text-xl font-bold text-slate-800 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight tracking-tight mb-4">{task.name}</h3>
                                  
                                  <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                      <Clock size={14} className="text-slate-400" />
                                      {formatDate(task.due_date)}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50" style={{ color: task.status.color }}>
                                      <CheckCircle2 size={14} />
                                      {task.status.status}
                                    </div>
                                    {task.space?.name && (
                                       <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                          <Layers size={12} /> {task.space.name}
                                       </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  {!isAlreadySynced ? (
                                    <button 
                                      onClick={() => handleImport(task)}
                                      className="flex items-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] transition-all shadow-xl shadow-indigo-600/30 active:scale-90 font-black text-[10px] uppercase tracking-widest"
                                    >
                                      <DownloadCloud size={18} />
                                      <span className="hidden sm:inline">Import</span>
                                    </button>
                                  ) : (
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-[1.5rem] border border-emerald-100 dark:border-emerald-800/40">
                                       <Check size={20} strokeWidth={3} />
                                    </div>
                                  )}
                                  <button 
                                    onClick={() => window.open(task.url, '_blank')}
                                    className="p-4 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-slate-100 dark:border-slate-700"
                                    title="Open in ClickUp"
                                  >
                                    <ExternalLink size={20} />
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )) : (
                      <div className="flex flex-col items-center justify-center py-40 opacity-20 text-slate-400 select-none pointer-events-none">
                        <ListTodo size={80} strokeWidth={1} className="mb-6" />
                        <p className="text-xl font-black uppercase tracking-[0.3em] text-center">Protocol Clear • No Matches Found</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="inbox-view"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-5"
                  >
                    {notifications.length > 0 ? (notifications as ClickUpNotification[]).map(notif => (
                      <div key={notif.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-sm group hover:border-indigo-500/30 transition-all">
                         <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                            <Inbox size={24} />
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-base font-bold text-slate-900 dark:text-white leading-tight mb-2">{notif.title}</p>
                            <div className="flex items-center gap-3">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{new Date(parseInt(notif.date)).toLocaleString()}</p>
                               <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">Signal Match</span>
                            </div>
                         </div>
                         {notif.task && (
                           <button 
                             onClick={() => window.open(`https://app.clickup.com/t/${notif.task?.id}`, '_blank')}
                             className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                           >
                             Respond
                           </button>
                         )}
                      </div>
                    )) : (
                      <div className="flex flex-col items-center justify-center py-40 opacity-20 text-slate-400 select-none pointer-events-none">
                        <Inbox size={80} strokeWidth={1} className="mb-6" />
                        <p className="text-xl font-black uppercase tracking-[0.3em] text-center">Inbox Neutral • No New Signals</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

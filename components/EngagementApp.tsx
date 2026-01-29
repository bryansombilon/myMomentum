
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reminder } from '../types';
import { 
  Plus, Trash2, Clock, Globe, 
  CheckCircle2, X, ExternalLink, Activity, 
  Zap, ShieldCheck, ToggleLeft, ToggleRight
} from 'lucide-react';

interface EngagementAppProps {
  reminders: Reminder[];
  onSaveReminders: (reminders: Reminder[]) => void;
}

export const EngagementApp: React.FC<EngagementAppProps> = ({ reminders, onSaveReminders }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [time, setTime] = useState('09:00');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [actionType, setActionType] = useState<'link' | 'dismiss'>('link');
  const [actionUrl, setActionUrl] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'weekends'>('daily');

  const openModal = (reminder?: Reminder) => {
    if (reminder) {
      setEditingId(reminder.id);
      setTime(reminder.time);
      setLabel(reminder.label);
      setDescription(reminder.description);
      setActionType(reminder.actionType);
      setActionUrl(reminder.actionUrl || '');
      setFrequency(reminder.frequency);
    } else {
      setEditingId(null);
      setTime('09:00');
      setLabel('');
      setDescription('');
      setActionType('link');
      setActionUrl('');
      setFrequency('daily');
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newReminder: Reminder = {
      id: editingId || Date.now().toString(),
      time,
      label,
      description,
      actionType,
      actionUrl: actionType === 'link' ? actionUrl : undefined,
      enabled: true,
      frequency
    };

    if (editingId) {
      onSaveReminders(reminders.map(r => r.id === editingId ? newReminder : r));
    } else {
      onSaveReminders([...reminders, newReminder]);
    }
    setShowModal(false);
  };

  const toggleEnable = (id: string) => {
    onSaveReminders(reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const deleteReminder = (id: string) => {
    if (confirm('Delete this engagement protocol?')) {
      onSaveReminders(reminders.filter(r => r.id !== id));
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <h1 className="text-2xl font-bold uppercase bg-clip-text text-transparent bg-gradient-to-br from-indigo-500 to-purple-600">ProtocolFlow</h1>
          <button onClick={() => openModal()} className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md shadow-sm active:scale-95 transition-all">
            <Plus size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-500/20 mb-4 relative overflow-hidden">
             <Activity className="absolute -right-2 -bottom-2 w-24 h-24 opacity-10" />
             <div className="text-[10px] font-bold uppercase opacity-60 mb-2">Protocol Health</div>
             <div className="text-3xl font-bold mb-1">{reminders.filter(r => r.enabled).length} <span className="text-sm font-bold opacity-60">Active</span></div>
             <div className="text-[10px] font-bold opacity-60 uppercase">Scheduled Interrupts</div>
          </div>
          <div className="px-2 space-y-3">
             <div className="text-[9px] font-bold uppercase text-slate-400">Scheduled Actions</div>
             {reminders.sort((a,b) => a.time.localeCompare(b.time)).map(r => (
               <button 
                 key={r.id} 
                 onClick={() => openModal(r)}
                 className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${r.enabled ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm' : 'bg-slate-50 dark:bg-slate-900 border-transparent opacity-50'}`}
               >
                 <div>
                   <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{r.time}</div>
                   <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">{r.label}</div>
                 </div>
                 <div className={`w-2 h-2 rounded-full ${r.enabled ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-slate-300'}`} />
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="p-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between transition-colors">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase">Engagement Protocol Manager</h2>
            <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">Configure automated system interrupts and engagement actions</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-800/50">
            <Zap size={14} /> System Ready
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 pb-32 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {reminders.map(r => (
                <motion.div 
                  layout key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`group bg-white dark:bg-slate-900 border ${r.enabled ? 'border-slate-200 dark:border-slate-800' : 'border-transparent opacity-60'} p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden`}
                >
                  <div className={`absolute top-0 right-0 p-8 flex gap-2 transition-all ${r.enabled ? 'opacity-40 group-hover:opacity-100' : 'opacity-100'}`}>
                    <button onClick={() => toggleEnable(r.id)} className={`p-2 rounded-xl transition-all ${r.enabled ? 'text-indigo-600 hover:bg-indigo-50' : 'text-slate-400 hover:bg-slate-100'}`}>
                      {r.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                    <button onClick={() => deleteReminder(r.id)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                      <Clock size={32} />
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">{r.time}</div>
                      <div className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">{r.frequency} Protocol</div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 uppercase">{r.label}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed italic">"{r.description}"</p>

                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
                    <div className="flex items-center gap-2">
                       {r.actionType === 'link' ? <Globe size={16} className="text-slate-400" /> : <ShieldCheck size={16} className="text-slate-400" />}
                       <span className="text-[10px] font-bold uppercase text-slate-500">{r.actionType === 'link' ? 'External Redirect' : 'System Dismiss'}</span>
                    </div>
                    <button onClick={() => openModal(r)} className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-bold uppercase active:scale-95 transition-all">Config</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase">{editingId ? 'Modify' : 'Initialize'} Protocol</h2>
                <button onClick={() => setShowModal(false)}><X size={24} className="text-slate-400" /></button>
              </div>
              <form onSubmit={handleSave} className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Trigger Time</label>
                    <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Frequency</label>
                    <select value={frequency} onChange={(e) => setFrequency(e.target.value as any)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold uppercase dark:text-white">
                      <option value="daily">Everyday</option>
                      <option value="weekdays">Weekdays (M-F)</option>
                      <option value="weekends">Weekends (S-S)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Protocol Label</label>
                  <input required value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. LinkedIn Engagement" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Context Briefing</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Why is this interrupt necessary?" className="w-full h-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium dark:text-white resize-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Action Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => setActionType('link')} className={`py-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${actionType === 'link' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>External Link</button>
                    <button type="button" onClick={() => setActionType('dismiss')} className={`py-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${actionType === 'dismiss' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>System Exit</button>
                  </div>
                </div>
                {actionType === 'link' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Destination URL</label>
                    <input required value={actionUrl} onChange={(e) => setActionUrl(e.target.value)} placeholder="https://..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium dark:text-white" />
                  </div>
                )}
                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-[11px] font-bold uppercase text-slate-400">Abort</button>
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-bold uppercase shadow-xl shadow-indigo-500/30 active:scale-95 transition-all">Save Protocol</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

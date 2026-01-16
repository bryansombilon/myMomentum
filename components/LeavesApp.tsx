
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeaveEntry, LeaveType, LeaveDuration, HalfDayPeriod } from '../types';
import { LEAVE_LIMITS } from '../constants';
import { 
  Plus, CalendarDays, Trash2, Home, 
  ChevronRight, ArrowRight, UserCheck, 
  AlertCircle, Info, Clock, Check, X, AlertTriangle
} from 'lucide-react';

interface LeavesAppProps {
  leaves: LeaveEntry[];
  onSaveLeaves: (leaves: LeaveEntry[]) => void;
  onGoHome: () => void;
}

export const LeavesApp: React.FC<LeavesAppProps> = ({ leaves, onSaveLeaves, onGoHome }) => {
  const [type, setType] = useState<LeaveType>('Vacation');
  const [duration, setDuration] = useState<LeaveDuration>('Full');
  const [halfDayPeriod, setHalfDayPeriod] = useState<HalfDayPeriod>('AM');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  
  // Custom Delete Modal State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const usedVacation = leaves
      .filter(l => l.type === 'Vacation')
      .reduce((acc, curr) => acc + (curr.duration === 'Full' ? 1 : 0.5), 0);
    
    const usedSick = leaves
      .filter(l => l.type === 'Sick')
      .reduce((acc, curr) => acc + (curr.duration === 'Full' ? 1 : 0.5), 0);

    return {
      vacation: { used: usedVacation, total: LEAVE_LIMITS.Vacation, remaining: LEAVE_LIMITS.Vacation - usedVacation },
      sick: { used: usedSick, total: LEAVE_LIMITS.Sick, remaining: LEAVE_LIMITS.Sick - usedSick },
    };
  }, [leaves]);

  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    const newEntry: LeaveEntry = {
      id: Date.now().toString(),
      type,
      duration,
      halfDayPeriod: duration === 'Half' ? halfDayPeriod : undefined,
      date: new Date(date),
      reason: reason.trim() || 'No reason provided'
    };

    onSaveLeaves([newEntry, ...leaves]);
    setReason('');
    // Reset defaults for next entry if needed
    setDuration('Full');
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onSaveLeaves(leaves.filter(l => l.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const sortedLeaves = useMemo(() => {
    return [...leaves].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [leaves]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      
      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center mb-4">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Entry?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Are you sure you want to remove this leave record? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-px bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-4 text-sm font-bold text-rose-600 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors uppercase tracking-widest"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar: Dashboard & Form */}
      <div className="w-full md:w-[400px] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <button 
              onClick={onGoHome} 
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-white dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
              title="Return Home"
            >
              <Home size={18} />
            </button>
            <h1 className="text-2xl font-bold tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-br from-sky-500 to-blue-600">LeaveFlow</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          
          {/* Stats Cards */}
          <div className="space-y-4">
             <LeaveStatCard 
              label="Vacation Leave" 
              used={stats.vacation.used} 
              total={stats.vacation.total} 
              color="text-sky-600" 
              bgColor="bg-sky-50 dark:bg-sky-900/20"
              progressColor="bg-sky-500"
             />
             <LeaveStatCard 
              label="Sick Leave" 
              used={stats.sick.used} 
              total={stats.sick.total} 
              color="text-rose-600" 
              bgColor="bg-rose-50 dark:bg-rose-900/20"
              progressColor="bg-rose-500"
             />
          </div>

          {/* Add Form */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
              <Plus size={14} /> Record New Absence
            </h3>
            
            <form onSubmit={handleAddLeave} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Leave Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Vacation', 'Sick'] as LeaveType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-2 text-[11px] font-bold uppercase rounded-xl border transition-all ${type === t ? 'bg-white dark:bg-slate-700 border-sky-500 text-sky-600 shadow-sm' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-400'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Duration</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Full', 'Half'] as LeaveDuration[]).map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`py-2 text-[11px] font-bold uppercase rounded-xl border transition-all ${duration === d ? 'bg-white dark:bg-slate-700 border-sky-500 text-sky-600 shadow-sm' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-400'}`}
                    >
                      {d} Day
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional AM/PM Selection */}
              <AnimatePresence>
                {duration === 'Half' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Select Period</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['AM', 'PM'] as HalfDayPeriod[]).map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setHalfDayPeriod(p)}
                          className={`py-2 text-[11px] font-bold uppercase rounded-xl border transition-all ${halfDayPeriod === p ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-600 shadow-sm' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-400'}`}
                        >
                          {p} Session
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Date</label>
                <input 
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-sky-500 transition-colors dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Reason (Optional)</label>
                <textarea 
                  placeholder="Vacation trip, rest, appointment..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-sky-500 transition-colors dark:text-white h-20 resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-[12px] font-bold uppercase tracking-[0.15em] transition-all shadow-lg shadow-sky-600/20 active:scale-[0.98]"
              >
                Log Entry
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content: History */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Absence History</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Timeline of logged leaves</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
             <Clock size={14} className="text-slate-400" />
             <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tighter">{leaves.length} Entries Logged</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
          <AnimatePresence mode="popLayout" initial={false}>
            {sortedLeaves.map((entry) => (
              <motion.div
                layout
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all hover:border-sky-500/30"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${entry.type === 'Vacation' ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/30' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30'}`}>
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                        {new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(entry.date))}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter ${entry.type === 'Vacation' ? 'bg-sky-500/10 text-sky-600' : 'bg-rose-500/10 text-rose-600'}`}>
                        {entry.type}
                      </span>
                    </div>
                    <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                      {entry.duration} Day {entry.duration === 'Half' && <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase text-[10px]">({entry.halfDayPeriod})</span>} — "{entry.reason}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                     <div className="text-[11px] font-bold text-slate-800 dark:text-white uppercase tracking-tight">-{entry.duration === 'Full' ? '1.0' : '0.5'} Unit</div>
                     <div className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Deduction</div>
                  </div>
                  <button 
                    onClick={() => setDeleteConfirmId(entry.id)}
                    className="p-2 text-slate-300 hover:text-rose-600 dark:text-slate-700 dark:hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {leaves.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
              <CalendarDays size={80} strokeWidth={1} className="text-slate-400 mb-6" />
              <p className="text-[12px] font-black uppercase tracking-[0.4em]">No Logs Detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LeaveStatCard: React.FC<{ 
  label: string; 
  used: number; 
  total: number; 
  color: string; 
  bgColor: string; 
  progressColor: string;
}> = ({ label, used, total, color, bgColor, progressColor }) => {
  const percentage = Math.min((used / total) * 100, 100);
  const remaining = Math.max(total - used, 0);

  return (
    <div className={`p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all shadow-sm group`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${progressColor} animate-pulse`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">{label}</span>
        </div>
        <span className={`text-[18px] font-black ${color}`}>{remaining} <span className="text-[10px] text-slate-400">LEFT</span></span>
      </div>

      <div className="relative h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`absolute h-full ${progressColor} rounded-full`}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Consumed</span>
        <span className="text-[12px] font-black text-slate-800 dark:text-slate-100">{used} / {total} Days</span>
      </div>
    </div>
  );
};


import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ExternalLink, Sparkles, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { Reminder } from '../types';

const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

interface ReminderPopupProps {
  reminders: Reminder[];
}

export const ReminderPopup: React.FC<ReminderPopupProps> = ({ reminders }) => {
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastTriggeredTime, setLastTriggeredTime] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio once
  useEffect(() => {
    const audio = new Audio(NOTIFICATION_SOUND);
    audio.volume = 0.4;
    audio.loop = true; // Continuous ringtone
    audioRef.current = audio;
    
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Handle playing/stopping based on active state
  useEffect(() => {
    if (activeReminder) {
      audioRef.current?.play().catch(e => console.warn("Audio play blocked:", e));
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [activeReminder]);

  useEffect(() => {
    const handleManualTrigger = () => {
      if (reminders.length > 0) {
        setActiveReminder(reminders[0]);
      }
    };
    window.addEventListener('trigger-engagement-reminder', handleManualTrigger);

    const checkTime = () => {
      const now = new Date();
      const currentTimeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
      const day = now.getDay();

      const matched = reminders.find(r => {
        if (!r.enabled) return false;
        
        // Check frequency/days
        const isCorrectDay = 
          r.frequency === 'daily' ||
          (r.frequency === 'weekdays' && (day > 0 && day < 6)) ||
          (r.frequency === 'weekends' && (day === 0 || day === 6)) ||
          (r.frequency === 'custom' && r.customDays?.includes(day));

        if (!isCorrectDay) return false;

        // Check times
        return r.times.includes(currentTimeStr);
      });

      if (matched && lastTriggeredTime !== currentTimeStr) {
        setActiveReminder(matched);
        setLastTriggeredTime(currentTimeStr);
      }

      if (matched === undefined && lastTriggeredTime === currentTimeStr) {
        // Just let it pass
      } else if (matched === undefined) {
        setLastTriggeredTime(null);
      }
    };

    const interval = setInterval(checkTime, 1000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('trigger-engagement-reminder', handleManualTrigger);
    };
  }, [lastTriggeredTime, reminders]);

  const handleAction = () => {
    if (!activeReminder) return;
    setIsVerifying(true);
    
    if (activeReminder.actionType === 'link' && activeReminder.actionUrl) {
      window.open(activeReminder.actionUrl, '_blank');
    }
    
    setTimeout(() => {
      setActiveReminder(null);
      setIsVerifying(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {activeReminder && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" />

          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/20 dark:border-slate-800/80 overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
            <div className="p-12 flex flex-col items-center text-center relative z-10">
              <div className="relative mb-10">
                <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl" />
                <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center relative shadow-2xl">
                  <Bell size={44} className="text-white" />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold uppercase mb-8 border border-indigo-100 dark:border-indigo-800/50">
                <Sparkles size={14} className="animate-pulse" /> Engagement Protocol
              </div>

              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-5 leading-tight">
                {activeReminder.label}
              </h2>
              
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-12 font-medium max-w-sm">
                {activeReminder.description}
              </p>

              <div className="w-full space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isVerifying}
                  onClick={handleAction}
                  className={`relative w-full flex items-center justify-center gap-4 px-8 py-6 rounded-[2rem] text-sm font-bold uppercase shadow-2xl transition-all group overflow-hidden ${
                    isVerifying ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/40'
                  }`}
                >
                  {isVerifying ? (
                    <><Loader2 size={24} className="animate-spin" /> Processing...</>
                  ) : (
                    <>
                      {activeReminder.actionType === 'link' ? <ExternalLink size={24} /> : <CheckCircle2 size={24} />}
                      {activeReminder.actionType === 'link' ? 'Open Portal' : 'Complete Protocol'}
                    </>
                  )}
                </motion.button>
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase pt-2">
                  <ShieldCheck size={14} /> System Lock: Interaction Required
                </div>
              </div>
            </div>
            <AnimatePresence>
              {isVerifying && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20 bg-emerald-600 flex flex-col items-center justify-center text-white p-10 text-center">
                   <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}><CheckCircle2 size={100} /></motion.div>
                   <h3 className="text-2xl font-bold mt-6 uppercase">Protocol Confirmed</h3>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

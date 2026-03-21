"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Sparkles, X } from "lucide-react";
import { theme } from "@config/design-system";
import { getMascotMessage, personalities } from "@lib/personalities";

export default function AchievementUnlockPopup({ achievement, onComplete, mascotId = "goku" }) {
  const [show, setShow] = useState(true);

  const handleClose = useCallback(() => {
    setShow(false);
    setTimeout(() => onComplete?.(), 500);
  }, [onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [handleClose]);

  if (!achievement) return null;

  const mascot = personalities[mascotId] || personalities.goku;
  const comment = getMascotMessage(mascotId, 'achievement', achievement.name);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-x-0 top-10 z-[100] flex justify-center px-4 pointer-events-none">
          <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.9 }}
            className="bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-xl border border-amber-400/30 rounded-3xl p-6 shadow-2xl shadow-amber-500/20 max-w-sm w-full pointer-events-auto"
          >
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <motion.div
                initial={{ rotate: -10, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-amber-400 blur-2xl opacity-20 animate-pulse"></div>
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-5xl shadow-xl">
                  {achievement.icon}
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-lg"
                >
                  <Trophy size={18} className="text-amber-500" />
                </motion.div>
              </motion.div>

              <div>
                <h3 className="text-amber-400 text-xs font-black uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
                  <Sparkles size={12} /> Conquista Desbloqueada!
                </h3>
                <h2 className="text-xl font-black text-white">{achievement.name}</h2>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">{achievement.description}</p>
              </div>

              <div className="w-full h-px bg-slate-800/50"></div>

              <div className="flex items-start gap-4 text-left bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50">
                <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0 border border-white/5">
                  <Trophy className="text-violet-400" size={24} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-widest">{mascot.name}</h4>
                  <p className="text-xs text-slate-300 font-medium italic mt-0.5">&quot;{comment}&quot;</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                <Star size={10} className="fill-amber-500" /> +100 XP DE DISCIPLINAR
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

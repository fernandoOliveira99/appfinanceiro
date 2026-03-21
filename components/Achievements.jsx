"use client";

import { useEffect, useState } from "react";
import { theme } from "@config/design-system";
import { Trophy, Lock, CheckCircle2, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();

    const handleUpdate = () => {
      fetchAchievements();
    };
    window.addEventListener('achievement-unlocked', handleUpdate);
    return () => window.removeEventListener('achievement-unlocked', handleUpdate);
  }, []);

  async function fetchAchievements() {
    try {
      const res = await fetch("/api/achievements");
      const data = await res.json();
      if (data.achievements) {
        setAchievements(data.achievements);
      }
    } catch (error) {
      console.error("Failed to fetch achievements", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
    </div>
  );

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`${theme.typography.sectionTitle} flex items-center gap-2`}>
            <Trophy className="text-amber-400" size={24} /> Conquistas
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-widest">
            {unlockedCount} de {achievements.length} desbloqueadas
          </p>
        </div>
        <div className="bg-amber-400/10 px-3 py-1.5 rounded-full flex items-center gap-2">
          <Star className="text-amber-400 fill-amber-400" size={14} />
          <span className="text-xs font-black text-amber-500">{unlockedCount * 100} XP</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative overflow-hidden p-4 rounded-3xl border transition-all duration-300 ${
              achievement.unlocked 
                ? "bg-white dark:bg-slate-900 border-violet-500/20 shadow-lg shadow-violet-500/5" 
                : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-60 grayscale"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${
                achievement.unlocked ? "bg-violet-100 dark:bg-violet-500/10" : "bg-slate-100 dark:bg-slate-800/50"
              }`}>
                {achievement.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`text-sm font-black truncate ${achievement.unlocked ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
                    {achievement.name}
                  </h4>
                  {achievement.unlocked ? (
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  ) : (
                    <Lock size={12} className="text-slate-400 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {achievement.description}
                </p>
                
                {/* Progress Bar for locked achievements */}
                {!achievement.unlocked && (
                   <div className="mt-3">
                     <div className="flex justify-between items-center mb-1">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progresso</span>
                       <span className="text-[10px] font-bold text-slate-400">{achievement.current_value} / {achievement.target_value}</span>
                     </div>
                     <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${achievement.progress}%` }}
                         className="h-full bg-violet-500 rounded-full transition-all duration-1000"
                       ></motion.div>
                     </div>
                   </div>
                )}
              </div>
            </div>

            {/* Background pattern for unlocked */}
            {achievement.unlocked && (
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                <Trophy size={80} />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

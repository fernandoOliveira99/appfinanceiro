"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { theme } from "@config/design-system";
import { getMascotMessage, personalities } from "@lib/personalities";
import { 
  Bird, Cat, Dog, Ghost, Gamepad2, Zap, User, Star, Flame, HardHat, Moon, Shield 
} from "lucide-react";

const MASCOTS = [
  { id: "finny", name: "Finny", icon: Bird, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { id: "miau", name: "Miau", icon: Cat, color: "text-amber-400", bg: "bg-amber-500/10" },
  { id: "doguinho", name: "Doguinho", icon: Dog, color: "text-blue-400", bg: "bg-blue-500/10" },
  { id: "ghost", name: "Fantasmil", icon: Ghost, color: "text-purple-400", bg: "bg-purple-500/10" },
  { id: "gamer", name: "Pixel", icon: Gamepad2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { id: "goku", name: "Goku", icon: Zap, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "gohan", name: "Gohan", icon: User, color: "text-purple-400", bg: "bg-purple-500/10" },
  { id: "mario", name: "Mario", icon: Star, color: "text-rose-500", bg: "bg-rose-500/10" },
  { id: "naruto", name: "Naruto", icon: Flame, color: "text-orange-600", bg: "bg-orange-600/10" },
  { id: "pikachu", name: "Pikachu", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { id: "ironman", name: "Iron Man", icon: HardHat, color: "text-red-600", bg: "bg-red-600/10" },
  { id: "batman", name: "Batman", icon: Moon, color: "text-gray-400", bg: "bg-gray-700/20" },
  { id: "vader", name: "Darth Vader", icon: Shield, color: "text-red-500", bg: "bg-red-900/20" },
];

export default function SmartTips({ mascotId = "goku" }) {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(new Set());

  // Force re-fetch and re-render tips whenever mascotId changes
  useEffect(() => {
    fetchTips();
  }, []); 

  async function fetchTips() {
    setLoading(true);
    try {
      // Busca 3 dicas via IA com personagens aleatórios
      const randomMascots = [...MASCOTS].sort(() => 0.5 - Math.random()).slice(0, 3);
      
      const tipsPromises = randomMascots.map(async (m) => {
        const res = await fetch("/api/ai-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            messages: [{ role: "user", content: "Me dê uma dica financeira curta e direta para o dashboard, no máximo 15 palavras." }], 
            mascotId: m.id, 
            provider: "groq" 
          })
        });
        const data = await res.json();
        return {
          id: `ai-tip-${m.id}-${Date.now()}`,
          message: data.message,
          mascot: m,
          type: Math.random() > 0.8 ? 'warning' : 'tip'
        };
      });

      const aiTips = await Promise.all(tipsPromises);
      setTips(aiTips);
    } catch (error) {
      console.error("Failed to fetch tips", error);
    } finally {
      setLoading(false);
    }
  }

  const handleDismiss = (id) => {
    setDismissed(prev => new Set([...prev, id]));
  };

  const visibleTips = tips.filter(t => !dismissed.has(t.id));

  if (loading || visibleTips.length === 0) return null;

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="text-amber-400" size={18} />
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Dicas da Galera
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {visibleTips.map((tip, index) => (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden p-4 rounded-3xl border bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all flex flex-col justify-center min-h-[100px] group cursor-default hover:z-20 ${
                tip.type === 'warning' ? 'border-amber-500/20' : 'border-violet-500/20'
              }`}
            >
              <button
                onClick={() => handleDismiss(tip.id)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors z-10"
              >
                <X size={14} />
              </button>

              <div className="flex items-center gap-4 items-start">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden ${
                  tip.mascot.bg
                } border border-white/5 mt-1`}>
                  {(() => {
                    const Icon = tip.mascot.icon;
                    return <Icon size={24} className={tip.mascot.color} />;
                  })()}
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-black uppercase tracking-tighter ${
                      tip.mascot.color
                    }`}>
                      Dica do {tip.mascot.name}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 leading-snug break-words line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                    {tip.message}
                  </p>
                </div>
              </div>

              {/* Decorative progress bar or icon based on type */}
              <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent to-transparent w-full ${
                tip.type === 'warning' ? 'via-amber-500/20' : 'via-violet-500/20'
              }`}></div>
            </motion.div>
          ))} 
        </AnimatePresence>
      </div>
    </div>
  );
}

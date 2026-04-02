"use client";

import { useState, useEffect } from "react";
import { theme } from "@config/design-system";
import { X, Sparkles, Trash2, Layout, TrendingUp, Calendar, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CHANGELOG_ID = "changelog_v2_month_management_and_cleanup";

const changes = [
  {
    title: "Gerenciamento por Mês",
    description: "Agora você pode navegar entre os meses para ver o histórico e planejar seu futuro financeiro.",
    icon: <Calendar className="text-amber-500" size={20} />,
  },
  {
    title: "Gerenciamento de Categorias",
    description: "Crie e exclua categorias personalizadas diretamente no modal de transação.",
    icon: <Trash2 className="text-rose-500" size={20} />,
  },
  {
    title: "Saldo Mensal Líquido",
    description: "O card de receitas agora mostra o 'Saldo (Mês)', refletindo o que sobrou de verdade no período.",
    icon: <TrendingUp className="text-emerald-500" size={20} />,
  },
  {
    title: "Previsão Inteligente",
    description: "Cálculo de previsão ajustado para ser mais preciso, considerando seus gastos fixos e variáveis.",
    icon: <Sparkles className="text-violet-500" size={20} />,
  },
  {
    title: "Interface Mais Limpa",
    description: "Visual simplificado para dar mais foco aos seus dados e economizar espaço em tela.",
    icon: <Layout className="text-blue-500" size={20} />,
  }
];

export default function ChangelogModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(CHANGELOG_ID);
    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(CHANGELOG_ID, "true");
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`${theme.cardStyles.base} max-w-lg w-full max-h-[90vh] shadow-2xl rounded-3xl overflow-hidden relative border border-violet-500/20 flex flex-col`}
          >
            <div className="absolute top-0 right-0 p-2 sm:p-4 z-10">
              <button
                onClick={handleClose}
                className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/20 shrink-0">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Novidades no App! 🚀</h2>
                    <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">Confira o que mudou recentemente</p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {changes.map((change, idx) => (
                    <div key={idx} className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50">
                      <div className="shrink-0 mt-1">{change.icon}</div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{change.title}</h3>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-0.5">
                          {change.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleClose}
                  className="w-full py-3 sm:py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all shadow-lg shadow-violet-600/20 active:scale-[0.98] mt-2"
                >
                  Entendi, vamos lá!
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

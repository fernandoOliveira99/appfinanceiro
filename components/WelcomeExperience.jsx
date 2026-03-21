"use client";

import { motion, AnimatePresence } from "framer-motion";
import { theme } from "@config/design-system";
import { Wallet, Sparkles, ArrowRight, X } from "lucide-react";
import { useState } from "react";

export default function WelcomeExperience({ onStartTutorial, onSkip }) {
  const [isClosing, setIsClosing] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      filter: "blur(10px)",
      transition: { duration: 0.5 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0, rotate: -10 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 1
      }
    }
  };

  const handleAction = async (callback) => {
    setIsClosing(true);
    // Pequeno delay para a animação de saída começar antes de chamar o callback que desmonta o componente
    setTimeout(() => {
      callback();
    }, 500);
  };

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div 
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950 backdrop-blur-xl"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
        >
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px]" />
          </div>

          <div className="max-w-2xl w-full text-center space-y-10 relative z-10">
            {/* Logo Section */}
            <motion.div variants={logoVariants} className="flex justify-center">
              <div className="h-24 w-24 rounded-[2.5rem] bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white shadow-2xl shadow-violet-900/40 relative">
                <Wallet size={48} />
                <motion.div 
                  className="absolute -top-2 -right-2 text-amber-400"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles size={24} />
                </motion.div>
              </div>
            </motion.div>

            {/* Content Section */}
            <div className="space-y-6">
              <motion.h1 
                variants={itemVariants}
                className="text-4xl md:text-6xl font-black text-white tracking-tight"
              >
                Bem-vindo ao <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-emerald-400">Sistema de Controle Financeiro</span>
              </motion.h1>

              <motion.div variants={itemVariants} className="space-y-4 text-slate-400 text-base md:text-lg leading-relaxed max-w-xl mx-auto font-medium">
                <p>
                  Este sistema foi criado para ajudar as pessoas a organizar suas finanças, acompanhar despesas, analisar hábitos de consumo e alcançar metas financeiras.
                </p>
                <p>
                  O projeto foi desenvolvido por <span className="text-white font-bold">Fernando José de Oliveira</span> como um projeto pessoal focado em ajudar usuários a gerenciarem seu dinheiro de forma simples e intuitiva.
                </p>
                <p className="text-violet-400 font-semibold">
                  Preparamos um curto tutorial para te ajudar a entender como o sistema funciona.
                </p>
              </motion.div>
            </div>

            {/* Buttons Section */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <button
                onClick={() => handleAction(onStartTutorial)}
                className="w-full sm:w-auto px-10 py-5 rounded-[2rem] bg-white text-slate-900 font-black text-lg transition-all hover:bg-slate-100 active:scale-95 shadow-2xl shadow-white/10 flex items-center justify-center gap-3 group"
              >
                Começar Tutorial
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => handleAction(onSkip)}
                className="w-full sm:w-auto px-10 py-5 rounded-[2rem] bg-slate-900 text-slate-400 font-bold text-lg transition-all hover:text-white hover:bg-slate-800 active:scale-95 border border-slate-800 flex items-center justify-center gap-3"
              >
                Pular
                <X size={20} />
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

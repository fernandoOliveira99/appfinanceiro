"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Sparkles, Rocket, Target, Shield, ArrowRight, ArrowLeft, CheckCircle2, UserCircle, X as XIcon } from "lucide-react";
import { personalities } from "@lib/personalities";

const MASCOTS = Object.entries(personalities).map(([id, data]) => ({
  id,
  name: data.name,
  mascot: data.mascot,
  gif: data.gif
}));

export default function WelcomeExperience({ user, onStartTutorial, onSkip }) {
  const [step, setStep] = useState(1);
  const [selectedMascot, setSelectedMascot] = useState("goku");

  const steps = [
    {
      title: "Boas-vindas ao App Finanças!",
      description: (
        <div className="space-y-4">
          <p>Sua jornada para a liberdade financeira começa agora. Vamos transformar sua relação com o dinheiro?</p>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Sobre o Projeto</p>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Este sistema foi criado para ajudar pessoas a organizar suas finanças, acompanhar despesas e alcançar metas de forma simples e intuitiva.
            </p>
            <p className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-300">
              Desenvolvido com ❤️ por <span className="text-violet-600 dark:text-violet-400 font-black underline decoration-violet-500/30 underline-offset-4">Fernando José de Oliveira</span>
            </p>
          </div>
        </div>
      ),
      icon: <Sparkles className="text-violet-500" size={48} />,
      color: "from-violet-500 to-indigo-500"
    },
    {
      title: "Escolha seu Mentor",
      description: "Quem vai te guiar nessa jornada? Cada mentor tem um estilo único de te motivar!",
      icon: <UserCircle className="text-emerald-500" size={48} />,
      color: "from-emerald-500 to-teal-500",
      isMascotStep: true
    },
    {
      title: "Tudo Pronto!",
      description: "Você está um passo à frente. Vamos explorar seu novo painel financeiro?",
      icon: <CheckCircle2 className="text-amber-500" size={48} />,
      color: "from-amber-500 to-orange-500"
    }
  ];

  const current = steps[step - 1];

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      // Salva o mascote escolhido antes de finalizar
      localStorage.setItem(`user_mascot_${user?.id || 'guest'}`, selectedMascot);
      // Dispara evento para atualizar o mascote globalmente se necessário
      window.dispatchEvent(new CustomEvent('mascot-changed', { detail: selectedMascot }));
      
      if (onStartTutorial) {
        onStartTutorial();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -20 }}
          className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
        >
          <div className={`h-32 bg-gradient-to-br ${current.color} flex items-center justify-center relative overflow-hidden`}>
            {onSkip && (
              <button 
                onClick={onSkip}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 text-white/80 hover:bg-black/40 hover:text-white transition-all"
                title="Pular"
              >
                <XIcon size={20} />
              </button>
            )}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-xl relative z-10"
            >
              {current.icon}
            </motion.div>
          </div>

          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
                {current.title}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed px-4">
                {current.description}
              </p>
            </div>

            {current.isMascotStep && (
              <div className="grid grid-cols-3 gap-3 max-h-[240px] overflow-y-auto p-2 custom-scrollbar">
                {MASCOTS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMascot(m.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                      selectedMascot === m.id 
                        ? 'bg-violet-600/10 border-violet-500 shadow-lg scale-105' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <span className="text-2xl">{m.mascot}</span>
                    <span className={`text-[10px] font-black uppercase tracking-tighter text-center leading-none ${
                      selectedMascot === m.id ? 'text-violet-500' : 'text-slate-500'
                    }`}>
                      {m.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest text-xs shadow-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={16} />
                    Voltar
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className={`${step > 1 ? 'flex-[2]' : 'w-full'} py-4 rounded-2xl bg-gradient-to-r ${current.color} text-white font-black uppercase tracking-widest text-sm shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2`}
                >
                  {step === steps.length ? "Começar Agora" : "Próximo Passo"}
                  <ArrowRight size={18} />
                </button>
              </div>
              
              <div className="flex justify-center gap-1.5">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      step === i + 1 ? 'w-8 bg-violet-500' : 'w-1.5 bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

"use client";

import { theme } from "@config/design-system";
import { Info, Github, Linkedin, Globe, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const features = [
    "Controle completo de receitas e ganhos extras",
    "Gestão detalhada de despesas por categorias",
    "Relatórios financeiros avançados com gráficos",
    "Assistente financeiro inteligente com IA",
    "Previsão de saldo para o fim do mês",
    "Sistema de metas e objetivos financeiros",
    "Transações recorrentes automatizadas"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <section className={`${theme.cardStyles.base} rounded-[2.5rem] overflow-hidden border border-slate-800/50 shadow-2xl bg-gradient-to-br from-slate-900 to-slate-950`}>
        <div className="p-8 md:p-12 space-y-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-violet-500/20">
              <span className="font-black text-5xl">F</span>
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Sobre o App Finanças</h1>
              <p className="text-slate-400 font-medium max-w-xl italic">
                &quot;Este sistema foi desenvolvido por Fernando para ajudar pessoas a controlarem suas finanças pessoais de forma simples.&quot;
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Info className="text-violet-500" size={20} />
                O Projeto
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                O App Finanças é uma plataforma moderna de gestão financeira desenvolvida com as tecnologias mais recentes do mercado. Nosso foco é proporcionar uma experiência de usuário premium, similar aos melhores bancos digitais e fintechs do mundo.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
                  <Github size={20} />
                </a>
                <a href="#" className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
                  <Linkedin size={20} />
                </a>
                <a href="#" className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
                  <Globe size={20} />
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Recursos Principais</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-slate-300 font-medium">
                  <CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={16} />
                  Controle de receitas
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-300 font-medium">
                  <CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={16} />
                  Controle de despesas
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-300 font-medium">
                  <CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={16} />
                  Relatórios financeiros
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-300 font-medium">
                  <CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={16} />
                  Assistente financeiro com IA
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Projeto desenvolvido por <span className="text-violet-400">Fernando</span>
            </p>
            <p className="text-xs text-slate-600">
              © 2026 App Finanças. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

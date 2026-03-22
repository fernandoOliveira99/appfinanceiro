"use client";

import { theme } from "@config/design-system";
import { Info, Github, Linkedin, Globe, CheckCircle2, Heart, Copy, Check } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function AboutPage() {
  const [copied, setCopied] = useState(false);
  const pixKey = "63621fd4-52d9-4c1b-ba4f-7791df7fef84";

  // Função para gerar o payload do Pix (BR Code)
  const generatePixPayload = (key, name, city) => {
    const gui = "br.gov.bcb.pix";
    const keyField = `01${key.length.toString().padStart(2, "0")}${key}`;
    const merchantAccountInfo = `00${gui.length.toString().padStart(2, "0")}${gui}${keyField}`;
    
    const payload = [
      "000201", // Payload Format Indicator
      "010211", // Point of Initiation Method: Static
      `26${merchantAccountInfo.length.toString().padStart(2, "0")}${merchantAccountInfo}`,
      "52040000", // Merchant Category Code
      "5303986", // Transaction Currency: BRL
      "5802BR", // Country Code
      `59${name.length.toString().padStart(2, "0")}${name}`,
      `60${city.length.toString().padStart(2, "0")}${city}`,
      "62070503***", // Additional Data Field Template
      "6304" // CRC16 Indicator
    ].join("");

    // Cálculo de CRC16 CCITT (FALSE)
    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
        } else {
          crc = (crc << 1) & 0xFFFF;
        }
      }
    }
    const finalCrc = crc.toString(16).toUpperCase().padStart(4, "0");
    return payload + finalCrc;
  };

  const pixPayload = generatePixPayload(pixKey, "Fernando Jose de Oliveira", "SAO PAULO");

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
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
                &quot;Este sistema foi desenvolvido por <span className="text-violet-400 font-bold">Fernando José de Oliveira</span> para ajudar pessoas a controlarem suas finanças pessoais de forma simples.&quot;
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

          <div className="pt-8 border-t border-slate-800/50">
            <div className="bg-slate-900/40 rounded-[2rem] p-6 md:p-8 border border-slate-800/30 flex flex-col md:flex-row items-center gap-8 group transition-all hover:bg-slate-900/60 hover:border-slate-700/50">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-violet-600/20 to-indigo-600/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-white p-4 rounded-3xl shadow-2xl shadow-black/50 ring-1 ring-slate-800/10">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixPayload)}&bgcolor=ffffff&color=0f172a&margin=2`}
                    alt="Pix QR Code"
                    className="w-32 h-32 md:w-40 md:h-40 object-contain rounded-lg"
                  />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-wider">
                    <Heart size={14} className="fill-rose-500" />
                    Apoie o Projeto
                  </div>
                  <h3 className="text-2xl font-black text-white">Gostou do App Finanças?</h3>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                    Este é um projeto independente desenvolvido com dedicação. Se ele te ajudou a organizar suas finanças, considere fazer uma doação de qualquer valor para apoiar a manutenção e novas funcionalidades.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={handleCopyPix}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-violet-500/25 ring-1 ring-white/10"
                  >
                    {copied ? <Check size={20} className="animate-in zoom-in" /> : <Copy size={20} />}
                    {copied ? "CHAVE COPIADA!" : "COPIAR CHAVE PIX"}
                  </button>
                  <div className="hidden lg:flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Chave Aleatória</span>
                    <span className="text-xs font-mono text-slate-400 select-all">{pixKey}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Projeto desenvolvido por <span className="text-violet-400 font-black">Fernando José de Oliveira</span>
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

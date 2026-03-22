"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { theme } from "@config/design-system";
import { 
  Bot, 
  RefreshCw, 
  X, 
  Sparkles, 
  Send, 
  MessageCircle, 
  TrendingUp, 
  AlertCircle, 
  Lightbulb,
  Bell,
  Bird,
  Cat,
  Dog,
  Ghost,
  Gamepad2,
  Settings2,
  Star,
  Flame,
  Zap,
  User,
  HardHat,
  Moon,
  Shield,
  Smile,
  Lock
} from "lucide-react";
import { getMascotMessage, personalities } from "@lib/personalities";

const MASCOTS = [
  { id: "finny", name: "Finny", icon: Bird, color: "text-indigo-400", bg: "bg-indigo-500/10", animation: "animate-bounce" },
  { id: "miau", name: "Miau", icon: Cat, color: "text-amber-400", bg: "bg-amber-500/10", animation: "animate-pulse" },
  { id: "doguinho", name: "Doguinho", icon: Dog, color: "text-blue-400", bg: "bg-blue-500/10", animation: "animate-bounce" },
  { id: "ghost", name: "Fantasmil", icon: Ghost, color: "text-purple-400", bg: "bg-purple-500/10", animation: "animate-pulse" },
  { id: "gamer", name: "Pixel", icon: Gamepad2, color: "text-emerald-400", bg: "bg-emerald-500/10", animation: "animate-bounce" },
  { id: "goku", name: "Goku", icon: Zap, color: "text-orange-500", bg: "bg-orange-500/10", animation: "animate-pulse" },
  { id: "gohan", name: "Gohan", icon: User, color: "text-purple-400", bg: "bg-purple-500/10", animation: "animate-pulse" },
  { id: "mario", name: "Mario", icon: Star, color: "text-rose-500", bg: "bg-rose-500/10", animation: "animate-bounce" },
  { id: "naruto", name: "Naruto", icon: Flame, color: "text-orange-600", bg: "bg-orange-600/10", animation: "animate-pulse" },
  { id: "pikachu", name: "Pikachu", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10", animation: "animate-bounce" },
  { id: "ironman", name: "Iron Man", icon: HardHat, color: "text-red-600", bg: "bg-red-600/10", animation: "animate-pulse" },
  { id: "batman", name: "Batman", icon: Moon, color: "text-gray-400", bg: "bg-gray-700/20", animation: "animate-pulse" },
  { id: "vader", name: "Darth Vader", icon: Shield, color: "text-red-500", bg: "bg-red-900/20", animation: "animate-pulse" },
];

export default function FinanceAI({ user, mascotId, setMascotId }) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Carrega provedor e mensagens do localStorage ao iniciar
  const [provider, setProvider] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`ai_provider_${user?.id || 'guest'}`) || "groq";
    }
    return "groq";
  });
  
  const [messages, setMessages] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`chat_messages_${user?.id || 'guest'}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [hasInitialGreeting, setHasInitialGreeting] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`chat_messages_${user?.id || 'guest'}`);
      return saved ? JSON.parse(saved).length > 0 : false;
    }
    return false;
  });

  const [inputValue, setInputValue] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const scrollRef = useRef(null);

  // Persiste mensagens no localStorage sempre que mudarem
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_messages_${user?.id || 'guest'}`, JSON.stringify(messages));
    } else {
      localStorage.removeItem(`chat_messages_${user?.id || 'guest'}`);
    }
  }, [messages, user]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setHasInitialGreeting(false);
    localStorage.removeItem(`chat_messages_${user?.id || 'guest'}`);
  }, [user?.id]);

  // Reset messages when mascot changes
  useEffect(() => {
    clearChat();
  }, [mascotId, clearChat]);

  // Persiste provedor no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem(`ai_provider_${user?.id || 'guest'}`, provider);
  }, [provider, user]);

  // Random tips logic
  useEffect(() => {
    if (isOpen) return; // Don't show balloon if chat is open

    const showRandomTip = async () => {
      try {
        // Agora busca dica via IA com personagem aleatório
        const randomMascot = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
        const res = await fetch("/api/ai-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            messages: [{ role: "user", content: "Me dê uma dica financeira curta e rápida, no máximo 2 frases." }], 
            mascotId: randomMascot.id, 
            provider: "groq" 
          })
        });
        
        if (res.ok) {
          const data = await res.json();
          setNotificationMessage({
            text: data.message,
            mascot: randomMascot
          });
          setShowNotification(true);
          
          setTimeout(() => {
            setShowNotification(false);
          }, 15000);
        }
      } catch (error) {
        console.error("Failed to fetch random tip", error);
      }
    };

    // Event listener for transactions
    const handleTransaction = () => {
      if (!isOpen) {
        // Delay a bit to let the user see the transaction feedback
        setTimeout(showRandomTip, 2000);
      }
    };
    window.addEventListener('transaction-added', handleTransaction);

    // Initial tip after 10 seconds on load
    const initialTimer = setTimeout(showRandomTip, 10000);

    // Fixed interval of 15 minutes (900,000 ms)
    const interval = setInterval(() => {
      if (!isOpen) {
        showRandomTip();
      }
    }, 900000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      window.removeEventListener('transaction-added', handleTransaction);
    };
  }, [isOpen, mascotId]); // Removed showNotification to prevent re-scheduling logic when notification hides

  const selectedMascot = MASCOTS.find(m => m.id === mascotId) || MASCOTS[0];
  const MascotIcon = selectedMascot.icon;
  const mascotProfile = personalities[mascotId] || personalities.goku;

  // IA Initial Greeting
  useEffect(() => {
    if (isOpen && !hasInitialGreeting && messages.length === 0) {
      const getIAGreeting = async () => {
        setLoading(true);
        try {
          const hour = new Date().getHours();
          let timeContext = "dia";
          if (hour >= 12 && hour < 18) timeContext = "tarde";
          else if (hour >= 18 || hour < 5) timeContext = "noite";

          const res = await fetch("/api/ai-insights", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              messages: [{ role: "user", content: `Olá! Me dê uma saudação de boa ${timeContext}, fale brevemente quem é você como personagem e diga que está pronto para ajudar com minhas finanças hoje.` }], 
              mascotId, 
              provider 
            })
          });

          if (res.ok) {
            const data = await res.json();
            setMessages([{
              role: "assistant",
              content: data.message,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setHasInitialGreeting(true);
          }
        } catch (err) {
          console.error("Initial greeting error:", err);
        } finally {
          setLoading(false);
        }
      };
      getIAGreeting();
    }
  }, [isOpen, mascotId, provider, hasInitialGreeting, messages.length]);



  const handleSelectMascot = (mascot) => {
    setMascotId(mascot.id);
    localStorage.setItem(`user_mascot_${user?.id || 'guest'}`, mascot.id);
    setIsSettingsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [isOpen, user, mascotId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, mascotId, provider })
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage = {
          role: "assistant",
          content: data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error("Erro na resposta");
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage = {
        role: "assistant",
        content: "Desculpe, tive um probleminha para processar sua pergunta. Pode tentar de novo? 😅",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const AI_PROVIDERS = [
    { id: "gemini", name: "Gemini", icon: Zap, color: "text-blue-400", disabled: true },
    { id: "groq", name: "Groq", icon: Flame, color: "text-orange-400", disabled: false },
    { id: "openai", name: "OpenAI", icon: Sparkles, color: "text-emerald-400", disabled: true },
    { id: "anthropic", name: "Claude", icon: Bot, color: "text-orange-400", disabled: true }
  ];

  const handleDeleteHistory = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    clearChat();
    setShowConfirmDelete(false);
  };

  const renderMessageContent = (content) => {
    if (typeof content !== 'string') return content;
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-black text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {showNotification && !isOpen && (
        <div 
          onClick={() => { setIsOpen(true); setShowNotification(false); }}
          className="fixed bottom-40 right-6 md:bottom-28 md:right-8 z-50 max-w-[280px] animate-in slide-in-from-right-10 fade-in duration-500 cursor-pointer group"
        >
          <div className="bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-4 shadow-2xl shadow-indigo-500/20 relative transition-all duration-500 group-hover:max-w-[320px]">
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-indigo-500 rounded-full animate-ping"></div>
            <div className="flex gap-3 items-center items-start">
              <div className={`h-12 w-12 rounded-2xl ${notificationMessage.mascot?.bg || selectedMascot.bg} flex items-center justify-center flex-shrink-0 border border-white/5 shadow-inner ${notificationMessage.mascot?.color || selectedMascot.color} mt-1`}>
                {(() => {
                  const Icon = notificationMessage.mascot?.icon || MascotIcon;
                  return <Icon size={24} className={notificationMessage.mascot?.animation || selectedMascot.animation} />;
                })()}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0 pr-4">
                <p className={`text-[10px] font-black ${notificationMessage.mascot?.color || selectedMascot.color} uppercase tracking-widest`}>
                  Dica do {notificationMessage.mascot?.name || selectedMascot.name}
                </p>
                <p className="text-xs text-slate-200 font-medium line-clamp-3 group-hover:line-clamp-none transition-all duration-500 leading-relaxed">
                  {notificationMessage.text || `Tenho novas dicas para suas finanças hoje!`}
                </p>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowNotification(false); }}
              className="absolute top-2 right-2 text-slate-500 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-28 right-6 md:bottom-8 md:right-8 z-40">
        {!isOpen && (
          <button
            onClick={() => { setIsOpen(true); setShowNotification(false); }}
            className={`h-16 w-16 rounded-full bg-slate-900 shadow-2xl shadow-indigo-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-indigo-500/20 backdrop-blur-md group relative`}
          >
            <MascotIcon className={`h-8 w-8 ${selectedMascot.color} group-hover:rotate-12 transition-transform ${selectedMascot.animation}`} />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-28 md:right-8 z-50 animate-in fade-in slide-in-from-bottom-10 duration-500">
          <div 
            className="w-full h-full md:w-[450px] md:h-[600px] flex flex-col shadow-2xl md:rounded-3xl overflow-hidden border-t md:border border-slate-800/50 bg-slate-950/95 backdrop-blur-xl"
          >
            <div className="p-6 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/20">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-2xl ${selectedMascot.bg} flex items-center justify-center ${selectedMascot.color} shadow-inner border border-white/5 relative group`}>
                  <MascotIcon size={24} className={selectedMascot.animation} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-white leading-tight">{selectedMascot.name} Assistente</h2>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Sempre online para ajudar</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleDeleteHistory}
                  className="p-2 rounded-xl bg-slate-900/50 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-slate-800"
                  title="Limpar histórico"
                >
                  <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`p-2 rounded-xl transition-all border ${isSettingsOpen ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900/50 text-slate-400 hover:text-slate-200 border-slate-800'}`}
                  title="Trocar Mascote"
                >
                  <Settings2 size={18} />
                </button>
                <button
                  onClick={() => { setIsOpen(false); setIsSettingsOpen(false); }}
                  className="p-2 rounded-xl bg-slate-900/50 text-slate-400 hover:text-slate-200 transition-colors border border-slate-800"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Confirmation Overlay */}
            {showConfirmDelete && (
              <div className="absolute inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-[300px] animate-in zoom-in-95 duration-200">
                  <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4 mx-auto">
                    <RefreshCw size={24} />
                  </div>
                  <h3 className="text-sm font-black text-white text-center mb-2">Limpar conversa?</h3>
                  <p className="text-[11px] text-slate-400 text-center mb-6">Isso apagará todo o histórico atual com o {selectedMascot.name}.</p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowConfirmDelete(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={confirmDelete}
                      className="flex-1 py-2.5 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20"
                    >
                      Limpar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isSettingsOpen ? (
              <div className="flex-1 p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  {/* Provedor de IA */}
                  <div className="space-y-3">
                    <div className="text-center space-y-1">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">Cérebro da IA</h3>
                      <p className="text-[10px] text-slate-500 font-bold">QUAL MODELO VOCÊ QUER USAR?</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {AI_PROVIDERS.map((p) => {
                        const Icon = p.icon;
                        return (
                          <button
                            key={p.id}
                            disabled={p.disabled}
                            onClick={() => {
                              if (!p.disabled) {
                                setProvider(p.id);
                                setIsSettingsOpen(false);
                              }
                            }}
                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all relative overflow-hidden ${
                              p.disabled 
                                ? 'bg-slate-900/20 border-slate-800/50 opacity-60 cursor-not-allowed grayscale' 
                                : provider === p.id 
                                  ? 'bg-indigo-600/20 border-indigo-500/50' 
                                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {p.disabled && (
                              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 z-10">
                                <Lock size={16} className="text-slate-400" />
                              </div>
                            )}
                            <Icon size={20} className={p.color} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">{p.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-px bg-slate-800/50"></div>

                  {/* Mascote */}
                  <div className="space-y-3">
                    <div className="text-center space-y-1">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">Mascote e Voz</h3>
                      <p className="text-[10px] text-slate-500 font-bold">ESCOLHA QUEM VAI TE AJUDAR</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {MASCOTS.map((m) => {
                        const Icon = m.icon;
                        return (
                          <button
                            key={m.id}
                            onClick={() => handleSelectMascot(m)}
                            className={`flex items-center gap-4 p-3 rounded-2xl border transition-all group ${selectedMascot.id === m.id ? 'bg-indigo-600/20 border-indigo-500/50' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}
                          >
                            <div className={`h-10 w-10 rounded-xl ${m.bg} flex items-center justify-center ${m.color}`}>
                              <Icon size={20} className={m.animation} />
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="text-sm font-bold text-white">{m.name}</span>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Personalidade Ativa</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
                >
                  {messages.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                      <div className={`h-16 w-16 rounded-3xl ${selectedMascot.bg} flex items-center justify-center ${selectedMascot.color} shadow-inner border border-white/5`}>
                        <MascotIcon size={32} className={selectedMascot.animation} />
                      </div>
                      <p className="text-sm text-slate-500 font-medium px-8">
                        Olá! Estou analisando suas finanças.<br/>Um momento...
                      </p>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      {msg.role === 'assistant' && (
                        <div className={`h-9 w-9 rounded-xl ${selectedMascot.bg} flex items-center justify-center flex-shrink-0 mt-1 border border-white/5 ${selectedMascot.color}`}>
                          <MascotIcon size={18} className={selectedMascot.animation} />
                        </div>
                      )}
                      <div className={`max-w-[85%] space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div 
                          className={`p-3.5 rounded-2xl text-[11px] md:text-xs font-medium leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-900/20' 
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                          }`}
                        >
                          {msg.content.split('\n\n').map((p, idx) => (
                            <p key={idx} className={idx > 0 ? 'mt-3' : ''}>
                              {renderMessageContent(p)}
                            </p>
                          ))}
                        </div>
                        <p className="text-[9px] text-slate-600 font-bold uppercase px-1">
                          {msg.role === 'assistant' ? selectedMascot.name : 'Você'} • {msg.timestamp}
                        </p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="h-9 w-9 rounded-xl bg-indigo-600/20 flex items-center justify-center flex-shrink-0 mt-1 border border-indigo-500/20">
                          <User size={18} className="text-indigo-400" />
                        </div>
                      )}
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start gap-2.5 animate-in fade-in duration-300">
                      <div className={`h-9 w-9 rounded-xl ${selectedMascot.bg} flex items-center justify-center flex-shrink-0 mt-1 border border-white/5 ${selectedMascot.color}`}>
                        <MascotIcon size={18} className={selectedMascot.animation} />
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className={`h-1 w-1 ${selectedMascot.color.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
                          <div className={`h-1 w-1 ${selectedMascot.color.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
                          <div className={`h-1 w-1 ${selectedMascot.color.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-slate-800/50 bg-slate-900/20">
                  <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Pergunte algo ao ${selectedMascot.name}...`}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/50 transition-all pr-12"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || loading}
                      className="absolute right-2 p-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:bg-slate-800 transition-all"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                  <p className="text-[10px] text-center text-slate-600 mt-4 font-bold uppercase tracking-widest">
                    {selectedMascot.name} pode cometer erros. Revise informações importantes.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

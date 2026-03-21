import { NextResponse } from "next/server";
import { getCurrentUser } from "@lib/auth";
import { query } from "@lib/db";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";

const gemini = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// Fallback functions for when LLM fails (Quota/Errors)
function generateMascotInsightFallback(summary, mascotId) {
  const { balance } = summary;
  
  const insights = {
    goku: {
      good: `Oi, eu sou o Goku! Seu saldo de R$ ${balance.toFixed(2)} está ficando forte! Continue treinando sua economia para superar seus limites! 🐉`,
      bad: `Oi, eu sou o Goku! Seu saldo está em nível de poder perigoso (R$ ${balance.toFixed(2)}). Vamos focar no treino de disciplina! 🥊`
    },
    naruto: {
      good: `Dattebayo! Você está indo muito bem com R$ ${balance.toFixed(2)} de saldo! Esse é o seu jeito ninja de economizar! 🍥`,
      bad: `Ei! Seu saldo de R$ ${balance.toFixed(2)} está baixo. Não desista agora, eu acredito que você pode economizar mais! 🦊`
    },
    ghost: {
      good: `Eu vejo um saldo positivo de R$ ${balance.toFixed(2)} emergindo das sombras... Mantenha a vigilância. 👻`,
      bad: `Padrões obscuros detectados... R$ ${balance.toFixed(2)} restantes. Tenha cuidado com o desconhecido. 🕯️`
    },
    pikachu: {
      good: `Pika-pika! ✨ Seu saldo de R$ ${balance.toFixed(2)} está brilhando! ⚡`,
      bad: `Pika? ⚡ R$ ${balance.toFixed(2)} foi um choque! Vamos economizar? Pi-ka-chuuu! ⚡`
    },
    mario: {
      good: `Wahoo! Você coletou R$ ${balance.toFixed(2)} em moedas este mês! Super! 🍄`,
      bad: `Mamma mia! Você perdeu moedas. Restam apenas R$ ${balance.toFixed(2)}. Vamos pular esse gasto na próxima vez! ⭐️`
    }
  };

  const personality = insights[mascotId] || insights.goku;
  return balance >= 0 ? personality.good : personality.bad;
}

function generateMascotChatResponseFallback(message, summary, mascotId, user) {
  const lowerMessage = message.toLowerCase();
  const userName = user.name?.split(' ')[0] || 'amigo';
  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  let baseResponse = "";

  if (lowerMessage.match(/^(oi|olá|ola|bom dia|boa tarde|boa noite)/)) {
    baseResponse = `Olá ${userName}! Como posso ajudar com suas finanças hoje?`;
  } else if (lowerMessage.includes("saldo")) {
    baseResponse = `Seu saldo atual é de ${fmt(summary.balance)}.`;
  } else if (lowerMessage.includes("gasto") || lowerMessage.includes("despesa")) {
    baseResponse = `Você gastou um total de ${fmt(summary.totalExpenses)} este mês.`;
  } else if (lowerMessage.includes("dica") || lowerMessage.includes("ajuda") || lowerMessage.includes("economizar")) {
    baseResponse = "Tente economizar em categorias não essenciais para fortalecer seu fundo de reserva.";
  } else {
    baseResponse = "Estou aqui para te ajudar a controlar seu dinheiro e bater suas metas!";
  }

  const personalities = {
    goku: (msg) => `Oi, eu sou o Goku! ${msg} Vamos treinar duro para manter esse saldo alto! 🐉`,
    naruto: (msg) => `Ei, ${userName}! ${msg} Acredite no seu potencial financeiro! Dattebayo! 🍥`,
    ghost: (msg) => `As sombras revelam: ${msg} Tenha cuidado com os gastos ocultos... 👻`,
    pikachu: (msg) => `Pika-pika! ⚡ ${msg} ✨`,
    mario: (msg) => `Wahoo! ${msg} Vamos coletar muitas moedas! 🍄`
  };

  const wrap = personalities[mascotId] || personalities.goku;
  return wrap(baseResponse);
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { mascotId = "goku", messages, provider = "groq" } = body;

    // 1. Fetch user data (Transactions and Goals)
    const [transRes, goalsRes] = await Promise.all([
      query(
        `SELECT name, category, amount, type, date 
         FROM transactions 
         WHERE user_id = $1 
         ORDER BY date DESC`,
        [user.id]
      ),
      query("SELECT * FROM goals WHERE user_id = $1", [user.id])
    ]);

    const transactions = transRes.rows;
    const goals = goalsRes.rows;

    // 2. Calculate financial summary
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    const balance = totalIncome - totalExpenses;

    const summary = {
      totalIncome,
      totalExpenses,
      balance,
      transactions: transactions.slice(0, 10), // Context of recent transactions
      goals: goals.map(g => ({ type: g.type, target: g.target_amount, current: g.current_amount }))
    };

    // 3. LLM Integration
    const mascotPrompts = {
      goku: "Você é o Goku de Dragon Ball. Use gírias como 'Oi, eu sou o Goku!', 'treino', 'ficar mais forte', 'comer muito'. Seja motivador e focado em superar limites financeiros.",
      naruto: "Você é o Naruto Uzumaki. Use 'Dattebayo!', fale sobre seu 'jeito ninja de economizar', 'tornar-se Hokage das finanças'. Seja persistente e amigável.",
      ghost: "Você é o Ghost de Call of Duty. Seja sério, tático, use termos militares como 'missão', 'alvo', 'setor'. Fale sobre vigilância e proteção do patrimônio.",
      pikachu: "Você é o Pikachu. Use expressões como 'Pika-pika!', 'choque', 'eletrizante'. Seja fofo, mas focado em economizar energia (dinheiro).",
      mario: "Você é o Super Mario. Use 'Wahoo!', 'Mamma mia!', fale sobre 'coletar moedas', 'pular obstáculos financeiros', 'pegar cogumelos de bônus'.",
      finny: "Você é o Finny, um passarinho azul esperto e rápido. Use expressões de voo, altura e visão panorâmica. Seja alegre e atento a oportunidades.",
      miau: "Você é o Miau, um gato calmo e observador. Fale sobre 'conforto', 'preguiça inteligente' (economizar para descansar), 'ronronar'. Seja elegante e um pouco irônico.",
      doguinho: "Você é o Doguinho, um cachorro leal e protetor. Fale sobre 'guardar o osso', 'proteger o quintal', 'lealdade'. Seja muito empolgado, use exclamações e seja o melhor amigo do usuário.",
      gamer: "Você é o Pixel, um personagem de videogame retrô. Use termos como 'level up', 'farmar moedas', 'inventário', 'checkpoint'. Seja animado e trate as finanças como um jogo de RPG.",
      gohan: "Você é o Gohan. Seja educado, estudioso e focado. Fale sobre 'potencial oculto', 'estudo' e 'equilíbrio'. Seja mais sério que o Goku, mas igualmente motivador.",
      ironman: "Você é o Tony Stark (Iron Man). Seja genial, bilionário, um pouco convencido mas focado em tecnologia e eficiência. Fale sobre 'upgrades', 'armaduras financeiras' e 'IA Jarvis'.",
      batman: "Você é o Batman (Bruce Wayne). Seja sério, sombrio e estratégico. Fale sobre 'preparação', 'justiça com o dinheiro', 'vigilância'. Use um tom autoritário e tático.",
      vader: "Você é o Darth Vader. Seja imponente, use a 'Força' para controlar os gastos. Fale sobre 'império financeiro', 'lado sombrio das dívidas'. Seja autoritário mas focado em ordem e poder."
    };

    const systemPrompt = `
      ${mascotPrompts[mascotId] || mascotPrompts.goku}
      Você é um assistente financeiro pessoal. Seu objetivo é ajudar o usuário chamado ${user.name} a gerenciar dinheiro.
      Contexto financeiro atual do usuário:
      - Saldo Atual: R$ ${balance.toFixed(2)}
      - Total de Ganhos: R$ ${totalIncome.toFixed(2)}
      - Total de Gastos: R$ ${totalExpenses.toFixed(2)}
      - Metas Ativas: ${JSON.stringify(summary.goals)}
      - Últimas Transações: ${JSON.stringify(summary.transactions)}

      Regras:
      1. Responda SEMPRE mantendo a personalidade do personagem escolhido.
      2. Seja breve e direto, mas útil.
      3. Se o usuário perguntar algo sobre as finanças dele, use os dados acima para responder.
      4. Use negrito (**texto**) para destacar valores ou informações importantes.
      5. Não mencione que você é uma IA ou que recebeu esses dados, aja naturalmente como o personagem.
    `;

    async function tryAI(p, sysPrompt, history) {
      try {
        if (p === "openai" && openai) {
          const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: sysPrompt },
              ...(history || []).map(m => ({ role: m.role, content: m.content }))
            ],
          });
          return response.choices[0].message.content;
        } 
        
        if (p === "anthropic" && anthropic) {
          const response = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 1000,
            system: sysPrompt,
            messages: (history || []).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }))
          });
          return response.content[0].text;
        }

        if (p === "groq" && groq) {
          const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: sysPrompt },
              ...(history || []).map(m => ({ role: m.role, content: m.content }))
            ],
          });
          return response.choices[0].message.content;
        }

        if (gemini) {
          const lastUserMsg = (history && history.length > 0) 
            ? history[history.length - 1].content 
            : "Me dê uma dica financeira curta e motivadora baseada nos meus dados atuais.";

          const prompt = `${sysPrompt}\n\nMensagem do usuário: ${lastUserMsg}`;

          const res = await gemini.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
          });

          return res.text;
        }
        
        throw new Error("Provedor não disponível ou não configurado.");
      } catch (err) {
        console.error(`Falha no provedor ${p}:`, err.message);
        throw err;
      }
    }

    try {
      let aiResponse = "";
      
      try {
        // Tenta o provedor selecionado (Groq agora é o principal se configurado no front)
        aiResponse = await tryAI(provider, systemPrompt, messages);
      } catch (error) {
        // Se o selecionado falhar, tenta o Groq como backup inteligente principal
        if (provider !== "groq" && groq) {
          console.log("Tentando fallback inteligente para Groq...");
          aiResponse = await tryAI("groq", systemPrompt, messages);
        } else if (provider !== "gemini" && gemini) {
          console.log("Tentando fallback inteligente para Gemini...");
          aiResponse = await tryAI("gemini", systemPrompt, messages);
        } else {
          throw error;
        }
      }

      return NextResponse.json({ message: aiResponse });

    } catch (apiError) {
      console.error(`Todos os provedores inteligentes falharam:`, apiError);
      return NextResponse.json({ 
        message: "Estou com um problema de conexão com meus circuitos neurais agora. Pode tentar novamente em instantes? 😅" 
      });
    }

  } catch (error) {
    console.error("AI Insight/Chat Error:", error);
    return NextResponse.json({ error: "Erro ao processar sua solicitação." }, { status: 500 });
  }
}

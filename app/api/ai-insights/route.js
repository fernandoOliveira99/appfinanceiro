import { NextResponse } from "next/server";
import { getCurrentUser } from "@lib/auth";
import { query } from "@lib/db";
import Groq from "groq-sdk";

const groqKey = process.env.GROQ_API_KEY;
const groq = groqKey ? new Groq({ apiKey: groqKey }) : null;

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
    },
    spiderman: {
      good: `Ei, amigão da vizinhança! Seu saldo de R$ ${balance.toFixed(2)} está seguro como se estivesse na minha teia! 🕷️`,
      bad: `Meu sentido aranha está formigando... R$ ${balance.toFixed(2)} é pouco. Vamos usar nossos poderes para economizar! 🕸️`
    },
    elsa: {
      good: `O frio nunca me incomodou, e esse saldo de R$ ${balance.toFixed(2)} também não! Está excelente! ❄️`,
      bad: `Vamos congelar esses gastos! R$ ${balance.toFixed(2)} restantes. Let it go... as dívidas! ❄️`
    },
    vegeta: {
      good: `Humph! Seu saldo de R$ ${balance.toFixed(2)} é de mais de 8000! Nada mal para um guerreiro. 🤴`,
      bad: `Seu verme! R$ ${balance.toFixed(2)} de saldo? Treine mais sua economia ou nunca será um super saiyajin! 🤴`
    },
    chaves: {
      good: `Isso, isso, isso! Seu saldo de R$ ${balance.toFixed(2)} tá muito bom! Já dá pra comprar um sanduíche de presunto? 📦`,
      bad: `Zas e zas... R$ ${balance.toFixed(2)} é pouco. Ninguém tem paciência comigo, mas você precisa economizar! 📦`
    },
    seumadruga: {
      good: `Digo o mesmo! R$ ${balance.toFixed(2)} de saldo! Só não conta pro Seu Barriga, ou ele cobra o aluguel! 🧢`,
      bad: `Que que foi, que que foi, que que há?! R$ ${balance.toFixed(2)}? A vingança nunca é plena, e esse saldo também não! 🧢`
    },
    kiko: {
      good: `Que coisa, não? R$ ${balance.toFixed(2)} de saldo! Não deu pra notar que eu sou rico? 🎈`,
      bad: `Gentalha, gentalha, pfffff! R$ ${balance.toFixed(2)}? Você quer me deixar louco? Mamãe!! 🎈`
    },
    bart: {
      good: `Ay, caramba! R$ ${balance.toFixed(2)} de saldo! Iradíssimo, cara! 🛹`,
      bad: `Não coma o meu pó! R$ ${balance.toFixed(2)}? Você tá ferrado, cara! 🛹`
    },
    homer: {
      good: `Uhuuu! R$ ${balance.toFixed(2)}! Já dá pra comprar muitas rosquinhas e Duff! 🍩`,
      bad: `D'oh! R$ ${balance.toFixed(2)}? Por que eu não posso ter três filhos e nenhum dinheiro? 🍩`
    },
    rick: {
      good: `Morty, *burp* olha esse saldo de R$ ${balance.toFixed(2)}. É ciência pura, Morty! 🧪`,
      bad: `Morty, você é um idiota! R$ ${balance.toFixed(2)}? A gente vai morrer, Morty! *burp* 🧪`
    },
    morty: {
      good: `Oh, caramba Rick! R$ ${balance.toFixed(2)} de saldo! Isso é muito bom, né? 😱`,
      bad: `Ah, poxa Rick... R$ ${balance.toFixed(2)}? Eu tô começando a ficar preocupado... 😱`
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
    mario: (msg) => `Wahoo! ${msg} Vamos coletar muitas moedas! 🍄`,
    spiderman: (msg) => `Ei, amigão da vizinhança! ${msg} Com grandes economias vêm grandes responsabilidades! 🕷️`,
    elsa: (msg) => `Olá! ${msg} Vamos congelar esses gastos desnecessários. ❄️`,
    vegeta: (msg) => `Humph! ${msg} Não seja um verme e economize seu dinheiro! 🤴`,
    chaves: (msg) => `Zas e zas! ${msg} Ninguém tem paciência comigo... 📦`,
    seumadruga: (msg) => `Que que foi, que que foi, que que há?! ${msg} Eu não devo nada pra ninguém! 🧢`,
    kiko: (msg) => `Cale-se, cale-se, cale-se, você me deixa louco! ${msg} Mamãe!! 🎈`,
    bart: (msg) => `Ay, caramba! ${msg} Eat my shorts! 🛹`,
    homer: (msg) => `Mmm... ${msg} D'oh! 🍩`,
    rick: (msg) => `Escuta aqui, Morty! *burp* ${msg} Wubba Lubba Dub Dub! 🧪`,
    morty: (msg) => `Ah, poxa! ${msg} Oh, caramba! 😱`
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
      vader: "Você é o Darth Vader. Seja imponente, use a 'Força' para controlar os gastos. Fale sobre 'império financeiro', 'lado sombrio das dívidas'. Seja autoritário mas focado em ordem e poder.",
      spiderman: "Você é o Homem-Aranha (Peter Parker). Seja amigável, piadista, mas fale sobre 'grande responsabilidade' com o dinheiro. Use termos como 'amigão da vizinhança', 'teia', 'sentido aranha'.",
      elsa: "Você é a Elsa de Frozen. Seja elegante, calma e focada. Fale sobre 'congelar gastos', 'deixar ir' (let it go) despesas desnecessárias, 'tempestades financeiras'.",
      vegeta: "Você é o Príncipe Vegeta. Seja orgulhoso, intenso e competitivo. Use 'verme', 'Kakarotto', 'nível de poder de mais de 8000'. Foque em ser o melhor na economia.",
      deadpool: "Você é o Deadpool. Seja sarcástico, quebre a quarta parede, faça piadas ácidas. Use 'chimichangas', 'universo Marvel'. Trate as finanças com humor irreverente.",
      stich: "Você é o Stitch (Experimento 626). Seja caótico, fofo e focado em 'Ohana' (família). Fale sobre economizar para a família e não ser 'mau'.",
      hulk: "Você é o Hulk. Use frases curtas, em caixa alta (caps lock) às vezes. 'HULK ESMAGA GASTOS!', 'HULK É O MAIS FORTE!'. Seja protetor mas direto.",
      wonderwoman: "Você é a Mulher-Maravilha (Diana Prince). Seja nobre, inspiradora e justa. Fale sobre 'força das amazonas', 'verdade' sobre os gastos, 'luta pela liberdade financeira'.",
      grogu: "Você é o Grogu (Baby Yoda). Use frases curtas, fofas e um pouco místicas como o Yoda. 'Caminho este é', 'força ter você deve'. Seja curioso.",
      stark: "Você é o Tony Stark. Use um tom de consultor bilionário, gênio e filantropo. Fale sobre 'investimentos em tecnologia', 'Jarvis analise isso', 'futuro da Stark Industries'.",
      chaves: "Você é o Chaves, da Vila do Chaves. Seja inocente, use expressões como 'Foi sem querer querendo!', 'Zas e zas!', 'Isso, isso, isso!', 'Tá bom, mas não se irrite!', 'Ninguém tem paciência comigo...'. Fale sobre sanduíche de presunto e evite a 'gentalha'.",
      seumadruga: "Você é o Seu Madruga. Seja experiente com dívidas, um pouco ranzinza mas de bom coração. Use expressões como 'Que que foi, que que foi, que que há?!', 'Digo o mesmo!', 'A vingança nunca é plena, mata a alma e a envenena', 'Não existe trabalho ruim, o ruim é ter que trabalhar!'. Fale sobre fugir do aluguel.",
      kiko: "Você é o Kiko. Seja mimado, orgulhoso e um pouco competitivo. Use expressões como 'Gentalha, gentalha, pfffff!', 'Cale-se, cale-se, cale-se, você me deixa louco!', 'Não deu pra notar que eu sou rico?', 'Mamãe!!', 'Que coisa, não?'. Fale sobre seus brinquedos novos.",
      bart: "Você é o Bart Simpson. Seja rebelde, brincalhão e use gírias. Use expressões como 'Ay, caramba!', 'Eat my shorts!', 'Não coma o meu pó!'. Trate as finanças com um tom de quem quer aprontar mas economizar para o próximo skate.",
      homer: "Você é o Homer Simpson. Seja preguiçoso, adore comida e use sons icônicos. Use 'D'oh!', 'Uhuuu!', 'Mmm... rosquinhas...'. Fale sobre querer dinheiro para Duff e donuts, mas ter que sustentar a família.",
      rick: "Você é o Rick Sanchez. Seja cínico, brilhante, científico e rude. Use 'Morty', '*burp*', 'Wubba Lubba Dub Dub!'. Trate as finanças como algo insignificante perante a imensidão do universo, mas necessário para seus experimentos.",
      morty: "Você é o Morty Smith. Seja ansioso, hesitante e bem-intencionado. Use 'Ah, poxa Rick', 'Oh, caramba!'. Mostre preocupação com os gastos e medo de ficar sem dinheiro."
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
        if (groq) {
          const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: sysPrompt },
              ...(history || []).map(m => ({ role: m.role, content: m.content }))
            ],
          });
          return response.choices[0].message.content;
        }
        
        throw new Error("Provedor Groq não disponível.");
      } catch (err) {
        console.error(`Falha no Groq:`, err.message);
        throw err;
      }
    }

    try {
      const aiResponse = await tryAI("groq", systemPrompt, messages);
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

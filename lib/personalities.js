export const personalities = {
  goku: {
    name: "Goku 🐉",
    style: "Motivational, energetic, focused on growth",
    mascot: "🐉",
    gif: "/mascots/goku.gif",
    getTip: (tip) => `Push beyond your limits! ${tip}!`,
    getAchievement: (name) => `Sua disciplina é incrível! Você desbloqueou ${name}! Ka-me-ha-me-ha!`,
    getChat: (msg) => `Oi, eu sou o Goku! ${msg} Vamos treinar seu autocontrole financeiro!`
  },
  naruto: {
    name: "Naruto 🍥",
    style: "Encouraging, emotional, friendly tone",
    mascot: "🍥",
    gif: "/mascots/naruto.gif",
    getTip: (tip) => `Eu sei que você consegue! ${tip}. Tô certo!`,
    getAchievement: (name) => `Isso que é disciplina! Você conseguiu a conquista ${name}! Dattebayo!`,
    getChat: (msg) => `Eu nunca volto atrás na minha palavra! ${msg} Vamos economizar juntos!`
  },
  ghost: {
    name: "Ghost 👻",
    style: "Mysterious, analytical, slightly dark tone",
    mascot: "👻",
    gif: "/mascots/ghost.gif",
    getTip: (tip) => `Eu sinto padrões estranhos... ${tip}... seja cuidadoso.`,
    getAchievement: (name) => `Uma nova conquista emergiu das sombras: ${name}. Eu já previa isso.`,
    getChat: (msg) => `As sombras revelam muito sobre seus gastos... ${msg}`
  },
  pikachu: {
    name: "Pikachu ⚡",
    style: "Cute, short messages, playful",
    mascot: "⚡",
    gif: "/mascots/pikachu.gif",
    getTip: (tip) => `Pika-pika! ${tip} ⚡`,
    getAchievement: (name) => `Pi-ka-chu! Você ganhou: ${name}! ✨`,
    getChat: (msg) => `Pika? ${msg} Chuuu!`
  },
  mario: {
    name: "Mario 🍄",
    style: "Positive, classic friendly",
    mascot: "🍄",
    gif: "/mascots/mario.gif",
    getTip: (tip) => `Wahoo! ${tip}! Let's-a-go!`,
    getAchievement: (name) => `Mamma mia! Você desbloqueou ${name}! Super!`,
    getChat: (msg) => `It's-a me, Mario! ${msg}`
  },
  finny: {
    name: "Finny 🐦",
    style: "Cheerful, quick, high-level overview",
    mascot: "🐦",
    getTip: (tip) => `Voe alto! ${tip}!`,
    getAchievement: (name) => `Que visão panorâmica! Você desbloqueou ${name}!`,
    getChat: (msg) => `Piu-piu! Aqui é o Finny! ${msg}`
  },
  miau: {
    name: "Miau 🐱",
    style: "Calm, observant, elegant",
    mascot: "🐱",
    getTip: (tip) => `Ron-ron... ${tip}. Mantenha o conforto.`,
    getAchievement: (name) => `Miau! Uma conquista elegante: ${name}.`,
    getChat: (msg) => `Olá... sou o Miau. ${msg}`
  },
  doguinho: {
    name: "Doguinho 🐶",
    style: "Loyal, protective, excited",
    mascot: "🐶",
    getTip: (tip) => `Au-au! ${tip}! Vou proteger seu dinheiro!`,
    getAchievement: (name) => `Uau! Você guardou o osso! Conquista: ${name}!`,
    getChat: (msg) => `Oi, oi! Sou o Doguinho! ${msg} Somos melhores amigos!`
  },
  gamer: {
    name: "Pixel 🎮",
    style: "Retro, RPG-like, enthusiastic",
    mascot: "🎮",
    getTip: (tip) => `Level Up! ${tip}. Farme moedas!`,
    getAchievement: (name) => `Achievement Unlocked: ${name}! GG!`,
    getChat: (msg) => `Press Start! Sou o Pixel! ${msg}`
  },
  gohan: {
    name: "Gohan 👨‍🎓",
    style: "Polite, focused, motivational",
    mascot: "👨‍🎓",
    getTip: (tip) => `Estude seus gastos. ${tip}. Libere seu potencial!`,
    getAchievement: (name) => `Seu treinamento deu resultado: ${name}!`,
    getChat: (msg) => `Olá, eu sou o Gohan. ${msg} Vamos manter o equilíbrio.`
  },
  ironman: {
    name: "Iron Man 🚀",
    style: "Genius, billionaire, tech-focused",
    mascot: "🚀",
    getTip: (tip) => `Upgrade necessário. ${tip}. Jarvis, analise isso.`,
    getAchievement: (name) => `Nova armadura financeira: ${name}!`,
    getChat: (msg) => `Eu sou o Homem de Ferro. ${msg} Eficiência é tudo.`
  },
  batman: {
    name: "Batman 🦇",
    style: "Serious, strategic, dark",
    mascot: "🦇",
    getTip: (tip) => `Preparação é a chave. ${tip}. Vigie as sombras.`,
    getAchievement: (name) => `Justiça feita: ${name}. O Cavaleiro das Trevas aprova.`,
    getChat: (msg) => `Eu sou o Batman. ${msg} Estratégia acima de tudo.`
  },
  vader: {
    name: "Darth Vader 🌌",
    style: "Imposing, authoritative, focused on order",
    mascot: "🌌",
    getTip: (tip) => `Não subestime a Força. ${tip}. Controle seu destino.`,
    getAchievement: (name) => `O Império cresce: ${name}. Impressionante.`,
    getChat: (msg) => `Eu sou o Darth Vader. ${msg} Una-se a mim.`
  }
};

export function getMascotMessage(mascotId, type, content) {
  const p = personalities[mascotId?.toLowerCase()] || personalities.goku;
  if (type === 'tip' || type === 'warning') return p.getTip(content);
  if (type === 'achievement') return p.getAchievement(content);
  if (type === 'chat') return p.getChat(content);
  return content;
}

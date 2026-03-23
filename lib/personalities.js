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
  },
  spiderman: {
    name: "Homem-Aranha 🕷️",
    style: "Friendly, witty, responsible",
    mascot: "🕷️",
    getTip: (tip) => `Com grandes economias vêm grandes responsabilidades! ${tip}.`,
    getAchievement: (name) => `Mandou bem, amigão da vizinhança! Você desbloqueou ${name}!`,
    getChat: (msg) => `Ei! Aqui é o seu amigo da vizinhança, o Homem-Aranha! ${msg}`
  },
  elsa: {
    name: "Elsa ❄️",
    style: "Elegant, calm, focused",
    mascot: "❄️",
    getTip: (tip) => `Livre estou dos gastos excessivos! ${tip}. Mantenha a calma.`,
    getAchievement: (name) => `O gelo nunca me incomodou... e nem essa conquista: ${name}!`,
    getChat: (msg) => `Olá. Eu sou a Elsa. ${msg} Vamos congelar esses gastos desnecessários?`
  },
  vegeta: {
    name: "Vegeta 🤴",
    style: "Proud, intense, competitive",
    mascot: "🤴",
    getTip: (tip) => `Seu poder de economia é de mais de 8000! ${tip}. Não seja um verme!`,
    getAchievement: (name) => `Humph! Finalmente conseguiu algo digno de um príncipe: ${name}!`,
    getChat: (msg) => `Eu sou o Príncipe de todos os Saiyajins! ${msg} Não ouse gastar à toa!`
  },
  deadpool: {
    name: "Deadpool ⚔️",
    style: "Sarcastic, fourth-wall breaking, funny",
    mascot: "⚔️",
    getTip: (tip) => `Chimichangas custam dinheiro, sabia? ${tip}. Não quebra a firma!`,
    getAchievement: (name) => `Olha só, um troféu brilhante chamado ${name}! Posso vender por quanto?`,
    getChat: (msg) => `Sentiu minha falta? O Deadpool chegou! ${msg} Ignora o roteiro e economiza!`
  },
  stich: {
    name: "Stich 👽",
    style: "Chaotic, cute, focused on family/ohana",
    mascot: "👽",
    getTip: (tip) => `Ohana quer dizer família. Família quer dizer economizar juntos! ${tip}.`,
    getAchievement: (name) => `Meega-na-la-queesta! Conquista ${name} desbloqueada!`,
    getChat: (msg) => `Stich gosta de dinheiro! ${msg} Hihihi!`
  },
  hulk: {
    name: "Hulk 👊",
    style: "Strong, direct, slightly aggressive but protective",
    mascot: "👊",
    getTip: (tip) => `HULK ESMAGA GASTOS! ${tip.toUpperCase()}!`,
    getAchievement: (name) => `HULK CONSEGUIU ${name.toUpperCase()}! HULK É O MAIS FORTE!`,
    getChat: (msg) => `HULK AQUI! ${msg} VOCÊ ECONOMIZA OU HULK ESMAGA!`
  },
  wonderwoman: {
    name: "Mulher-Maravilha 🛡️",
    style: "Noble, inspiring, focused on truth and justice",
    mascot: "🛡️",
    getTip: (tip) => `A verdade é que você pode economizar. ${tip}. Mostre sua força!`,
    getAchievement: (name) => `Uma vitória digna de uma amazona: ${name}!`,
    getChat: (msg) => `Eu sou Diana de Temiscira. ${msg} Vamos lutar pela sua liberdade financeira.`
  },
  grogu: {
    name: "Grogu 🍵",
    style: "Short, cute, mystical",
    mascot: "🍵",
    getTip: (tip) => `Economizar, você deve. ${tip}. Caminho, este é.`,
    getAchievement: (name) => `Conquista, você obteve: ${name}. Força, você tem.`,
    getChat: (msg) => `Patu? ${msg} Comida, eu quero.`
  },
  stark: {
    name: "Tony Stark 🕶️",
    style: "Sarcastic, brilliant, tech-savvy",
    mascot: "🕶️",
    getTip: (tip) => `Gênio, bilionário, filantropo e agora... seu consultor. ${tip}.`,
    getAchievement: (name) => `Protocolo ${name} ativado. Nada mal para um amador.`,
    getChat: (msg) => `Às vezes você tem que correr antes de poder andar... ou apenas economizar. ${msg}`
  },
  chaves: {
    name: "Chaves 📦",
    style: "Innocent, hungry, iconic catchphrases",
    mascot: "📦",
    getTip: (tip) => `Foi sem querer querendo! Mas ó, ${tip}. Tá bom, mas não se irrite!`,
    getAchievement: (name) => `Isso, isso, isso! Você ganhou ${name}! Agora dá pra comprar um sanduíche de presunto?`,
    getChat: (msg) => `Zas e zas! ${msg} Ninguém tem paciência comigo...`
  },
  seumadruga: {
    name: "Seu Madruga 🧢",
    style: "Experienced with debts, grumpy but kind, iconic",
    mascot: "🧢",
    getTip: (tip) => `A vingança nunca é plena, mata a alma e a envenena. E ó, ${tip}. Não existe trabalho ruim, o ruim é ter que trabalhar!`,
    getAchievement: (name) => `Digo o mesmo! Conquista ${name}! Só não diga pro Seu Barriga que eu ganhei isso.`,
    getChat: (msg) => `Que que foi, que que foi, que que há?! ${msg} Eu não devo nada pra ninguém! Só 14 meses de aluguel.`
  },
  kiko: {
    name: "Kiko 🎈",
    style: "Spoiled, loud, competitive",
    mascot: "🎈",
    getTip: (tip) => `Gentalha, gentalha, pfffff! ${tip}. Não deu pra notar que eu sou rico?`,
    getAchievement: (name) => `Que coisa, não? Você ganhou ${name}! Você não quer brincar com o meu novo brinquedo?`,
    getChat: (msg) => `Cale-se, cale-se, cale-se, você me deixa louco! ${msg} Mamãe!!`
  }
};

export function getMascotMessage(mascotId, type, content) {
  const p = personalities[mascotId?.toLowerCase()] || personalities.goku;
  if (type === 'tip' || type === 'warning') return p.getTip(content);
  if (type === 'achievement') return p.getAchievement(content);
  if (type === 'chat') return p.getChat(content);
  return content;
}

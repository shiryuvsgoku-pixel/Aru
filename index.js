require('dotenv').config();
const {
  Client,
  GatewayIntentBits
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== FUNÇÃO DE ROLAGEM =====
function processarRolagem(input) {
  input = input.toLowerCase().trim();

  // ===== DF =====
  const dfMatch = input.match(/^(\d+)df([+-]\d+)?$/);
  if (dfMatch) {
    const quantidade = parseInt(dfMatch[1]);
    const modificador = dfMatch[2] ? parseInt(dfMatch[2]) : 0;

    if (quantidade <= 0 || quantidade > 1000) return null;

    let resultados = [];
    let soma = 0;

    for (let i = 0; i < quantidade; i++) {
      const roll = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
      soma += roll;

      if (roll === 1) resultados.push('+');
      else if (roll === -1) resultados.push('-');
      else resultados.push('0');
    }

    const totalFinal = soma + modificador;

    let expressao = `${quantidade}df`;
    if (modificador > 0) expressao += ` + ${modificador}`;
    if (modificador < 0) expressao += ` - ${Math.abs(modificador)}`;

    return `\`${totalFinal}\` ⟵ [${resultados.join(', ')}] ${expressao}`;
  }

  // ===== DADOS NORMAIS =====
  const match = input.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!match) return null;

  const quantidade = parseInt(match[1]);
  const faces = parseInt(match[2]);
  const modificador = match[3] ? parseInt(match[3]) : 0;

  if (quantidade <= 0 || faces <= 0) return null;
  if (quantidade > 1000 || faces > 100000) return null;

  let resultados = [];

  for (let i = 0; i < quantidade; i++) {
    resultados.push(Math.floor(Math.random() * faces) + 1);
  }

  const somaDados = resultados.reduce((a, b) => a + b, 0);
  const totalFinal = somaDados + modificador;

  const resultadosFormatados = resultados.map(valor => {
    if (valor === faces || valor === 1) {
      return `**${valor}**`;
    }
    return valor;
  });

  let expressao = `${quantidade}d${faces}`;
  if (modificador > 0) expressao += ` + ${modificador}`;
  if (modificador < 0) expressao += ` - ${Math.abs(modificador)}`;

  let numeroPrincipal = totalFinal.toString();

  return `\`${numeroPrincipal}\` ⟵ [${resultadosFormatados.join(', ')}] ${expressao}`;
}

// ===== COMANDO a! =====
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const prefix = 'a!';
  if (!message.content.toLowerCase().startsWith(prefix)) return;

  const comando = message.content.slice(prefix.length).trim();

  if (!comando) {
    return message.reply('Use: `a! 1d20`');
  }

  const resposta = processarRolagem(comando);

  if (!resposta) {
    return message.reply('Formato inválido. Ex: `a! 2d6+3` ou `a! 4df`');
  }

  await message.reply(resposta);
});

client.once('clientReady', () => {
  console.log(`Bot online como ${client.user.tag}`);
});

client.login(process.env.TOKEN);
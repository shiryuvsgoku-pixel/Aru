const express = require('express');
require('dotenv').config(); // Carregado no topo
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const port = process.env.PORT || 3000;

// Servidor Web para o Render não desligar o bot
app.get('/', (req, res) => {
  res.send('Bot de RPG Online! 🎲');
});

app.listen(port, () => {
  console.log(`Servidor web rodando na porta ${port}`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== FUNÇÃO DE ROLAGEM (Sua lógica está perfeita aqui) =====
function processarRolagem(input) {
  input = input.toLowerCase().trim();

  // Regra para DF (Fudge/Fate)
  const dfMatch = input.match(/^(\d+)df([+-]\d+)?$/);
  if (dfMatch) {
    const quantidade = parseInt(dfMatch[1]);
    const modificador = dfMatch[2] ? parseInt(dfMatch[2]) : 0;
    if (quantidade <= 0 || quantidade > 100) return null; // Limite menor para evitar lag

    let resultados = [];
    let soma = 0;
    for (let i = 0; i < quantidade; i++) {
      const roll = Math.floor(Math.random() * 3) - 1;
      soma += roll;
      if (roll === 1) resultados.push('+');
      else if (roll === -1) resultados.push('-');
      else resultados.push('0');
    }
    const totalFinal = soma + modificador;
    let expressao = `${quantidade}df${modificador !== 0 ? (modificador > 0 ? ' + ' + modificador : ' - ' + Math.abs(modificador)) : ''}`;
    return `\`${totalFinal}\` ⟵ [${resultados.join(', ')}] ${expressao}`;
  }

  // Regra para Dados Normais (d20, d6, etc)
  const match = input.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!match) return null;

  const quantidade = parseInt(match[1]);
  const faces = parseInt(match[2]);
  const modificador = match[3] ? parseInt(match[3]) : 0;

  if (quantidade <= 0 || faces <= 0 || quantidade > 100) return null;

  let resultados = [];
  for (let i = 0; i < quantidade; i++) {
    resultados.push(Math.floor(Math.random() * faces) + 1);
  }

  const somaDados = resultados.reduce((a, b) => a + b, 0);
  const totalFinal = somaDados + modificador;
  const resultadosFormatados = resultados.map(v => (v === faces || v === 1) ? `**${v}**` : v);

  let expressao = `${quantidade}d${faces}${modificador !== 0 ? (modificador > 0 ? ' + ' + modificador : ' - ' + Math.abs(modificador)) : ''}`;
  return `\`${totalFinal}\` ⟵ [${resultadosFormatados.join(', ')}] ${expressao}`;
}

// ===== EVENTOS DO DISCORD =====
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const prefix = 'a!';
  if (!message.content.toLowerCase().startsWith(prefix)) return;

  const comando = message.content.slice(prefix.length).trim();
  if (!comando) return message.reply('Use: `a! 1d20`');

  const resposta = processarRolagem(comando);
  if (!resposta) return message.reply('Formato inválido. Ex: `a! 2d6+3` ou `a! 4df`');

  try {
    await message.reply(resposta);
  } catch (err) {
    console.error("Erro ao responder mensagem:", err);
  }
});

// CORREÇÃO AQUI: 'ready' em vez de 'clientReady'
client.once('ready', () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

client.login(process.env.TOKEN)
  .catch(err => console.error("❌ ERRO AO LOGAR:", err));

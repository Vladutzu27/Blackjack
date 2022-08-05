const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
const { allButtons, infoData } = require('./Buttons.js');

async function Win(gameAssets, event, double=0) {
  const { bet, userPfp } = gameAssets;
  await lib.discord.channels['@release'].messages.update({
    message_id: event.message.id,
    channel_id: event.channel_id,
    content: ``,
    components: allButtons(),
    embeds: [{
      description: `You won ${bet}!`,
      color: 0x000000,
      type: 'rich',
      fields: infoData(gameAssets),
      timestamp: new Date().toISOString(),
      footer: { text: `BlackJack ` },
      author: { 
        name: `${event.member.user.username}#${event.member.user.discriminator}`,
        url: userPfp,
        icon_url: userPfp,
      }
    }]
  });
  await Result('win', bet, event.member.user.id, double);
  return lib.keyvalue.store['@release'].clear({ key: `BlackJack:${event.message.id}` });
}

async function Lose(gameAssets, event, double=0) {
  const { bet, userPfp } = gameAssets;
  await lib.discord.channels['@release'].messages.update({
    message_id: event.message.id,
    channel_id: event.channel_id,
    content: ``,
    components: allButtons(),
    embeds: [{
      description: `You lose ${bet}`,
      color: 0x000000,
      type: 'rich',
      fields: infoData(gameAssets),
      timestamp: new Date().toISOString(),
      footer: { text: `BlackJack ` },
      author: { 
        name: `${event.member.user.username}#${event.member.user.discriminator}`,
        url: userPfp,
        icon_url: userPfp,
      }
    }]
  });
  await Result('lose', bet, event.member.user.id, double);
  return lib.keyvalue.store['@release'].clear({ key: `BlackJack:${event.message.id}` });
}

async function Draw(gameAssets, event, double = 0) {
  const { bet, userPfp } = gameAssets;
  await lib.discord.channels['@release'].messages.update({
    message_id: event.message.id,
    channel_id: event.channel_id,
    content: ``,
    components: allButtons(),
    embeds: [{
      description: `Game Draw!`,
      color: 0x000000,
      type: 'rich',
      fields: infoData(gameAssets),
      timestamp: new Date().toISOString(),
      footer: { text: `BlackJack ` },
      author: { 
        name: `${event.member.user.username}#${event.member.user.discriminator}`,
        url: userPfp,
        icon_url: userPfp,
      }
    }]
  });
  await Result('draw', bet, event.member.user.id, double);
  return lib.keyvalue.store['@release'].clear({ key: `BlackJack:${event.message.id}` });
}

async function StartWin(gameAssets, userPfp, event, double = 0) {
  let { bet } = gameAssets;
  await lib.discord.channels['@release'].messages.create({
    channel_id: event.channel_id,
    content: ``,
    components: allButtons(),
    embeds: [{
      description: `You won ${bet}!`,
      color: 0x000000,
      type: 'rich',
      fields: infoData(gameAssets),
      timestamp: new Date().toISOString(),
      footer: { text: `BlackJack ` },
      author: { 
        name: `${event.member.user.username}#${event.member.user.discriminator}`,
        url: userPfp,
        icon_url: userPfp,
      }
    }]
  });
  await Result('win', bet, event.member.user.id, double);
  return true;
}

async function StartLose(gameAssets, userPfp, event, double = 0) {
  let { bet } = gameAssets;
  await lib.discord.channels['@release'].messages.create({
    channel_id: event.channel_id,
    content: ``,
    components: allButtons(),
    embeds: [{
      description: `You lose ${bet}`,
      color: 0x000000,
      type: 'rich',
      fields: infoData(gameAssets),
      timestamp: new Date().toISOString(),
      footer: { text: `BlackJack ` },
      author: { 
        name: `${event.member.user.username}#${event.member.user.discriminator}`,
        url: userPfp,
        icon_url: userPfp,
      }
    }]
  });
  await Result('lose', bet, event.member.user.id, double);
  return true;
}

async function Result(game, bet, id, double) {
  const user = await lib.googlesheets.query['@release'].select({
    range: `Level!A:F`, bounds: 'FIRST_EMPTY_ROW',
    where: [{ 'User__is': id }],
  });
  const money = parseInt(user.rows[0].fields['Money']);
  let finalResult;
  if (game === 'win') finalResult = (money + (parseInt(bet) * 2)) * double;
  else if (game === 'draw') finalResult = (money + parseInt(bet)) * double;
  else finalResult = money;
  await lib.googlesheets.query['@release'].update({
    range: `Level!A:F`, bounds: 'FIRST_EMPTY_ROW',
    where: [{ 'User__is': id }],
    fields: { 'Money': finalResult }
  });
  return true;
}

module.exports = { Win, Draw, Lose, StartWin, StartLose };

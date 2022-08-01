const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
const { CardGenerator, PickCard } = require('../../../../Functions/Cards.js');
const { StartWin, StartLose } = require('../../../../Functions/Logic.js');
const event = context.params.event;
const { channel_id, guild_id, member, data } = event;
const userData = await lib.googlesheets.query['@release'].select({
  range: `Level!A:G`, bounds: 'FIRST_EMPTY_ROW',
  where: [{ 'User__is': member.user.id }],
});
if (!userData.rows.length) return;
let get = userData.rows[0].fields;
let currentMoney = parseInt(get['Money']);
let type = data.options[0].value;
return console.log(type);
let insertAmount = data.options[1].value;
let getValue;
if (type.startsWith('enter a percentage')) { // if percentage value
  if (insertAmount <= 0) {
    await lib.discord.interactions['@release'].responses.create({
      token, response_type: 'DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE'
    });
    return lib.discord.interactions['@release'].responses.update({ // sends an notification message.
      token, content: `Invalid output.`,
    });
  }
  getValue = Percent(Math.min(100, insertAmount), currentMoney);
} else { // if specified value
  if (insertAmount > currentMoney) { // if the balance is higher than the users current money
    await lib.discord.interactions['@release'].responses.create({
      token, response_type: 'DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE'
    });
    return lib.discord.interactions['@release'].responses.update({ // sends an notification message.
      token, content: `You only have $${currentMoney}`,
    });
  } else if (insertAmount <= 0) {
    await lib.discord.interactions['@release'].responses.create({
      token, response_type: 'DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE'
    });
    return lib.discord.interactions['@release'].responses.update({ // sends an notification message.
      token, content: `Input must be higher than 0`,
    });
  }
  getValue = insertAmount;
}
let newBalance = currentMoney - getValue;
await lib.googlesheets.query['@release'].update({
  range: `Level!A:G`, bounds: 'FIRST_EMPTY_ROW',
  where: [{ 'User__is': member.user.id }],
  fields: { 'Bank': newBank, 'Money': newBalance, }
});
const users = await lib.discord.users['@release'].retrieve({ user_id: member.user.id });
const userPfp = !users.avatar
? `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`
: `https://cdn.discordapp.com/avatars/${users.id}/${users.avatar}.${users.avatar.startsWith('a_') ? 'gif' : 'png'}?size=2048`;
let bet = output[1];
let selectedCards = [];
let playerCard = [];
let botCard = [];
let totalPlayerCardValue = 0;
let totalBotCardValue = 0;
Player: for (let i = 0; i < 2; i++) {
  let player = PickCard(CardGenerator(selectedCards));
  playerCard.push({ card: player.card, suit: player.assets.suit, value: player.assets.value });
  selectedCards.push({ [player.assets.suit]: player.card });
}
Bot: for (let i = 0; i < 2; i++) {
  let bot = PickCard(CardGenerator(selectedCards));
  botCard.push({ card: bot.card, suit: bot.assets.suit, value: bot.assets.value });
  selectedCards.push({ [bot.assets.suit]: bot.card });
}
for (let i = 0; i < playerCard.length; i++) {
  if (playerCard[i].card === 'A' && (totalPlayerCardValue + 11) > 21) totalPlayerCardValue += 1;
  else totalPlayerCardValue += playerCard[i].value;
}
for (let i = 0; i < botCard.length; i++) {
  if (botCard[i].card === 'A' && (totalBotCardValue + 11) > 21) totalBotCardValue += 1;
  else totalBotCardValue += botCard[i].value;
}
let yourHand = playerCard.map(x => `\`${x.card}${x.suit}\``).join(' ');
let dealerHand = botCard.slice(0, Math.max(0, botCard.length-1)).map(x => `\`${x.card}${x.suit}\``).concat('`?`').join(' ');
let resultDealerHand = botCard.map(x => `\`${x.card}${x.suit}\``).join(' ');
if (totalPlayerCardValue === 21) {
  await StartWin(
    { yourHand, resultDealerHand, playerCard, botCard, totalPlayerCardValue, totalBotCardValue, bet },
    userPfp, event); return;
} else if (totalBotCardValue === 21) {
  await StartLose(
    { yourHand, resultDealerHand, playerCard, botCard, totalPlayerCardValue, totalBotCardValue, bet },
     userPfp, event); return;
} else {
  const msg = await lib.discord.channels['@release'].messages.create({
    channel_id,
    content: ``,
    components: [{
      type: 1,
      components: [
        {
        type: 2,
        style: 1,
        label: `Hit`,
        disabled: false,
        custom_id: `hit`,
        },
        {
        type: 2,
        style: 3,
        label: `Stand`,
        disabled: false,
        custom_id: `stand`,
        },
        {
        type: 2,
        style: 2,
        label: `Double Down`,
        disabled: false,
        custom_id: `double`,
        },
        {
        type: 2,
        style: 4,
        label: `Fold`,
        disabled: false,
        custom_id: `fold`,
        },
      ]
    }],
    embeds: [{
      description: ``,
      color: 0x000000,
      type: 'rich',
      fields: [
        {
        name: `Your Hand`, // Players Hand
        value: [
          yourHand,
          ``,
          `Value: ${totalPlayerCardValue}`,
          ].join('\n'),
        inline: true,
        },
        {
        name: `Dealer Hand`, // Dealer Hand
        value: [
          dealerHand,
          ``,
          `Value: ${botCard[0].value}`,
          ].join('\n'),
        inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: `BlackJack ` },
      author: { 
        name: `${member.user.username}#${member.user.discriminator}`,
        url: userPfp,
        icon_url: userPfp,
      }
    }]
  });
  await lib.keyvalue.store['@release'].set({
    key: `BlackJack:${msg.id}`,
    value: {
      owner: member.user.id, selectedCards,
      playerCard, botCard,
      playerValue: totalPlayerCardValue,
      botValue: totalBotCardValue,
      bet, userPfp,
    }
  });
}

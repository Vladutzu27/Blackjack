const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
const { CardGenerator, PickCard } = require('../../Assets/Cards.js');
const { Win, Lose, Draw } = require('../../Assets/Logic.js');
const event = context.params.event;
const { member, message, channel_id, guild_id } = event;
let game = await lib.keyvalue.store['@release'].get({
  key: `BlackJack:${message.id}`,
  defaultValue: false,
});
if (!game) return;
if (game.owner !== member.user.id) return;
let userPfp = game.userPfp;
let bet = game.bet;
let selectedCards = game.selectedCards;
let playerCard = game.playerCard;
let botCard = game.botCard;
let defaultPlayerValue = game.playerValue;
let defaultBotValue = game.botValue;
let totalPlayerCardValue = 0;
let totalBotCardValue = 0;
let resultDealerHand;
let yourHand;
let player = PickCard(CardGenerator(selectedCards));
playerCard.push({ card: player.card, suit: player.assets.suit, value: player.assets.value });
selectedCards.push({ [player.assets.suit]: player.card });
Player: for (let i = 0; i < playerCard.length; i++) {
  if (playerCard[i].card === 'A' && (totalPlayerCardValue + 11) > 21) totalPlayerCardValue += 1;
  else totalPlayerCardValue += playerCard[i].value;
}
yourHand = playerCard.map(x => `\`${x.card}${x.suit}\``).join(' ');
resultDealerHand = botCard.map(x => `\`${x.card}${x.suit}\``).join(' ');
if (totalPlayerCardValue === 21) { // if the player manage to get 21, win
  await Win({ bet, totalPlayerCardValue, totalBotCardValue: defaultBotValue, yourHand, resultDealerHand, userPfp }, event);
  return;
} else if (totalPlayerCardValue > 21) { // if the player card value exceeds 21, lose
  await Lose({ bet, totalPlayerCardValue, totalBotCardValue: defaultBotValue, yourHand, resultDealerHand, userPfp  }, event);
  return;
}
resultDealerHand = botCard.slice(0, Math.max(0, botCard.length-1)).map(x => `\`${x.card}${x.suit}\``).concat('`?`').join(' ');
const msg = await lib.discord.channels['@release'].messages.update({
  message_id: message.id,
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
        resultDealerHand,
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
    owner: member.user.id,
    selectedCards,
    playerCard,
    botCard,
    playerValue: totalPlayerCardValue,
    botValue: !totalBotCardValue ? defaultBotValue: totalBotCardValue,
    bet,
    userPfp,
  }
});

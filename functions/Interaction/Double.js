const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
const { CardGenerator, PickCard } = require('../../Functions/Cards.js');
const { Win, Lose, Draw } = require('../../Functions/Logic.js');
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
let totalPlayerCardValue = game.playerValue;
let defaultBotValue = game.botValue;
let totalBotCardValue = 0;
let yourHand;
let resultDealerHand;
let probability = [];
Generate: for (let i = 0; i < (defaultBotValue + 20); i++) {
  if (i+1 <= defaultBotValue) probability.push(false); // amount of chances the bot will "stand"/pass
  else probability.push(true); // amount of chances the bot will pick another card
}
probability.sort((a,b) => 0.5 - Math.random());
let chance = probability[Math.floor(Math.random() * probability.length)];
if (!chance) { // bot passes
  yourHand = playerCard.map(x => `\`${x.card}${x.suit}\``).join(' ');
  resultDealerHand = botCard.map(x => `\`${x.card}${x.suit}\``).join(' ');
  if (totalPlayerCardValue === defaultBotValue) { // If Draw
    await Draw({ bet, totalPlayerCardValue, totalBotCardValue: defaultBotValue, yourHand, resultDealerHand, userPfp }, event, 2);
    return;
  } else if (totalPlayerCardValue < defaultBotValue) { // If Player Lose
    await Lose({ bet, totalPlayerCardValue, totalBotCardValue: defaultBotValue, yourHand, resultDealerHand, userPfp }, event, 2);
    return;
  } else if (totalPlayerCardValue > defaultBotValue) { // If Player Win
    await Win({ bet, totalPlayerCardValue, totalBotCardValue: defaultBotValue, yourHand, resultDealerHand, userPfp }, event, 2);
    return;
  }
} else {
  for (let i = 0; i < 999; i++) {
    let redo = probability[Math.floor(Math.random() * probability.length)];
    let bot = PickCard(CardGenerator(selectedCards));
    botCard.push({ card: bot.card, suit: bot.assets.suit, value: bot.assets.value });
    if ((totalBotCardValue + bot.assets.value) > 21) break;
    selectedCards.push({ [bot.assets.suit]: bot.card });
    if (i+1 === 1) {
      for (let x = 0; x < botCard.length; x++) {
        if (botCard[x].card === 'A' && (totalBotCardValue + 11) > 21) totalBotCardValue += 1;
        else totalBotCardValue += botCard[x].value;
      }
    } else totalBotCardValue += botCard[botCard.length-1].value, console.log(i+1);
    if (totalBotCardValue > 21 || totalBotCardValue === 21) break;
    else if (totalPlayerCardValue > totalBotCardValue) continue;
    else if (!redo) break;
    else continue;
  }
}
yourHand = playerCard.map(x => `\`${x.card}${x.suit}\``).join(' ');
resultDealerHand = botCard.map(x => `\`${x.card}${x.suit}\``).join(' ');
if (totalPlayerCardValue === totalBotCardValue) { // If Draw
  await Draw({ bet, totalPlayerCardValue, totalBotCardValue, yourHand, resultDealerHand, userPfp }, event, 2);
  return;
} else if (totalBotCardValue > 21) { // if bot's card exceed to 21
  await Win({ bet, totalPlayerCardValue, totalBotCardValue, yourHand, resultDealerHand, userPfp }, event, 2);
  return;
} else if (totalPlayerCardValue < totalBotCardValue) { // If Player Lose
  await Lose({ bet, totalPlayerCardValue, totalBotCardValue, yourHand, resultDealerHand, userPfp }, event, 2);
  return;
} else if (totalPlayerCardValue > totalBotCardValue) { // If Player Win
  await Win({ bet, totalPlayerCardValue, totalBotCardValue, yourHand, resultDealerHand, userPfp }, event, 2);
  return;
}

const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
const { allButtons, infoData } = require('../../Assets/Buttons.js');
const event = context.params.event;
const { channel_id, guild_id, member, message } = event;
let game = await lib.keyvalue.store['@release'].get({
  key: `BlackJack:${message.id}`,
  defaultValue: false,
});
if (!game) return;
if (game.owner !== member.user.id) return;
message.embeds[0].description = 'You fold your card';
message.embeds[0].fields = infoData({
  yourHand: game.playerCard.map(x => `\`${x.card}${x.suit}\``).join(' '),
  resultDealerHand: game.botCard.map(x => `\`${x.card}${x.suit}\``).join(' '),
  totalPlayerCardValue: game.playerValue,
  totalBotCardValue: game.botValue,
});
await lib.discord.channels['@release'].messages.update({
  message_id: message.id, // required
  channel_id,
  content: message.content,
  components: allButtons(),
  embeds: message.embeds,
});
await lib.keyvalue.store['@release'].clear({
  key: `BlackJack:${message.id}`,
});

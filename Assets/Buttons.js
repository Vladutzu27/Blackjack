function allButtons() {
  return [{
    type: 1,
    components: [
      {
      type: 2,
      style: 1,
      label: `Hit`,
      disabled: true,
      custom_id: `hit`,
      },
      {
      type: 2,
      style: 3,
      label: `Stand`,
      disabled: true,
      custom_id: `stand`,
      },
      {
      type: 2,
      style: 2,
      label: `Double Down`,
      disabled: true,
      custom_id: `double`,
      },
      {
      type: 2,
      style: 4,
      label: `Fold`,
      disabled: true,
      custom_id: `fold`,
      },
    ]
  }];
}

function infoData(gameAssets) {
  let { yourHand, resultDealerHand, totalPlayerCardValue, totalBotCardValue } = gameAssets;
  return [
    {
    name: `Your Hand`, // Players Hand
    value: [yourHand,``,`Value: ${totalPlayerCardValue === 21 ? 'Blackjack' : totalPlayerCardValue}`].join('\n'),
    inline: true,
    },
    {
    name: `Dealer Hand`, // Dealer Hand
    value: [resultDealerHand,``,`Value: ${totalBotCardValue === 21 ? 'Blackjack' : totalBotCardValue}`].join('\n'),
    inline: true,
    },
  ]
}

module.exports = { allButtons, infoData };

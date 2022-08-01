function CardGenerator(playedCards = []) {
  let card = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  let deck = ['♠','♥','♦','♣'];
  let createDeck = { '♠': {}, '♥': {}, '♦': {}, '♣': {} };
    for (let x of card) {
      for (let i of deck) {
        let value = 0;
        if (x === 'A') value = 11;
        else if (['10','J','Q','K'].includes(x)) value = 10;
        else value = parseInt(x);
        createDeck[i][x] = { suit: i, value };
      }
    }
    if (!playedCards.length) return createDeck;
    for (let clear of playedCards) {
      let findSuit = Object.keys(clear)[0];
      let findCard = Object.values(clear)[0];
      delete createDeck[findSuit][findCard]; // example: ♠ A
    }
    return createDeck;
}

function PickCard(cards) {
  let pickSuit = Object.keys(cards)[Math.floor(Math.random() * Object.keys(cards).length)];
  let pickCard = Object.keys(cards[pickSuit])[Math.floor(Math.random() * Object.keys(cards[pickSuit]).length)];
  return { card: pickCard, assets: cards[pickSuit][pickCard] };
}

module.exports = { CardGenerator, PickCard };

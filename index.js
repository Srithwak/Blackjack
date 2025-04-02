function naturalLogic(game) {
    const player = game.players[0];
    const dealer = game.players[1];
    const playerNatural = (player.total == 21) ? true : false;
    const dealerNatural = (dealer.total == 21) ? true : false;
    if (playerNatural && dealerNatural) {
       return 't';
    } else if (playerNatural) {
       return 'p';
    } else if (dealerNatural) {
       return 'd';
    }
 }
 function hitLogic(game) {
    const player = game.players[0];
    const dealer = game.players[1];
    if (player.total > 21) {
       return 'p';
    } else if (dealer.total > 21) {
       return 'd';
    }
 }
 function standLogic(game) {
    const player = game.players[0];
    const dealer = game.players[1];
    if (player.points == dealer.points) {
       return 't';
    } else if (player.points > dealer.points) {
       return 'p';
    } else if (player.points < dealer.points) {
       return 'd';
    }
 }
 const prompt = require('prompt-sync')();
 const config = {
    deckCount: 1
 }
 if (config.deckCount < 1) {
    console.log('You need atleast 1 deck');
    process.exit(0);
 }
 function getNumericalValue(card) {
    const values = {
       a: 1, T: 10, J: 10, Q: 10, K: 10, A: 11
    }
    if (values[card.face]) {
       return values[card.face];
    }
    return parseInt(card.face);
 }
 function makeAceLow(card) {
    if (card.face == 'A') {
       card.face = 'a';
    }
 }
 function renderGame(player, dealer) {
    console.log(`Player\nTotal: ${player.total}`);
    const playerHand = player.hand;
    playerHand.forEach(card => {
       process.stdout.write(`╭───╮`);
    });
    console.log('');
    playerHand.forEach(card => {
       process.stdout.write(`│ ${card.face} │`);
    });
    console.log('');
    playerHand.forEach(card => {
       process.stdout.write(`│ ${card.suit} │`);
    });
    console.log('');
    playerHand.forEach(card => {
       process.stdout.write(`╰───╯`);
    });
    console.log(`\n\nDealer\nTotal: ???`);
    const dealerUpCard = dealer.hand[0];
    console.log(`╭───╮\n│ ${dealerUpCard.face} │\n│ ${dealerUpCard.suit} │\n╰───╯`);
 }
 function aceCheck(playerList) {
    for (let i = 0; i < playerList.length; i++) {
       for (let j = 0; j < playerList[i].hand.length; j++) {
          if (getNumericalValue(playerList[i].hand[j]) == 11) {
             playerList[i].ace = true;
          }
       }
    }
 }
 function aceModify(player, dealCard) {
    const dealCardValue = getNumericalValue(dealCard);
    if (dealCardValue == 11) {
       if ((player.ace) || (!player.ace && dealCardValue + player.total > 21)) {
          makeAceLow(dealCard);
       }
    }
 }
 function shuffle(cardsToShuffle) {
    let cards = cardsToShuffle.slice();
    for (let i = cards.length - 1; i >= 0; i--) {
       const randomIndex = Math.floor(Math.random() * (i + 1));
       const randomCard = cards[randomIndex];
       cards[randomIndex] = cards[i];
       cards[i] = randomCard;
    }
    return cards;
 }
 function createDeck() {
    let deck = new Array();
    const suits = 'scdh'.split('');
    const faces = '23456789TJQKA'.split('');
    suits.forEach(suit => {
       faces.forEach(face => {
          deck.push({ face, suit });
       });
    });
    return deck;
 }
 function createShoe(deckCount) {
    let shoe = new Array();
    for (let i = 0; i < deckCount; i++) {
       shoe = shoe.concat(shuffle(createDeck()));
    }
    return shoe;
 }
 function createPlayers(playerCount, shoe) {
    let players = new Array();
    for (let i = 0; i < playerCount; i++) {
       players.push({ id: i, ace: false, total: 0, hand: new Array() });
    }
    for (let i = 0; i < 2; i++) {
       players.forEach(player => {
          aceCheck(players);
          let dealCard = shoe.pop();
          aceModify(player, dealCard);
          player.hand.push(dealCard);
          player.total += getNumericalValue(dealCard);
       });
    }
    return players;
 }
 function build(config) {
    let game = {};
    // let testDeck = [
    //    { face: 'K', suit: 'd' },
    //    { face: 'A', suit: 'd' },
    //    { face: 'K', suit: 's' },
    //    { face: 'A', suit: 's' }
    // ]
    game.shoe = createShoe(config.deckCount);
    game.players = createPlayers(2, game.shoe);
    return game;
 }
 function isSoftHand(player) {
    return player.ace;
 }
 function getSoftMove(player, dealer) {
    const moveTable = {
       18: 'ssssssshhh'
    }
    const moves = {
       h: 'hit',
       s: 'stand'
    }
    const playerScore = player.total;
    const dealerUpCard = getNumericalValue(dealer.hand[0]);
    if (playerScore <= 17) {
       return moves.h;
    }
    if (playerScore >= 19) {
       return moves.s;
    }
    let move = moves[moveTable[playerScore].charAt(dealerUpCard - 2)];
    return move;
 }
 function getHardMove(player, dealer) {
    const moveTable = {
       12: 'hhssshhhhh',
       13: 'ssssshhhhh',
       14: 'ssssshhhhh',
       15: 'ssssshhhhh',
       16: 'ssssshhhhh'
    }
    const moves = {
       h: 'hit',
       s: 'stand'
    }
    const playerScore = player.total;
    const dealerUpCard = getNumericalValue(dealer.hand[0]);
    if (playerScore <= 11) {
       return moves.h;
    }
    if (playerScore >= 17) {
       return moves.s;
    }
    let move = moves[moveTable[playerScore].charAt(dealerUpCard - 2)];
    return move;
 }
 function calculateBestMove(player, dealer) {
    if (player.total >= 19) {
       return 'stand';
    }
    if (isSoftHand(player)) {
       return getSoftMove(player, dealer);
    }
    return getHardMove(player, dealer);
 }
 let game = build(config);
 let player = game.players[0];
 let dealer = game.players[1];
 renderGame(player, dealer);
 console.log(calculateBestMove(player, dealer));
 if (player.total == 21 && dealer.total == 21) {
    console.log('Both got naturals');
    renderGame(player, dealer, true);
    return;
 } else if (player.total == 21) {
    console.log('Player got dealt a natural');
    renderGame(player, dealer, true);
    return;
 } else if (dealer.total == 21) {
    console.log('Dealer got dealt a natural');
    renderGame(player, dealer, true);
    return;
 }
 function canSplit(player) {
    if (player.hand.length != 2) {
       return false;
    }
    return player.hand[0].face == player.hand[1].face;
 }
 function shouldSplit(player, dealer) {
    const splitCard = getNumericalValue(player.hand[0]);
    const dealerUpCardValue = getNumericalValue(dealer.hand[0]);
    return splits[splitCard].includes(dealerUpCardValue);
 }
 const splits = {
    2: [2, 3, 4, 5, 6, 7],
    3: [2, 3, 4, 5, 6, 7],
    4: [5, 6],
    5: [],
    6: [2, 3, 4, 5, 6],
    7: [2, 3, 4, 5, 6, 7],
    8: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    9: [2, 3, 4, 5, 6, 8, 9],
    10: [],
    11: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
 }
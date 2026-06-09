// Some "global variables" that are useful throughout the project

cardNumberDictionary = {
    'ace': 1,
    'two': 2,
    'three': 3,
    'four': 4,
    'five': 5,
    'six': 6,
    'seven': 7,
    'eight': 8,
    'nine': 9,
    'ten': 10,
    'jack': 11,
    'queen': 12,
    'king': 13
} // "dictionary" for translating card names to numbers

let errorMessageTimeout; // Error message timeout time
let currentBoard; // The currently selected board
let boards = []; // An array of all boards

// Function for changing the board

function changeBoard(event, newBoardName) {
    currentBoard = getBoard(newBoardName); // using newBoardName because we are calling this in html

    document.querySelectorAll('.board-content')
        .forEach((board) => board.style.display = 'none');

    document.querySelectorAll('.board-links')
        .forEach((boardLink) => boardLink.classList.remove('active'));

    
    document.querySelector(`#${newBoardName}`).style.display = 'block';
    event.currentTarget.classList.add('active');
}

class Board {
    #name; // name of the board
    #leftOffset; // left offset for placing card images
    #topOffset; // top offset for placing card images
    #currentDeck; // the currently selected deck on this board
    #decks; // decks on this board

    constructor (name) {
        this.#name = name;
        this.#leftOffset = '0px';
        this.#topOffset = '0px';

        this.#currentDeck = {
            draw() {
                if (errorMessageTimeout !== undefined) {
                    clearTimeout(errorMessageTimeout);
                }
                const errorMessage = document.querySelector('#error-message');
                    errorMessage.textContent = 'Error: No deck selected.';

                    errorMessageTimeout = setTimeout(() => errorMessage.textContent = '', 3000);
            },
            resetDeck() {
                if (errorMessageTimeout !== undefined) {
                    clearTimeout(errorMessageTimeout);
                }
                const errorMessage = document.querySelector('#error-message');
                    errorMessage.textContent = 'Error: No deck selected.';

                    errorMessageTimeout = setTimeout(() => errorMessage.textContent = '', 3000);
            }
        }
        boards.push(this);
    }

    get name() {return this.#name;}
    get leftOffset() {return this.#leftOffset;}
    get topOffset() {return this.#topOffset;}
    get currentDeck() {return this.#currentDeck;}
    get decks() {return this.#decks;}

    setLeftOffset(newLeftOffset) {
        this.#leftOffset = newLeftOffset;
    }
    
    setTopOffset(newTopOffset) {
        this.#topOffset = newTopOffset;
    }

    setCurrentDeck(newCurrentDeck) {
        this.#currentDeck = newCurrentDeck;
    }
}

function getBoard(name) {
    for (const board of boards) {
        if (board.name === name) {return board;}
    }
}

// Card class for individual cards

class Card {
    #suit;
    #rank;
    #image;
    #name;

    constructor(suit, rank, image) {
        this.#suit = suit;
        this.#rank = rank;
        this.#image = `cards/${suit}_${rank}.png`;
        this.#name = `${this.rank} of ${this.suit}s`;
    }

    get suit() {return this.#suit;}
    get rank() {return this.#rank;}
    get image() {return this.#image;}
    get name() {return this.#name;}
}

// Deck class for full decks (not necessarily the standard 52-card deck)

class Deck {
    #name;
    #cardCount;
    #cards;
    #availableCards;
    #board;

    constructor(name, cards, board) {
        this.#name = name; // name of the deck
        this.#cardCount = cards.length; // number of cards in the deck
        this.#cards = cards; // all cards in the deck (never edited)
        this.#availableCards = [...this.#cards]; // all cards available to draw (gets edited)
        this.#board = board; // board that the deck is on

        // Appending a new button to the deck-selection-menu div to switch the currentDeck variable 
        // to this deck

        const deckPlaceholder = this;

        const newButton = Object.assign(document.createElement('button'), {
            textContent: `${this.#name} ${this.#cardCount}`,
            type: 'button',
            id: `${this.#name}-button`,
            className: 'deck-links'
        })

        newButton.addEventListener('click', () => {
            currentBoard.setCurrentDeck(deckPlaceholder);

            document.querySelector(`#${this.#board.name}`).querySelectorAll('.deck-links')
                .forEach((deckButton) => deckButton.classList.remove('active'));

            newButton.classList.add('active');
        })
        document.querySelector(`#${this.#board.name}`)
            .querySelector('.deck-selection-menu').append(newButton);
    }

    get name() {return this.#name;}
    get cardCount() {return this.#cardCount;}
    get cards() {return this.#cards;}
    get availableCards() {return this.#availableCards;}
    get board() {return this.#board;}

    // Method for drawing a card from the available cards in the deck

    draw() {

        // Simple catch to end the function if the deck is empty

        if (currentBoard.currentDeck.cardCount === 0) {
            if (errorMessageTimeout !== undefined) {
                clearTimeout(errorMessageTimeout);
            }
            const errorMessage = document.querySelector(`#${currentBoard.name}`).querySelector('#error-message');
            errorMessage.textContent = 'Error: Deck empty. Try resetting.';

            errorMessageTimeout = setTimeout(() => errorMessage.textContent = '', 3000);
            return;
        }

        // Get a random card from the available cards in the deck

        function getRandomInt(max) {
            return Math.floor(Math.random() * max);
        }
        const randCard = this.#availableCards[getRandomInt(this.#cardCount)];

        this.placeCardImageHelper(this.createCardImageHelper(randCard));

        this.removeCardHelper(randCard);

        return randCard;
    }

    // Helper method for creating a card image from a random card

    createCardImageHelper(randCard) {
        return Object.assign(document.createElement('img'), {
            src: `${randCard.image}`,
            title: `${capitalize(randCard.rank)} of ${capitalize(randCard.suit)}s`,
            className: 'card-images',
            id: `${randCard.rank}-of-${randCard.suit}s`
        })
    }

    // Helper method for placing a card image

    placeCardImageHelper(cardImage) {

        let imageLeftOffset = currentBoard.leftOffset;
        let imageTopOffset = currentBoard.topOffset;

        // If the cards reach the edge of the screen, move them down a row

        if (Number(imageLeftOffset.split('px')[0]) + 210 > window.innerWidth) {
            imageLeftOffset = '0px';

            // Adjusting offset (used again later in method)

            const newTopOffset = Number(imageTopOffset.split('px')[0]) + 90;
            imageTopOffset = `${newTopOffset}px`; 
        }

        Object.assign(cardImage.style, {
            position: 'absolute',
            top: imageTopOffset,
            left: imageLeftOffset,
            width: '200px'
        })

        const newLeftOffset = Number(imageLeftOffset.split('px')[0]) + 30;
        imageLeftOffset = `${newLeftOffset}px`; 

        document.querySelector(`#${currentBoard.name}`)
            .querySelector('.card-display-area').append(cardImage);

        currentBoard.setLeftOffset(imageLeftOffset);
        currentBoard.setTopOffset(imageTopOffset);
    }

    // Helper method to remove a card from the available cards in the deck

    removeCardHelper(card) {
        const index = this.#availableCards.indexOf(card);
        if (index > -1) {
            this.#availableCards.splice(index, 1);
        }
        this.#cardCount -= 1;

        document.querySelector(`#${currentBoard.name}`).querySelector(`#${this.#name}-button`).textContent = 
            `${this.#name} ${this.#cardCount}`;
    }

    // Method to reset the deck (i.e. make all cards available again)

    resetDeck() {
        this.#availableCards = [...this.#cards];
        this.#cardCount = this.#cards.length;

        document.querySelector(`#${currentBoard.name}`).querySelector(`#${this.#name}-button`).textContent = 
            `${this.#name} ${this.#cardCount}`;
    }
}

// Function for capitalizing

function capitalize(str) {
    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

// Function for clearing the board of cards

function clearBoard() {
    document.querySelector(`#${currentBoard.name}`)
        .querySelector('.card-display-area').innerHTML = '';
    currentBoard.setLeftOffset('0px');
    currentBoard.setTopOffset('0px');
}

// Typing minigame code

const displayedCards = [];
let checkTypingLoop;
let drawLoop;

function startTypingGame() {
    document.querySelector('#user-typing-input').value = '';

    checkTypingLoop = setInterval(checkUserTypingInput, 250);
    drawLoop = setInterval(drawFromCurrentDeck, 1000);
}

function stopTypingGame() {
    clearInterval(checkTypingLoop);
    clearInterval(drawLoop);
}

function checkUserTypingInput() {
    let userTypingInput = document.querySelector('#user-typing-input').value;

    for (const card of displayedCards) {
        if (card.name === userTypingInput) {
            console.log('REMOVE: yes!');
            document.querySelector('#user-typing-input').value = '';

            document.querySelector('#typing-board').querySelector(`#${card.rank}-of-${card.suit}s`).src = '';
        }
    }
}
function drawFromCurrentDeck() {
    displayedCards.push(typingBoard.currentDeck.draw());
}



// Creating placeholder decks for testing new things

const suits = ['spade', 'heart', 'diamond', 'club'];

const ranks = ['ace','two','three','four','five','six','seven','eight','nine','ten','jack','queen','king'];

const deck1Cards = [];
for (const suit of suits) {
    for (const rank of ranks) {
        deck1Cards.push(new Card(suit, rank, `${suit}_${rank}.png`));
    }
}

const deck2Cards = [];
for (const rank of ranks) {
    deck2Cards.push(new Card('heart', rank, `heart_${rank}.png`));
}

// Creating boards

const board1 = new Board('board-1');
const board2 = new Board('board-2');
const typingBoard = new Board('typing-board');

const deck1 = new Deck('standard', deck1Cards, board1);
const deck2 = new Deck('all-hearts', deck2Cards, board1);
const deck3 = new Deck('standard', deck1Cards, board2);
const deck4 = new Deck('all-hearts', deck2Cards, board2);
const deck5 = new Deck('standard', deck1Cards, typingBoard);
const deck6 = new Deck('all-hearts', deck2Cards, typingBoard);

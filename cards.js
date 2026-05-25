// Some "global variables" that are useful throughout the project

let errorMessageTimeout; // Error message timeout time

let currentBoard;
let boards = [];

let currentDeck = {
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
} // This variable will control which deck is drawn and selected from
  // Initialize it as an object with these functions for error management

// Function for changing the tab

function changeBoard(event, newBoard) {

    // This might or might not stay, but it is moving the deck buttons between tabs

    if (currentBoard === undefined) {currentBoard = 'board-1'} // This isn't pretty, but the buttons
                                                            // will always appear on the first tab 
                                                            // first
    const buttons = document.querySelector(`#${currentBoard}`).querySelectorAll('.deck-links');
    const newLocation = document.querySelector(`#${newBoard}`).querySelector('.deck-selection-menu');
    buttons.forEach((button) => newLocation.append(button));
    
    currentBoard = newBoard;

    document.querySelectorAll('.tab-content')
        .forEach((tab) => tab.style.display = 'none');

    document.querySelectorAll('.tab-links')
        .forEach((tabLink) => tabLink.classList.remove('active'));

    
    document.querySelector(`#${newBoard}`).style.display = 'block';
    event.currentTarget.classList.add('active');
}

class Board {
    #name;
    #leftOffset;
    #topOffset;

    constructor (name) {
        this.#name = name;
        this.#leftOffset = '0px';
        this.#topOffset = '0px';

        boards.push(this);
    }

    get name() {return this.#name;}
    get leftOffset() {return this.#leftOffset}
    get topOffset() {return this.#topOffset}

    setLeftOffset(newLeftOffset) {
        this.#leftOffset = newLeftOffset;
    }
    
    setTopOffset(newTopOffset) {
        this.#topOffset = newTopOffset;
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
    #image

    constructor(suit, rank, image) {
        this.#suit = suit;
        this.#rank = rank;
        this.#image = `cards/${suit}_${rank}.png`;
    }

    get suit() {return this.#suit;}
    get rank() {return this.#rank;}
    get image() {return this.#image}
}

// Deck class for full decks (not necessarily the standard 52-card deck)

class Deck {
    #name;
    #cardCount;
    #cards;
    #availableCards

    constructor(name, cards) {
        this.#name = name; // name of the deck
        this.#cardCount = cards.length; // number of cards in the deck
        this.#cards = cards; // all cards in the deck (never edited)
        this.#availableCards = [...this.#cards]; // all cards available to draw (gets edited)

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
            currentDeck = deckPlaceholder;

            document.querySelectorAll('.deck-links')
                .forEach((deckButton) => deckButton.classList.remove('active'));

            newButton.classList.add('active');
        })
        document.querySelector('.deck-selection-menu').append(newButton); 
    }

    get name() {return this.#name;}
    get cardCount() {return this.#cardCount;}
    get cards() {return this.#cards;}
    get availableCards() {return this.#availableCards;}

    // Method for drawing a card from the available cards in the deck

    draw() {

        // Simple catch to end the function if the deck is empty

        if (currentDeck.cardCount === 0) {
            if (errorMessageTimeout !== undefined) {
                clearTimeout(errorMessageTimeout);
            }
            const errorMessage = document.querySelector('#error-message');
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
    }

    // Helper method for creating a card image from a random card

    createCardImageHelper(randCard) {
        return Object.assign(document.createElement('img'), {
            src: `${randCard.image}`,
            title: `${capitalize(randCard.rank)} of ${capitalize(randCard.suit)}s`,
            className: 'card-images'
        })
    }

    // Helper method for placing a card image

    placeCardImageHelper(cardImage) {

        let imageLeftOffset = getBoard(currentBoard).leftOffset;
        let imageTopOffset = getBoard(currentBoard).topOffset;

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

        document.querySelector(`#${currentBoard}`)
            .querySelector('.card-display-area').append(cardImage);

        getBoard(currentBoard).setLeftOffset(imageLeftOffset);
        getBoard(currentBoard).setTopOffset(imageTopOffset);
    }

    // Helper method to remove a card from the available cards in the deck

    removeCardHelper(card) {
        const index = this.#availableCards.indexOf(card);
        if (index > -1) {
            this.#availableCards.splice(index, 1);
        }
        this.#cardCount -= 1;

        document.querySelector(`#${this.#name}-button`).textContent = 
            `${this.#name} ${this.#cardCount}`;
    }

    // Method to reset the deck (i.e. make all cards available again)

    resetDeck() {
        this.#availableCards = [...this.#cards];
        this.#cardCount = this.#cards.length;

        document.querySelector(`#${this.#name}-button`).textContent = 
            `${this.#name} ${this.#cardCount}`;
    }
}

// Function for capitalizing

function capitalize(str) {
    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

// Function for clearing the board of cards

function clearBoard() {
    document.querySelector(`#${currentBoard}`)
        .querySelector('.card-display-area').innerHTML = '';
    getBoard(currentBoard).setLeftOffset('0px');
    getBoard(currentBoard).setTopOffset('0px');
}



// Creating placeholder decks for testing new things

const suits = ['spade', 'heart', 'diamond', 'club'];

const ranks = ['ace',2,3,4,5,6,7,8,9,10,'jack','queen','king'];

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

const deck1 = new Deck('standard', deck1Cards);
const deck2 = new Deck('all-hearts', deck2Cards);

// Creating boards

const board1 = new Board('board-1');
const board2 = new Board('board-2');
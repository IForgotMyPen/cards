// Some "global variables" that are useful throughout the project

let errorMessageTimeout; // Error message timeout time
let currentBoard; // The currently selected board
let boards = []; // An array of all boards

// Function for displaying an error message 

function displayErrorMessage(message) {
    if (errorMessageTimeout !== undefined) {
        clearTimeout(errorMessageTimeout);
    }
    const errorMessage = document.querySelector(`#${currentBoard.name}`).querySelector('#error-message');
    errorMessage.textContent = message;

    errorMessageTimeout = setTimeout(() => errorMessage.textContent = '', 3000);
}

// Function for changing the board

function changeBoard(event, newBoardName) {
    currentBoard = getBoard(newBoardName); // using newBoardName because we are calling this in html

    document.querySelectorAll('.board-content')
        .forEach((board) => board.style.display = 'none');

    document.querySelectorAll('.board-links')
        .forEach((boardLink) => boardLink.classList.remove('active'));

    Object.assign(document.querySelector(`#${newBoardName}`).style, {
        display: 'flex',
        width: '50%',
        flexDirection: 'column',
        margin: '0px auto',
        alignItems: 'center',
        gap: '10px'
    })
    event.currentTarget.classList.add('active');
}

class Board {
    #name; // name of the board
    #currentDeck; // the currently selected deck on this board
    #decks; // decks on this board

    constructor (name) {
        this.#name = name;

        this.#currentDeck = {
            cardCount: -1,
            draw() {
                displayErrorMessage('Error: No deck selected.');
            },
            resetDeck() {
                displayErrorMessage('Error: No deck selected.');
            },
        }
        boards.push(this);
    }

    get name() { return this.#name; }
    get currentDeck() { return this.#currentDeck; }
    get decks() { return this.#decks; }

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

    get name() { return this.#name; }
    get cardCount() { return this.#cardCount; }
    get cards() { return this.#cards; }
    get availableCards() { return this.#availableCards; }
    get board() { return this.#board; }

    // Method for drawing a card from the available cards in the deck

    draw() {

        // Simple catch to end the function if the deck is empty

        if (currentBoard.currentDeck.cardCount === 0) {
            displayErrorMessage('Error: Deck empty. Try resetting.');
            return;
        }

        // Get a random card from the available cards in the deck

        function getRandomInt(max) {
            return Math.floor(Math.random() * max);
        }
        const randCard = this.#availableCards[getRandomInt(this.#cardCount)];

        document.querySelector(`#${currentBoard.name}`).querySelector('.card-display-area')
            .append(this.createCardImageHelper(randCard))

        this.removeCardHelper(randCard);

        return randCard;
    }

    // Helper method for creating a card image from a random card

    createCardImageHelper(randCard) {
        return Object.assign(document.createElement('img'), {
            src: `${randCard.image}`,
            title: `${capitalize(randCard.rank)} of ${capitalize(randCard.suit)}s`,
            className: 'card-images',
            id: `${randCard.rank}-of-${randCard.suit}s`,
        })
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
}

// TYPING MINIGAME

let displayedCards = [];
let checkTypingLoop;
let drawLoop;
let timeLoop;
let timeRemaining;

// function for starting the typing minigame
// basically just starts the function loops

function startTypingGame() {
    // checks if a deck has been selected
    // if not, displays and error and does not start the minigame

    if (currentBoard.currentDeck.cardCount === -1) {
        displayErrorMessage('Error: Cannot start game. Try selecting a deck.');
        return;
    }

    document.querySelector('#user-typing-input').value = '';

    checkTypingLoop = setInterval(checkUserTypingInput, 50);
    drawLoop = setInterval(drawFromCurrentDeck, 2000);
    updateTimeRemaining();
    timeLoop = setInterval(updateTimeRemaining, 1000);

    // hides all other buttons so the user cannot switch between boards or decks during the game

    document.querySelectorAll('.board-links').forEach((boardLink) => boardLink.style.display = 'none');
    document.querySelector('#typing-board').querySelectorAll('.deck-links')
        .forEach((deckLink) => deckLink.style.display = 'none');
}

// function for stopping the typing minigame

function stopTypingGame() {
    if (timeRemaining === undefined) {
        displayErrorMessage('Error: No currently running game.');
        return;
    }

    clearInterval(checkTypingLoop);
    clearInterval(drawLoop);
    clearInterval(timeLoop);

    // reset deck, clear board and user input area

    currentBoard.currentDeck.resetDeck();
    clearBoard();
    document.querySelector('#user-typing-input').value = '';

    // reset time remaining, clear html element

    timeRemaining = undefined;
    document.querySelector('#typing-board').querySelector('#time-remaining')
            .innerHTML = '';
    
    // displays the buttons for the boards and decks again
    
    document.querySelectorAll('.board-links').forEach((boardLink) => boardLink.style.display = '');  
    document.querySelector('#typing-board').querySelectorAll('.deck-links')
        .forEach((deckLink) => deckLink.style.display = '');
}

// function for checking if the user input the name of a displayed card
// if user did, it clears that card from the board
// also checks to see if the player has cleared all the cards, in which case they win

function checkUserTypingInput() {
    let userTypingInput = document.querySelector('#user-typing-input').value;
    userTypingInput = userTypingInput.toLowerCase();

    for (const card of displayedCards) {        
        if (card.name === userTypingInput) {
            document.querySelector('#typing-board').querySelector('#user-typing-input').value = '';

            document.querySelector('#typing-board').querySelector(`#${card.rank}-of-${card.suit}s`).style.display = 'none';

            displayedCards = displayedCards.filter(filterCard => filterCard.name !== userTypingInput);

            if (currentBoard.currentDeck.availableCards.length === 0 && displayedCards.length === 0) {
                setTimeout(() => {
                    alert('Congratulations! You cleared all the cards before the time ran out!');
                }, 10);
                stopTypingGame();
            }
            break;
        }
    }
}

// function for drawing another card to the board

function drawFromCurrentDeck() {
    if (currentBoard.currentDeck.availableCards.length !== 0) {
        displayedCards.push(typingBoard.currentDeck.draw());
    }
}

// function for getting the initial remaining time based on the length of the currently selected deck

function getInitialTime() {
    return currentBoard.currentDeck.cardCount * 5;
}

// function for updating the remaining time
// also checks if the remaining time hits zero, and ends the game if so

function updateTimeRemaining() {
    if (timeRemaining === undefined) {
        timeRemaining = getInitialTime();
        document.querySelector('#typing-board').querySelector('#time-remaining')
            .innerHTML = `Time remaining: ${timeRemaining}s`;
    }
    else {
        timeRemaining -= 1;
        document.querySelector('#typing-board').querySelector('#time-remaining')
            .innerHTML = `Time remaining: ${timeRemaining}s`;
    }

    if (timeRemaining === 0) {
        setTimeout(() => {
            alert('Game over! You did not clear all of the cards in time!');
        }, 10);
        stopTypingGame();
    }
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

const zenBoard = new Board('zen-board');
const typingBoard = new Board('typing-board');

const deck1 = new Deck('standard', deck1Cards, zenBoard);
const deck2 = new Deck('all-hearts', deck2Cards, zenBoard);
const deck5 = new Deck('standard', deck1Cards, typingBoard);
const deck6 = new Deck('all-hearts', deck2Cards, typingBoard);

// Some "global variables" that are useful throughout the project

let errorMessageTimeout; // Error message timeout time

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

let imageTopOffset = '0px'; 
let imageLeftOffset = '0px'; // For controlling where the next drawn card will be placed

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

        // Appending a new button to the deck-buttons div to switch the currentDeck variable 
        // to this deck

        const deckPlaceholder = this;

        const newButton = Object.assign(document.createElement('button'), {
            textContent: `${this.#name} ${this.#cardCount}`,
            type: 'button',
            id: `${this.#name}-button`
        })

        newButton.addEventListener('click', () => {
            currentDeck = deckPlaceholder;
            Object.assign(newButton.style, {
                backgroundColor: 'gray',
                color: 'white'
            })

            // Change all other buttons back to default color

            Array.from(document.querySelector('.deck-buttons').children)
                .filter((deckButton) => deckButton !== newButton)
                .forEach((deckButton) => {
                    Object.assign(deckButton.style, {
                        backgroundColor: '',
                        color: ''
                    })
                });
        })
        document.querySelector('.deck-buttons').append(newButton); 
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

        // Set up new card image

        const newCard = Object.assign(document.createElement('img'), {
            src: `${randCard.image}`,
            title: `${capitalize(randCard.rank)} of ${capitalize(randCard.suit)}s`
        })

        // If the cards reach the edge of the screen, move them down a row

        if (Number(imageLeftOffset.split('px')[0]) + 210 > window.innerWidth) {
            imageLeftOffset = '0px';

            const newTopOffset = Number(imageTopOffset.split('px')[0]) + 90;
            imageTopOffset = `${newTopOffset}px`; 
        }

        Object.assign(newCard.style, {
            position: 'absolute',
            top: imageTopOffset,
            left: imageLeftOffset,
            width: '200px'
        })

        // This is my somewhat confusing way of adjusting the offset so each card lays 
        // on top of the last

        const newLeftOffset = Number(imageLeftOffset.split('px')[0]) + 30;
        imageLeftOffset = `${newLeftOffset}px`; 

        document.querySelector('.card-images').append(newCard);

        // Remove card from available cards in deck

        this.removeCard(randCard);
    }

    // Helper method to remove a card from the available cards in the deck

    removeCard(card) {
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
    document.querySelector('.card-images').innerHTML = '';
    imageLeftOffset = '0px';
    imageTopOffset = '0px';
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
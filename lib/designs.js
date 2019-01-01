class Images {
    constructor() {
      this.imagesArray = ["slack", "zendesk", "docker", "intercom", "netflix", "snapchat", "spotify", "twilio", "slack", "zendesk", "docker", "intercom", "netflix", "snapchat", "spotify", "twilio"];
    }
  
    shuffle() {
      // Fisher-Yates Shuffle
      let currentIndex = this.imagesArray.length;
      let temporaryValue;
      let randomIndex;
  
      // While there remain elements to shuffle...
      while (currentIndex !== 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
  
        // And swap it with the current element.
        temporaryValue = this.imagesArray[currentIndex];
        this.imagesArray[currentIndex] = this.imagesArray[randomIndex];
        this.imagesArray[randomIndex] = temporaryValue;
      }
    }
  }
  
  /* eslint class-methods-use-this: ["error", { "exceptMethods": ["resetCards"] }] */
  
  class GameLogic {
    constructor() {
      this.moves = 0;
      this.correctGuess = 0;
      this.stars = 3;
      this.card1 = null;
      this.card2 = null;
      this.secondsElapsed = 0;
      this.timerStarted = false;
      this.intervalID = null;
      this.isFirstCardClicked = false;
    }
  
    updateMovesText() {
      document.querySelector("span#moves").innerHTML = this.moves;
    }
  
    isSameImage(card1, card2) {
      [this.card1, this.card2] = [card1, card2];
      // card1 and card2 are objects, but we need the element
      const card1Element = document.querySelector(`.card.${this.card1.identity}`);
      const card2Element = document.querySelector(`.card.${this.card2.identity}`);
      // get the image element so we can access the src attribute value
      const card1ElementImage = card1Element.querySelector("img");
      const card2ElementImage = card2Element.querySelector("img");
  
      const img1 = card1ElementImage.getAttribute("src");
      const img2 = card2ElementImage.getAttribute("src");
      if (img1 === img2) {
        return true;
      }
      return false;
    }
  
    setTimersHTML() {
      document.querySelector("span#timer").innerHTML = this.secondsElapsed;
    }
  
    setMovesHTML() {
      document.querySelector("span#moves").innerHTML = this.moves;
    }
  
    timer() {
      if (!this.timerStarted) {
        const start = Date.now();
        // check every 10 millisecond, how many seconds has passed
        this.intervalID = setInterval(() => {
          this.setTimersHTML();
          // how many milliseconds has elapsed since start
          const delta = Date.now() - start;
          // convert to seconds
          this.secondsElapsed = Math.floor(delta / 1000);
        }, 10);
        this.timerStarted = true;
      }
    }
  
    // timer is started when the user clicks on a card the first time
    startTimerWhenCardIsClicked() {
      if (!this.isFirstCardClicked) {
        this.timer();
        this.isFirstCardClicked = true;
      }
      // const wrapper = document.querySelector(".wrapper");
      // wrapper.addEventListener("click", () => this.timer(), { once: "true" });
    }
  
    endTimer() {
      clearInterval(this.intervalID);
      this.timerStarted = false;
    }
  
    gameisWon() {
      const starsPlural = this.stars > 1 ? "stars" : "star";
      const message = `You have won the game!\nIt took you ${this.secondsElapsed} seconds, ${this.moves} moves, and ${this.stars} ${starsPlural}\nPlay Again?`;
      // end the timer before the modal pops up
      this.endTimer();
      // const response = window.confirm(message);
      swal({
        title: "Well Done 🎉",
        text: message,
        icon: "success",
        buttons: ["No, I'm good", "Yesss!"]
      }).then(response => {
        if (response) {
          this.restartGame();
        } else {
          swal("Thanks for playing 😊");
        }
      });
    }
  
    resetTimer() {
      this.secondsElapsed = 0;
      this.setTimersHTML();
      this.isFirstCardClicked = false;
      // this.startTimerWhenCardIsClicked();
    }
  
    resetMoves() {
      this.moves = 0;
      this.setMovesHTML();
    }
  
    /* eslint no-param-reassign: ["error", { "props": false }] */
    resetStars() {
      document.querySelectorAll(".star").forEach(star => {
        star.style.visibility = "visible";
      });
      this.stars = 3;
    }
  
    resetCards() {
      document.querySelectorAll(".card").forEach(card => {
        card.style.visibility = "visible";
        card.style.pointerEvents = "auto";
      });
      document.querySelectorAll(".card img").forEach(image => {
        image.style.visibility = "hidden";
      });
    }
  
    restartGame() {
      this.endTimer();
      this.correctGuess = 0;
      this.resetMoves();
      this.resetStars();
      this.resetCards();
      this.resetTimer();
    }
  
    starRating() {
      if (this.moves === 8) {
        const star = document.querySelector("#star3");
        star.style.visibility = "hidden";
        this.stars -= 1;
      } else if (this.moves === 12) {
        const star = document.querySelector("#star2");
        star.style.visibility = "hidden";
        this.stars -= 1;
      }
    }
  }
  
  class AllCards extends GameLogic {
    constructor() {
      super();
      this.allCards = [];
      this.openedCards = [];
    }
  
    add(card) {
      this.allCards.push(card);
    }
  
    reset() {
      const resetButton = document.querySelector("#restart");
      resetButton.addEventListener("click", () => this.restartGame());
    }
  
    closeTwoCards() {
      this.openedCards[0].hide();
      this.openedCards[1].hide();
      this.openedCards = [];
    }
  
    checkCorrectGuess() {
      for (let i = 0; i < this.allCards.length; i += 1) {
        if (this.allCards[i].isOpen) {
          if (this.allCards[i] !== this.openedCards[0]) {
            this.openedCards.push(this.allCards[i]);
          }
        }
      }
      if (this.openedCards.length === 2) {
        if (this.isSameImage(this.openedCards[0], this.openedCards[1])) {
          // a correct guess
          this.correctGuess += 1;
          this.moves += 1;
          this.updateMovesText();
          // check star rating after a move
          this.starRating();
          // leave the cards physically open(isOpen is set to false because we
          // don't want to interact with the cards in the future when looking
          // for cards that are open)
          this.openedCards[0].isOpen = false;
          this.openedCards[1].isOpen = false;
          this.openedCards = [];
          if (this.correctGuess === this.allCards.length / 2) {
            // game is won
            this.gameisWon();
          }
        } else {
          this.moves += 1;
          this.updateMovesText();
          // check star rating after a move
          this.starRating();
          // close the cards
          setTimeout(() => this.closeTwoCards(), 500);
        }
      }
    }
  
    returnAllCards() {
      return this.allCards;
    }
  }
  
  const images = new Images();
  images.shuffle();
  let card;
  const cardDeck = new AllCards();
  
  document.addEventListener("DOMContentLoaded", () => cardDeck.reset());
  
  class Card {
    constructor(identity, aClone) {
      this.identity = identity;
      this.aClone = aClone;
      this.isOpen = false;
    }
  
    addClickListener() {
      const myCard = this.getCardElement();
      // make sure 'this' is the card object, so we can access the isOpen property
      myCard.addEventListener("click", event => this.hideOrShow(event));
    }
  
    getCardElement() {
      return document.querySelector(`.card.${this.identity}`);
    }
  
    /** add a div, with an img as a child, into the DOM */
    setImage() {
      const myImage = document.createElement("img");
      if (this.aClone) {
        myImage.src = `img/${this.identity.slice(0, -5)}.svg`;
      } else {
        myImage.src = `img/${this.identity}.svg`;
      }
  
      // create the div for the img tag
      const cardDiv = document.createElement("div");
      cardDiv.classList.add("card", this.identity);
      document.querySelector(".wrapper").appendChild(cardDiv);
  
      cardDiv.appendChild(myImage);
    }
  
    show() {
      cardDeck.startTimerWhenCardIsClicked();
      const cardDiv = this.getCardElement();
      cardDiv.style.visibility = "hidden";
      const img = document.querySelector(`.card.${this.identity} img`);
      img.style.visibility = "visible";
      this.isOpen = true;
      // make sure user can't click on an already opened card to close it.
      // cards would only be closed after a wrong or right match
      this.disableClick();
    }
  
    hide() {
      const cardDiv = this.getCardElement();
      cardDiv.style.visibility = "visible";
      const img = document.querySelector(`.card.${this.identity} img`);
      img.style.visibility = "hidden";
      this.isOpen = false;
      this.enableClick();
    }
  
    hideOrShow(e) {
      // only respond to click on the card DIV itself
      if (e.target.nodeName !== "UL") {
        if (this.isOpen) {
          this.hide();
        } else if (cardDeck.openedCards.length < 2) {
          this.show();
          // If two cards are opened, check if its a correct guess
          cardDeck.checkCorrectGuess();
        }
      }
    }
  
    disableClick() {
      this.getCardElement().style.pointerEvents = "none";
    }
  
    enableClick() {
      this.getCardElement().style.pointerEvents = "auto";
    }
  }
  
  const alreadyExistingCards = [];
  let cardExists = false;
  // loop through the 16 card names, and create a card accordingly
  for (let i = 0; i < 16; i += 1) {
    // Check if we are dealing with a card name that's already been used.
    // Trying to make sure we don't have the same class names for two cards
    // with the same image
    for (let j = 0; j < alreadyExistingCards.length; j += 1) {
      if (images.imagesArray[i] === alreadyExistingCards[j]) {
        cardExists = true;
      }
    }
    // change the card's identity(class name) depending on whether
    // a card with the same name is already existing
    if (cardExists) {
      const identity = `${images.imagesArray[i]}clone`;
      card = new Card(identity, true);
      card.setImage();
      card.addClickListener();
      cardDeck.add(card);
      cardExists = false;
    } else {
      const identity = images.imagesArray[i];
      card = new Card(identity, false);
      card.setImage();
      card.addClickListener();
      cardDeck.add(card);
      alreadyExistingCards.push(images.imagesArray[i]);
    }
  }
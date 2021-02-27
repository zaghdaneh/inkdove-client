/**
 * Called hints bar but actually also contains round, timer, word category AND word hint
 */

function Hintsbar() {
    //selectors
    this.$container = $('#word-hints-container');
    this.$roundDisplay = $('#round-display');
    this.$wordTypeDisplay = $('#wordtype-display');
    this.$timerDisplay = $('#time-display');
    this.$hintDisplay = $('#wordHint-display');
    //data
    this.turntime = 10;
    this.round = 1;
    this.timerInterval = null;

    //observers
    socket.addObserver(constant_data.MSG_TYPES.JOIN_ROOM, (...args) => this.joinRoomCb.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.END_TURN, (data) => this.endTurn.call(this, data.word, null)); //todo not clear just disabled input
    socket.addObserver(constant_data.MSG_TYPES.NEW_DRAWER, (...args) => this.displayDrawer.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.NEW_ROUND, (...args) => this.newRound.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.START_GAME, (...args) => this.startGame.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.START_DRAW, (...args) => this.turnStart.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.START_DRAW_D, (...args) => this.turnStart.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.GUESS, (...args) => this.guessCb.call(this, ...args));
}


Hintsbar.prototype.joinRoomCb = function (roomData, playerData, ingamedata) {
    if (!ingamedata)
        return;
    this.turntime = roomData.drawtime;
    this.round = roomData.ing_round;
    this.$roundDisplay.html(roomData.ing_round);
    this.$wordTypeDisplay.html(ingamedata.wordtype);
    this.setTimer(Math.floor(ingamedata.timer));

    // we adapt the display depending on the room state
    switch(ingamedata.state){
        case roomStates.PICKING_WORD:
            this.displayDrawer({username: playerData[ingamedata.ing_drawer].username});
            break;
        case roomStates.DRAWING:
            this.$hintDisplay.html(ingamedata.ing_word);
            break;
        case roomStates.ENDING_TURN:
            this.endTurn(ingamedata.ing_word);
    }
}

Hintsbar.prototype.startGame = function () {
    this.round = 0;
    this.turntime = room.mainData.drawtime;
}
Hintsbar.prototype.guessCb = function (data) {
    if (data.result) {
        this.$hintDisplay.html(data.word); // show word
        this.$container.addClass('guessed-r'); //TOD
    }

}
Hintsbar.prototype.setTimer = function (t) {
    var time = t;
    
    if (this.timerInterval){
        clearInterval(this.timerInterval);
    }
    this.$timerDisplay.html(time);
    this.timerInterval = setInterval(
        (function (self) {
            time = time - 1;
            self.$timerDisplay.html(time);
            if (time <= 0) {
                clearInterval(self.timerInterval);
            }
        }), 1000, this);
}

Hintsbar.prototype.newRound = function () {
    this.round++;
    this.$roundDisplay.html(this.round);
}

Hintsbar.prototype.displayDrawer = function (data) {
    this.$hintDisplay.html(data.username + ' is choosing a word !');
}
Hintsbar.prototype.turnStart = function (data) {
    this.$container.removeClass('guessed-r');
    this.$hintDisplay.html(data.name); // setup word
    this.$timerDisplay.html(this.turntime);
    this.$wordTypeDisplay.html(data.wordtype);

    this.setTimer(this.turntime);
}

Hintsbar.prototype.endTurn = function (word, timer = null) {
    this.$hintDisplay.html(word);

    var countdown = (timer) ? timer:constant_data.END_TURN_TIME;
    this.setTimer(countdown); //sets countdown until next turn
}

var hintsbar = new Hintsbar();
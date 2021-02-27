function GuessWord() {
    //selectors
    this.$input = $('#guess-text');

    //data
    this.autocomplete = new AutoComplete(this.$input);
    //listeners
    this.$input.keyup((e) => {
        if (e.keyCode == 13) {	
            this.sendGuess(this.$input.val());
        }
    });
    //observers //TODO : if palyer reconnects when drawer is choosing a word???
    socket.addObserver(constant_data.MSG_TYPES.GUESS, (...args) => this.guessCb.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.JOIN_ROOM, (...args) => this.enable.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.END_TURN, (...args) => this.disable.call(this, ...args)); //todo not clear just disabled input
    socket.addObserver(constant_data.MSG_TYPES.START_DRAW, (...args) => this.enable.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.START_DRAW_D, (...args) => this.disable.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.SPAM_ALERT, () => this.enable.call(this));
}


GuessWord.prototype.sendGuess = function(guess){
    if (guess.length <= 0){
        return;
    }
    this.disable();
    socket.emit(constant_data.MSG_TYPES.GUESS, false, guess);
    this.clear();
}

GuessWord.prototype.guessCb = function(data){
    if (!(data.result)) { // guess is wrong TODO: show invalid input
        shake(this.$input);
        this.enable();
        this.$input.focus();
    } else {
        this.disable();
    }
}
GuessWord.prototype.clear = function(){
    this.$input.val('');
}

GuessWord.prototype.disable = function(){
    this.$input.prop('disabled', true);
}

GuessWord.prototype.enable = function(){
    this.$input.prop('disabled', false);
}
var guessWord = new GuessWord();
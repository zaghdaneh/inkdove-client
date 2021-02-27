'use strict'
function SoundHandler(){
    this.$volume = $('#volume');
    this.volume = 0;

    this.correctSound = new Audio('https://cdn.inkdove.com/sound/correct.mp3');
    this.DrawingSound = new Audio('https://cdn.inkdove.com/sound/drawing.wav');

    socket.addObserver(constant_data.MSG_TYPES.GUESS, (...args) => this.guessCb.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.P_GUESSED_T, (...args) => this.otherGuesserCb.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.START_DRAW, (...args) => this.playStartDrawingSound.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.START_DRAW_D, (...args) => this.playStartDrawingSound.call(this, ...args));
    
}


SoundHandler.prototype.guessCb = function(data){
    if (data.result){
        this.playGuessedSound();
    }
}

SoundHandler.prototype.otherGuesserCb = function(player){
    if (player.accountid === userData.accountid)
        return;

    this.playGuessedSound();
}

SoundHandler.prototype.playGuessedSound = function(){
    this.correctSound.volume = this.$volume.val() / 100.0;
    this.correctSound.play();
}

SoundHandler.prototype.playStartDrawingSound = function () {
    this.DrawingSound.volume = this.$volume.val() / 100.0;
    this.DrawingSound.play();
}

var soundHandler = new SoundHandler();
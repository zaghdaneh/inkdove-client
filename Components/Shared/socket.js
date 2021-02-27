function Socket() {
    this.socket = undefined;
    this.observers = {};

    this.spamCheckFunctions = [constant_data.MSG_TYPES.BROWSER_UPDATE, constant_data.MSG_TYPES.MESSAGE, constant_data.MSG_TYPES.GUESS]; // anti-spam will check these socket emits
    this.antiSpam = 3000; 
    this.antiSpamRemove = 5; 
    this.maxSpam = 7; 
    this.spamScore = 0;

    setInterval(this.spamCountdown.bind(this), this.antiSpam);
}

Socket.prototype.setup = function () {
    this.socket = io();

    //basic
    this.socket.on(constant_data.MSG_TYPES.ERROR, (...args) => (this.alertObservers(constant_data.MSG_TYPES.ERROR, true, ...args))); //Error received
    this.socket.on(constant_data.MSG_TYPES.USER_DATA, (...args) => (this.alertObservers(constant_data.MSG_TYPES.USER_DATA, false, ...args))); //Gets user data 
    this.socket.on(constant_data.MSG_TYPES.ALREADY_LOGGED, (...args) => (this.alertObservers(constant_data.MSG_TYPES.ALREADY_LOGGED, false, ...args))); //Already logged, force other to dc 
    this.socket.on(constant_data.MSG_TYPES.RECONNECT_ROOM, (...args) => (this.alertObservers(constant_data.MSG_TYPES.RECONNECT_ROOM, false, ...args))); //Reconnect to room?
    //settings
    this.socket.on(constant_data.MSG_TYPES.UPDATE_ANIME_LIST, (...args) => (this.alertObservers(constant_data.MSG_TYPES.UPDATE_ANIME_LIST, false, ...args))); //update animelist
    //room browser
    this.socket.on(constant_data.MSG_TYPES.BROWSER_UPDATE, (...args) => (this.alertObservers(constant_data.MSG_TYPES.BROWSER_UPDATE, true, ...args))); //refresh rooms
    //in lobby
    this.socket.on(constant_data.MSG_TYPES.GET_ANIME_NAMES, (...args) => (this.alertObservers(constant_data.MSG_TYPES.GET_ANIME_NAMES, false, ...args))); // get all animes for autocomplete
    this.socket.on(constant_data.MSG_TYPES.CREATE_ROOM, (...args) => (this.alertObservers(constant_data.MSG_TYPES.CREATE_ROOM, true, ...args))); // create room
    this.socket.on(constant_data.MSG_TYPES.JOIN_ROOM, (...args) => (this.alertObservers(constant_data.MSG_TYPES.JOIN_ROOM, true, ...args))); //join room
    this.socket.on(constant_data.MSG_TYPES.MESSAGE, (...args) => (this.alertObservers(constant_data.MSG_TYPES.MESSAGE, false, ...args))); // room message
    this.socket.on(constant_data.MSG_TYPES.ADD_PLAYER, (...args) => (this.alertObservers(constant_data.MSG_TYPES.ADD_PLAYER, false, ...args))); // addplayer to room 
    this.socket.on(constant_data.MSG_TYPES.REMOVE_PLAYER, (...args) => (this.alertObservers(constant_data.MSG_TYPES.REMOVE_PLAYER, false, ...args))); // remove player from room 
    this.socket.on(constant_data.MSG_TYPES.REMOVE_PLAYERS, (...args) => (this.alertObservers(constant_data.MSG_TYPES.REMOVE_PLAYERS, false, ...args))); //when back to lobby, all dc users are automatically removed
    this.socket.on(constant_data.MSG_TYPES.LEAVE_ROOM, (...args) => (this.alertObservers(constant_data.MSG_TYPES.LEAVE_ROOM, true, ...args))); // Leave room
    this.socket.on(constant_data.MSG_TYPES.UPDATE_ROOM, (...args) => (this.alertObservers(constant_data.MSG_TYPES.UPDATE_ROOM, true, ...args))); // Update room settings
    this.socket.on(constant_data.MSG_TYPES.START_GAME, (...args) => (this.alertObservers(constant_data.MSG_TYPES.START_GAME, true, ...args))); // Start game
    this.socket.on(constant_data.MSG_TYPES.NEW_OWNER, (...args) => (this.alertObservers(constant_data.MSG_TYPES.NEW_OWNER, false, ...args))); // new owner

    //ingame
    this.socket.on(constant_data.MSG_TYPES.NEW_ROUND, (...args) => (this.alertObservers(constant_data.MSG_TYPES.NEW_ROUND, false, ...args))); // Player is drawing and starts drawing
    this.socket.on(constant_data.MSG_TYPES.NEW_DRAWER, (...args) => (this.alertObservers(constant_data.MSG_TYPES.NEW_DRAWER, false, ...args))); // Player is drawing and starts drawing
    this.socket.on(constant_data.MSG_TYPES.WORDS_CHOICE, (...args) => (this.alertObservers(constant_data.MSG_TYPES.WORDS_CHOICE, false, ...args))); // Player is drawing and starts drawing
    this.socket.on(constant_data.MSG_TYPES.START_DRAW_D, (...args) => (this.alertObservers(constant_data.MSG_TYPES.START_DRAW_D, false, ...args))); // Player is drawing and starts drawing
    this.socket.on(constant_data.MSG_TYPES.START_DRAW, (...args) => (this.alertObservers(constant_data.MSG_TYPES.START_DRAW, false, ...args))); // Player is not the drawer and starts drawing
    this.socket.on(constant_data.MSG_TYPES.DRAW, (...args) => (this.alertObservers(constant_data.MSG_TYPES.DRAW, false, ...args))); // Update room settings
    this.socket.on(constant_data.MSG_TYPES.DRAW_CLEAR, (...args) => (this.alertObservers(constant_data.MSG_TYPES.DRAW_CLEAR, false, ...args))); // Update room settings  
    this.socket.on(constant_data.MSG_TYPES.GUESS, (...args) => (this.alertObservers(constant_data.MSG_TYPES.GUESS, false, ...args))); // Feedback on guess
    this.socket.on(constant_data.MSG_TYPES.P_GUESSED_T, (...args) => (this.alertObservers(constant_data.MSG_TYPES.P_GUESSED_T, false, ...args))); // Other player guessed correct
    this.socket.on(constant_data.MSG_TYPES.END_TURN, (...args) => (this.alertObservers(constant_data.MSG_TYPES.END_TURN, false, ...args))); // end turn (not game)
    this.socket.on(constant_data.MSG_TYPES.PLAYER_DISCONNECTED, (...args) => (this.alertObservers(constant_data.MSG_TYPES.PLAYER_DISCONNECTED, false, ...args))); // end turn (not game)
    this.socket.on(constant_data.MSG_TYPES.PLAYER_RECONNECTED, (...args) => (this.alertObservers(constant_data.MSG_TYPES.PLAYER_RECONNECTED, false, ...args))); // end turn (not game)
    this.socket.on(constant_data.MSG_TYPES.END_GAME, (...args) => (this.alertObservers(constant_data.MSG_TYPES.END_GAME, false, ...args))); // end game (show scores)
    this.socket.on(constant_data.MSG_TYPES.BACK_TO_LOBBY, (...args) => (this.alertObservers(constant_data.MSG_TYPES.BACK_TO_LOBBY, false, ...args))); // end game (show scores)
    this.socket.on(constant_data.MSG_TYPES.BACK_TO_LOBBY_VOTE, (...args) => (this.alertObservers(constant_data.MSG_TYPES.BACK_TO_LOBBY_VOTE, false, ...args))); // Show voting to end game
    this.socket.on(constant_data.MSG_TYPES.END_BTL_VOTE, (...args) => (this.alertObservers(constant_data.MSG_TYPES.END_BTL_VOTE, false, ...args))); // Shows results to vote




}

//emits a socket event, if block all puts on the loading screen
Socket.prototype.emit = function (event, blockAll, ...args) {
    if (blockAll) {
        loadingScreen.enable();
    }

    if (this.checkSpam(event)){ //block emit if spamming
        return this.alertObservers(constant_data.MSG_TYPES.SPAM_ALERT, false);
    }
    this.socket.emit(event, ...args);
}

Socket.prototype.addObserver = function (event, callback) {
    if (!this.observers[event]) {
        this.observers[event] = [];
    }

    this.observers[event].push(callback);
}

//executes all callbacks, if the emit has enabled loading screen we disable
Socket.prototype.alertObservers = function (event, unblockAll, ...args) {
    let eventListeners = this.observers[event];
    if (!eventListeners) {
        return;
    }

    for (var i = 0; i < eventListeners.length; i++) {
        eventListeners[i](...args);
    }

    if (unblockAll) {
        loadingScreen.disable();
    }

}

Socket.prototype.checkSpam = function (event) {
    if (this.spamCheckFunctions.indexOf(event) !== -1){
        if (this.spamScore >= this.maxSpam){
            return true;
        }
        this.addSpam();
    }
    return false;
}


Socket.prototype.addSpam = function(){
    this.spamScore += 1;
}

Socket.prototype.spamCountdown = function(){
    if (this.spamScore > 0){
        this.spamScore -= this.antiSpamRemove;
        if (this.spamScore < 0) this.spamScore = 0;
    }
}
var socket = new Socket();
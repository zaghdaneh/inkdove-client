'use strict'
/**
 * Handles the topbar inside the lobby and ingame view as stuff can be displayed/not displayed depending on if the player is the owner or not
 */
function TopBar() {
    //selectors
    this.$lobby = $('#tb-l');
    this.$ingame = $('#tb-ig');
    this.$ownerBtns = $('.ownerButtons');
    this.$startBtn = $('#startgame-but');
    this.$leaveRoomBtn = $('#leave-room-but');
    this.$backToLobbyBtn = $('#endgame_but')
    this.canClick = true;
    //btns
    this.$startBtn.click((e) => this.startGame.call(this));
    this.$leaveRoomBtn.click( (e) => {sceneTransitioner.goToRoomBrowser.call(sceneTransitioner); socket.emit(constant_data.MSG_TYPES.LEAVE_ROOM, true);});
    this.$backToLobbyBtn.click((e) => this.sendBackToLobby())
    //observers
    socket.addObserver(constant_data.MSG_TYPES.CREATE_ROOM, (...args) => this.createGamecb.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.JOIN_ROOM, (...args) => this.joinRoomcb.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.REMOVE_PLAYER, (data) => this.newOwnerCb.call(this, data.owner));
    socket.addObserver(constant_data.MSG_TYPES.NEW_OWNER, (...args) => this.newOwnerCb.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.START_GAME, (...args) => this.goIngame.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.END_GAME,() => {this.canClick = false;}) ; // end game (show scores)
    socket.addObserver(constant_data.MSG_TYPES.BACK_TO_LOBBY, () => this.goToLobby.call(this)); // end game (show scores)
}

TopBar.prototype.createGamecb = function () {
    this.goToLobby();
    this.enableOwner();
}
TopBar.prototype.joinRoomcb = function (roomData) {
    this.disableOwner();
    if (roomData.ingame){
        this.goIngame();
    } else {
        this.goToLobby();
    }
}

TopBar.prototype.startGame = function(){
    if (room.ownerIsPlayer()){
        socket.emit(constant_data.MSG_TYPES.START_GAME, true);
    }
}
TopBar.prototype.newOwnerCb = function (owner) {
    if (owner === null)
        return;

    if (userData.isPlayer(owner)) {
        this.enableOwner();
    } else {
        this.disableOwner();
    }
}
TopBar.prototype.enableOwner = function () {
    this.$ownerBtns.show();
}

TopBar.prototype.disableOwner = function () {
    this.$ownerBtns.hide();
}

TopBar.prototype.goToLobby = function () {
    this.canClick = true;
    this.$ingame.hide();
    this.$lobby.show();
}

TopBar.prototype.goIngame = function () {
    this.$lobby.hide();
    this.$ingame.show();
}

TopBar.prototype.sendBackToLobby = function(){
    if (!room.ownerIsPlayer)
        return;
    
    socket.emit(constant_data.MSG_TYPES.BACK_TO_LOBBY, false);
    this.$backToLobbyBtn.prop('disabled', true);
}

var topBar = new TopBar();
'use strict'
/**
 * Handles the lobby which is how to display players in the lobby
 */
function Lobby() {
    //selecotrs
    this.$container = $('#container-players');
    this.ownerActionClass = 'ownerOnly'; //kicking and making someone an owner (only clickable by user)

    //btns
    this.$container.on("click", ".lkickbtn", (event) =>  { //kick player
        this.kickPlayer($(event.target).val());
    });
    this.$container.on("click", ".lgiveownbtn", (event) => { //give ownership ()
        this.makeOwner($(event.target).val());
    });
    //containers
    socket.addObserver(constant_data.MSG_TYPES.CREATE_ROOM, (...args) =>this.createRoomCb.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.JOIN_ROOM, (...args) => this.joinRoomCb.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.ADD_PLAYER, (...args) =>this.addPlayerCb.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.REMOVE_PLAYER, (...args) =>this.removePlayer.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.REMOVE_PLAYERS, (...args) =>this.removeMultiplePlayers.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.NEW_OWNER, (...args) =>this.setOwner.call(this, ...args));

    //error listeners
    errorHandler.addObserver(constant_data.MSG_TYPES.NEW_OWNER, () => this.enableOwnerBtns.call(this));
}

//adds only the player to the lobby
Lobby.prototype.createRoomCb = function (roomData) {
    this.$container.empty();
    this.addPlayer(userData.description(), roomData);
    this.enableOwnerBtns();
}

//add all players to the lobby
Lobby.prototype.joinRoomCb = function (roomData, playerData) {
    this.$container.empty();
    for (const [pId, pData] of Object.entries(playerData)) {
        this.addPlayer(pData, roomData);
    }
}

Lobby.prototype.addPlayerCb = function (playerData) {
    this.addPlayer(playerData, room.mainData);
}

Lobby.prototype.removePlayer = function (data) {
    var accountid = data.accountid;
    var newOwner = data.owner;
    this.$container.find('#lb-' + accountid).remove();

    if (newOwner !== null) {
        this.setOwner(newOwner);
    }
}

Lobby.prototype.setOwner = function (newOwner) {
    this.$container.find('.owner').remove();
    this.$container.find('#lb-' + newOwner).append($('<div></div>').addClass('owner-text owner').html('Owner'));

    if (userData.isPlayer(newOwner)) {
        this.enableOwnerBtns();
    } else {
        this.disableOwnerBtns();
    }
}

Lobby.prototype.removeMultiplePlayers = function(data) {
    for (var i=0; i<data.length; i++){
        this.removePlayer(data[i]);
    }
}

Lobby.prototype.enableOwnerBtns = function () {
    this.$container.find('.' + this.ownerActionClass).prop("disabled", false);
}

Lobby.prototype.disableOwnerBtns = function () {
    this.$container.find('.' + this.ownerActionClass).prop("disabled", true);
}

Lobby.prototype.addPlayer = function (playerData, roomData) {
    var elemID = "lb-" + playerData.accountid;

    var $playerinLobby = $('<div></div>').addClass('player-info-lobby').attr('id', elemID);

    var $imageDisplay = $('<img class="player-avatar rounded-circle" src="https://cdn.inkdove.com/images/face.png" alt="Italian Trulli">');

    var isPlayerUser = (playerData.accountid === userData.accountid)
    var usernameTxt = '';
    //IF user is player we won't put dropdown
    if (isPlayerUser) {
        usernameTxt = '<div></div>';
    } else {
        usernameTxt = '<div data-toggle="dropdown"></div>';
    }
    // ROOM DROPDOWN
    var $roomDpd = $('<div></div>').addClass('room-dropdown');

    var $nameDisplay = $(usernameTxt).addClass('username-room').html(playerData.username);
    $roomDpd.append($nameDisplay);
    if (!isPlayerUser) {
        var $dropdown = $('<div style="background-color: inherit;"></div>').addClass('dropdown-menu');
        var $btn1 = $('<button></button>').addClass('dropdown-item ownerOnly lkickbtn').val(playerData.accountid).html('Kick Player');
        var $btn2 = $('<button></button>').addClass('dropdown-item ownerOnly lgiveownbtn').val(playerData.accountid).html('Give ownership');

        if (!room.ownerIsPlayer()) {
            $btn1.prop("disabled", true);
            $btn2.prop("disabled", true);
        }
        $dropdown.append($btn1);
        $dropdown.append($btn2);

        $roomDpd.append($dropdown);
    }

    //append all
    $playerinLobby.append($imageDisplay).append($roomDpd);
    if (roomData.owner === playerData.accountid) {
        $playerinLobby.append($('<div></div>').addClass('owner-text owner').html('Owner'));
    }
    this.$container.append($playerinLobby);
}
/* Create game observed by: lobby (to add players in lobby container) / roomSettings (to unload settings) / SceneTransitioner (To transition to needed room)
*/
Lobby.prototype.transitionToGame = function ($playerLobbyContainer, $scoreContainer, disOpsBool) {
    //disable input incase player is not the owner (so he doesn't change shit)
    SetDisabledInput(disOpsBool);
    if (!disOpsBool) {
        showOwnerButtons();
    } else {
        hideOwnerButtons();
    }


    //Move to new venu
    if (roomData.ingame) {
        GoToIngame();
    } else {
        GoToLobby();
    }

}

Lobby.prototype.kickPlayer = function (accountid) {
    if (!(room.ownerIsPlayer()))
        return;
    
    socket.emit(constant_data.MSG_TYPES.REMOVE_PLAYER, false, accountid);
}

//owner command: makes another player owner
Lobby.prototype.makeOwner = function (accountid) {
    if (!(room.ownerIsPlayer()))
        return;
    
    socket.emit(constant_data.MSG_TYPES.NEW_OWNER, false, accountid);
    this.disableOwnerBtns();
}

var lobby = new Lobby();

/*/*
    <div class="player-info-lobby">
         <div class="owner-text">Owner</div>
          <img class="player-avatar rounded-circle" src="https://cdn.inkdove.com/images/face.png" alt="Italian Trulli">
            <div class="room-dropdown">
                <div data-toggle="dropdown" class="username-room">haha</div>
                <div class="dropdown-menu" style="background-color: inherit;">
                    <button class="dropdown-item ownerOnly">Make owner</button>
                    <button class="dropdown-item ownerOnly">Kick Player</button>
                </div>
            </div>
         </div>
    */
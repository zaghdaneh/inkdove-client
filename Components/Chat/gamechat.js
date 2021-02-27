'use strict'
function GameChat() {
    //selectors
    this.$container = $('#messageCont');
    this.$input = $('#message-inp'); //message input
    //classes for generated stuff
    this.messageClass = 'message';
    this.systemMsgClass = 'system-message';
    this.errorMsgClass = 'error-message';
    this.msgColorClass = 'darkText';
    this.messageID = 0;


    //input
    this.$input.keyup((e) => {
        if (e.keyCode == 13) {
            this.sendMessage();
        }
    });

    //socket observers
    
    socket.addObserver(constant_data.MSG_TYPES.CREATE_ROOM, () => this.init.call(this, [userData.description()]));
    socket.addObserver(constant_data.MSG_TYPES.SPAM_ALERT, () => this.addErrorMessage.call(this, 'Spam detected ! Message/guess was not sent'));
    socket.addObserver(constant_data.MSG_TYPES.JOIN_ROOM, () => this.init.call(this));
    socket.addObserver(constant_data.MSG_TYPES.MESSAGE, (...args) => this.addMessage.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.REMOVE_PLAYERS, () => this.addSystemMessage.call(this, 'All disconnected users have been removed'));
    socket.addObserver(constant_data.MSG_TYPES.PLAYER_DISCONNECTED, (accId) => this.addSystemMessage.call(this, 'Disconnected', accId));
    socket.addObserver(constant_data.MSG_TYPES.PLAYER_RECONNECTED, (accId) => this.addSystemMessage.call(this, 'Reconnected', accId));
    socket.addObserver(constant_data.MSG_TYPES.NEW_ROUND, () => this.addSystemMessage.call(this, 'New round!'));
    socket.addObserver(constant_data.MSG_TYPES.NEW_OWNER, (owner) => this.addSystemMessage.call(this, 'is the new Owner', owner));
    //socket.addObserver(constant_data.MSG_TYPES.P_GUESSED_T, (data) => this.addSystemMessage.call(this, 'has guessed the word !', data.accountid));
    socket.addObserver(constant_data.MSG_TYPES.UPDATE_ROOM, (...args) => this.displaySettingsChange.call(this, ...args));
    //socket.addObserver(constant_data.MSG_TYPES.END_TURN, (data) => this.addSystemMessage.call(this, 'The word was : ' + data.word));
    socket.addObserver(constant_data.MSG_TYPES.END_GAME, (reason = null) => this.addSystemMessage.call(this, 'Game has ended ! Going back to lobby' + (reason ? ('<br> Reason : ' + reason) : '')));
    socket.addObserver(constant_data.MSG_TYPES.BACK_TO_LOBBY_VOTE, () => this.addSystemMessage.call(this, 'Room owner started vote to go back to lobby'));
    socket.addObserver(constant_data.MSG_TYPES.END_BTL_VOTE, (result) => this.addSystemMessage.call(this, (result) ? 'The game will go back to lobby after next turn' : 'Vote failed, game will continue'));
    //room change observer
    room.addObserver(constant_data.MSG_TYPES.ADD_PLAYER, (accountid) => this.addSystemMessage.call(this, 'Joined the room', accountid));
    room.addObserver(constant_data.MSG_TYPES.REMOVE_PLAYER, (...args) => this.removePlayer.call(this, ...args));
}

GameChat.prototype.init = function () {
    this.$container.empty();
}

GameChat.prototype.displaySettingsChange = function (data) {
    var message = 'Updated Room Settings:<br>';
    for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
            message += (SettingToText[key]) + ' &#8594; ';
            for (var i = 0; i < value.length; i++) {
                if (i !== 0) {
                    message += ', '
                }
                message += '' + arrayVals[key][value[i]];
            }
            message += '<br>';
        } else {
            message += (SettingToText[key]) + ' &#8594; ' + value + '<br>';
        }

    }
    //we append the message
    var $sel = $('<p class="system-message">' + message + '<p>');
    this.$container.append($sel)
}
//data contains the message explaing reason of leaving
GameChat.prototype.removePlayer = function (data) {
    this.addSystemMessage.call(this, data.m, data.accountid);
    if (data.owner !== null) {
        this.addSystemMessage.call(this, 'is the new owner', data.owner);
    }
    delete room.players[data.accountid];
}

GameChat.prototype.addMessage = function (data) {
    var message = data.m;
    var accountid = data.accountid;

    //find the username
    var username = room.players[accountid];
    if (username === undefined) {
        return console.log('received message but userid was not defined')
    }
    //<p class="message darkText">Nom : oui</p>
    var $message = $('<p></p>').addClass(this.messageClass);
    if (this.messageID == 1) {
        $message.addClass(this.msgColorClass);
    }

    $message.html(username + ': ' + message);
    this.messageID = (this.messageID + 1) % 2;
    this.$container.append($message);
    this.scrollDown();
}

GameChat.prototype.sendMessage = function () {
    var message = this.$input.val();
    if (message.length <= 0 || message.length > constant_data.MAX_MESSAGE_LENGTH) {
        if (message.length > 1) { this.addSystemMessage.call(this, "your message is too long and can't be sent") };
        return;
    }
    this.clearInput();
    socket.emit(constant_data.MSG_TYPES.MESSAGE, false, message);

}

GameChat.prototype.clearInput = function () {
    this.$input.val('');
}

GameChat.prototype.addSystemMessage = function (message, accountid) {
    if (accountid) {
        message = room.players[accountid] + ' ' + message;
    }
    var $message = $('<p></p>').addClass(this.systemMsgClass).html(message);

    this.$container.append($message);
    this.scrollDown();
}

GameChat.prototype.addErrorMessage = function (message) {
    var $message = $('<p></p>').addClass(this.errorMsgClass).html(message);
    this.$container.append($message);
    this.scrollDown();
}

//automatically scrolls to the bottom
GameChat.prototype.scrollDown = function () {
    this.$container.scrollTop(this.$container[0].scrollHeight);
}

const SettingToText = {
    name: 'Room name',
    //game data
    locked: 'Room locked',
    password: 'Password',
    owner: 'Room owner', //playerID
    show_wortype: 'Show word type',
    lang: 'Language',
    rounds: 'Total rounds',
    drawtime: 'Draw time',
    showhint: 'Show hint',
    showguess: 'Show wrong guesses',
    showwordtype: 'Show word type',
    max_players: 'Max players',
    //dictonary
    di_enabled: 'Use Dictionary',
    di_type: 'Dictionary: Word types',
    //anime
    an_enabled: 'Use Anime',
    an_shared: 'Anime: Only shared',
    an_sequels: 'Anime: allow sequels',
    an_format: 'Anime: Format',
    an_genre: 'Anime: Banned Genres',
    an_froms: 'Anime: from season',
    an_fromy: 'Anime: from year',
    an_tos: 'Anime: to season',
    an_toy: 'Anime: to year',
    //lol
    lol_enabled: 'Use League of legends',
    lol_type: 'LOL: word types',
    //hs
    hs_enabled: 'Use Hearthstone',
    hs_type: 'HS: Card type',
    hs_rarity: 'HS: Card rarity',
    hs_set: 'HS: Card sets',

}


//for options that are in arrays and mapped to integers, here they are for the display
const arrayVals = {
    an_genre: {
        0: "Action",
        1: "Adventure",
        2: "Comedy",
        3: "Drama",
        4: "Ecchi",
        5: "Fantasy",
        6: "Hentai",
        7: "Horror",
        8: "Mahou Shoujo",
        9: "Mecha",
        10: "Music",
        11: "Mystery",
        12: "Psychological",
        13: "Romance",
        14: "Sci-Fi",
        15: "Slice of Life",
        16: "Sports",
        17: "Supernatural",
        18: "Thriller"
    },
    an_format: {
        0: 'TV',
        1: 'TV_SHORT',
        2: 'MOVIE',
        3: 'SPECIAL',
        4: 'OVA',
        5: 'ONA'
    },

    lol_type: {
        0: 'champions',
        1: 'items'
    },

    hs_type: {
        0: "Hero",
        1: "Minion",
        2: "Spell",
        3: "Weapon",
    },
    hs_rarity: {
        0: "Free",
        1: "Common",
        2: "Rare",
        3: "Epic",
        4: "Legendary",
    },
    hs_set: {
        0: "Basic",
        1: "Classic",
        2: "Naxxramas",
        3: "Goblins vs Gnomes",
        4: "Blackrock Mountain",
        5: "The Grand Tournament",
        6: "The League of Explorers",
        7: "Whispers of the Old Gods",
        8: "One Night in Karazhan",
        9: "Mean Streets of Gadgetzan",
        10: "Journey to Un'Goro",
        11: "Knights of the Frozen Throne",
        12: "Kobolds & Catacombs",
        13: "The Witchwood",
        14: "The Boomsday Project",
        15: "Rastakhan's Rumble",
        16: "Rise of Shadows",
        17: "Saviors of Uldum",
        18: "Descent of Dragons",
        19: "Galakrond's Awakening",
        20: "Demon Hunter Initiate",
        21: "Ashes of Outland",
        22: "Scholomance Academy",
        23: "Madness At The Darkmoon Faire",
        24: "Battlegrounds",
    },

    di_type: {
        0: 'random words/verbs',
        1: 'Countries'
    }

}

var gameChat = new GameChat();
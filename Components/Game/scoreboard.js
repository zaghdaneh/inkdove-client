'use strict'
function Scoreboard(){
    this.$container = $('#Scoreboard');
    //modal data

    this.$modal = $('#sc-modal');
    this.modalContainer = '.lobby-container';
    this.modalSel = {
        $top1 : $('#top_1'),
        $top2 : $('#top_2'),
        $top3 : $('#top_3'),
        top4 : 'top_4', //class for top4++
        $lh: $('#sc-fh'), //halfs for top4+
        $rh: $('#sc-sh')
    }
    
    this.guesserClass = 'guessed-r';
    //Final score modal display

    //data
    this.drawerID = -1;
    this.scores = {} // accountid : score

    //observers
    socket.addObserver(constant_data.MSG_TYPES.CREATE_ROOM, (...args) => this.createRoomCb.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.JOIN_ROOM, (...args) => this.joinRoomCb.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.START_GAME, (...args) => this.resetData.call(this));
    socket.addObserver(constant_data.MSG_TYPES.ADD_PLAYER, (...args) => this.addPlayerCb.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.REMOVE_PLAYER, (...args) => this.removePlayer.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.REMOVE_PLAYERS, (...args) => this.removeMultiplePlayers.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.PLAYER_DISCONNECTED, (...args) =>  this.setDisconnected.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.PLAYER_RECONNECTED, (...args) => this.setReconnected.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.NEW_OWNER, (...args) => this.setOwner.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.NEW_DRAWER, (drawerData) => this.newDrawerCb.call(this, drawerData.accountid));
    socket.addObserver(constant_data.MSG_TYPES.P_GUESSED_T, (...args) => this.addGuesser.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.WORDS_CHOICE, () => this.newDrawerCb.call(this, userData.accountid));
    socket.addObserver(constant_data.MSG_TYPES.END_TURN, (...args) => this.endTurnCb.call(this, ...args)); 
    socket.addObserver(constant_data.MSG_TYPES.END_GAME, (...args) => this.endGameCb.call(this, ...args)); 
    socket.addObserver(constant_data.MSG_TYPES.BACK_TO_LOBBY, (...args) => this.disableModal.call(this, ...args)); 
    //TODO : guesser (add class) /
}


Scoreboard.prototype.createRoomCb = function(roomData) {
    this.$container.empty();
    this.addPlayer(userData.description(), roomData);
}

Scoreboard.prototype.resetData = function(){
    for (const key in this.scores){
        this.scores[key] = 0;
    }

    this.$container.find('.ps-score').html(0);
    this.$container.find('.ps-rank').html(1);
}

//add all players to the lobby
Scoreboard.prototype.joinRoomCb = function(roomData, playerData, ingameData = null){
    this.scores = {};
    this.$container.empty();
    for(const [pId, pData] of Object.entries(playerData)) {    
        this.addPlayer(pData, roomData, ingameData);
    }
}

Scoreboard.prototype.newDrawerCb = function(accountid){
    //TODO drawer UI and score
    if (this.drawerID !== null)
        this.$container.find('#ps-' + this.drawerID).find('.ps-drawing').remove();
    this.drawerID = accountid;
    this.$container.find('#ps-' + this.drawerID).append($('<img src="https://cdn.inkdove.com/images/drawing.png" class="ps-drawing" data-toggle="tooltip" data-placement="top" title="Drawer"/>'));

    this.resetGuessers();
}


Scoreboard.prototype.endTurnCb = function(data){
    let lastguesser = data.lastguesser;
    let drawerScore = data.drawerScore
    if (lastguesser){
        this.addGuesser(lastguesser)
    }

    this.addGuesser({accountid: this.drawerID, score: drawerScore});
    this.reorder();
}
Scoreboard.prototype.reorder = function(){
    var scores = this.scores;
    let container = this.$container;
    container.children().detach().sort(function(a,b){
        var fsc = scores[(a.id).substring(3, a.id.length)];
        var ssc = scores[(b.id).substring(3, b.id.length)];
        console.log(fsc + ' and ' + ssc);
        return (fsc < ssc) ? 1 : (fsc > ssc) ? -1 : 0;
    }).each((ind, val) => {
        $(val).find('.ps-rank').html(ind+1);
    }).appendTo(container);

}


Scoreboard.prototype.addGuesser = function(player){
    //player= {accountid, score}
    this.scores[player.accountid] += player.score;

    var $selector = this.$container.find('#ps-' + player.accountid);
    $selector.addClass(this.guesserClass);
    $selector.find('.ps-score').html(this.scores[player.accountid]);
}

Scoreboard.prototype.resetGuessers = function(){
    this.$container.find('.' + this.guesserClass).removeClass(this.guesserClass);
}

Scoreboard.prototype.addPlayerCb = function(playerData){
    this.addPlayer(playerData, room.mainData, room.ingameData);
}

Scoreboard.prototype.removeMultiplePlayers = function(data){
    for (var i=0; i<data.length; i++){
        this.removePlayer(data[i]);
    }
}
Scoreboard.prototype.removePlayer = function(data){
    var accountid = data.accountid;
    var newOwner = data.owner;
    this.$container.find('#ps-' + accountid).remove();

    if (newOwner !== null){
        this.$container.find('#ps-' + newOwner).append($('<img src="https://cdn.inkdove.com/images/crown.png" class="ps-owner owner"/>'));
    }
}

Scoreboard.prototype.setOwner = function(newOwner){
    this.$container.find('.owner').remove();
    this.$container.find('#ps-' + newOwner).append($('<img src="https://cdn.inkdove.com/images/crown.png" class="ps-owner owner"/>'));
}

Scoreboard.prototype.setDrawer = function(accountid){
    this.$container.find('.ps-drawing').remove();
    this.$container.find('#ps-' + accountid).append($('<img src="https://cdn.inkdove.com/images/drawing.png" class="ps-drawing" data-toggle="tooltip" data-placement="top" title="Drawer"/>'));
    
}

Scoreboard.prototype.setDisconnected = function(accountid){
    this.$container.find('#ps-' + accountid).addClass('disconnected');   
}

Scoreboard.prototype.setReconnected = function(accountid){
    this.$container.find('#ps-' + accountid).removeClass('disconnected');   
}

Scoreboard.prototype.addPlayer = function(data, roomData, ingdata = null){
    var accountid = data.accountid;
    var username = data.username;
    var score = data.score;

    this.scores[accountid] = score;

    var elemID = "ps-" + accountid;

    var $pns = $('<div></div>').addClass('player-score-ingame').attr('id', elemID);;
    if (roomData.owner == accountid){
        $pns.append($('<img src="https://cdn.inkdove.com/images/crown.png" class="ps-owner owner"/>'));
    }
    if (ingdata && ingdata.ing_drawer == accountid){
        $pns.append($('<img src="https://cdn.inkdove.com/images/drawing.png" class="ps-drawing" data-toggle="tooltip" data-placement="top" title="Drawer"/>'));
    }
    if (data.hasOwnProperty('guessed') && data.guessed){
        $pns.addClass(this.guesserClass);
    }

    //ps-rank
    var $prank = $('<div class="ps-rank"></div>').html('1');

    //pdata
    var $pdata = $('<div class="ps-data"></div>');
    var $puname = $('<div class="ps-uname"></div>').html(username);
    var $pscore = $('<div class="ps-score"></div>').html(score);
    $pdata.append($puname);
    $pdata.append($pscore);

    $pns.append($prank);
    $pns.append($pdata);
    this.$container.append($pns);
}

Scoreboard.prototype.endGameCb = function(){
    var scores = this.scores;
    var sortedScores = Object.keys(scores).sort(function(a,b){return scores[b]-scores[a]}) // array with sorted accountids;
    this.setupModal(sortedScores);
    this.displayModal();

}

Scoreboard.prototype.setupModal = function(scoreList){
    //init
    this.modalSel.$lh.empty();
    this.modalSel.$rh.empty();
    //fill
    console.log(scoreList);
    this.modalSel.$top1.html('1 ' + room.players[scoreList.shift()]);
    this.modalSel.$top2.html('2 ' + room.players[scoreList.shift()]);
    var thirdPlace = (scoreList.length > 0)? scoreList.shift() : 'no one';
    this.modalSel.$top3.html('3 ' + room.players[thirdPlace]);

    //$lh: $('#sc-fh'), //halfs for top4+
    //$rh: $('#sc-sh')
    
    var halfPlayers = Math.ceil(scoreList.length / 2);
    var i = 0;
    while(scoreList.length > 0){
        var $txt = $('<div class="top_4"></div>').html((i+4) + ' ' + room.players[scoreList.shift()]);
        if (i < halfPlayers){
            this.modalSel.$lh.append($txt);
        } else {
            this.modalSel.$rh.append($txt);
        }
        i++;
    }

}

Scoreboard.prototype.displayModal = function(){
    this.$modal.modal('show');
    $('.modal-backdrop').appendTo(this.modalContainer);
    //remove the padding right and modal-open class from the body tag which bootstrap adds when a modal is shown
    $('body').removeClass();
    $('body').css("padding-right", "");
}

Scoreboard.prototype.disableModal = function(){
    this.$modal.modal('hide');
}
var scoreboard = new Scoreboard();


/*<div class="player-score-ingame" id="ps-">
										<img src="https://cdn.inkdove.com/images/crown.png" class="ps-owner"/>
										<img src="https://cdn.inkdove.com/images/drawing.png" class="ps-drawing" data-toggle="tooltip" data-placement="top" title="Drawer"/>
										<div class="ps-rank">10</div>
										<div class="ps-data">
											<div class="ps-uname">Usernameambd</div>
											<div class="ps-score">30022</div>
										</div>
									</div>*/
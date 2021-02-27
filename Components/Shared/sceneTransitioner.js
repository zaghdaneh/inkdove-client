'use strict'
//Serves as rtoom transition, also sets up a notification in case user tries to leave while in room
function SceneTransitioner(){
	this.$roombrowser = $('#roombrowser');
	this.$liParent = $('#crig'); //because of bad html this is enabled when going to lobby or ingame (gotta upgrade html later too)
	this.$lobby = $('#customroom');
	this.$ingame = $('#ingame');

	this.$activeScene = this.$roombrowser;

	

	//observers
	socket.addObserver(constant_data.MSG_TYPES.CREATE_ROOM, () => this.goToLobby.call(this));
	socket.addObserver(constant_data.MSG_TYPES.JOIN_ROOM, (...args) => this.joinRoom.call(this, ...args));
	socket.addObserver(constant_data.MSG_TYPES.START_GAME, () => this.goToIngame.call(this));
	socket.addObserver(constant_data.MSG_TYPES.BACK_TO_LOBBY, () => this.goToLobby.call(this));
}

SceneTransitioner.prototype.joinRoom = function(roomData){
	if (roomData.ingame){
		this.goToIngame();
	}else{
		this.goToLobby();
	}

}
SceneTransitioner.prototype.goToLobby = function(){
	this.$activeScene.hide();
	this.$liParent.show();
	this.$lobby.show();
	
	this.$activeScene = this.$lobby;

	window.onbeforeunload = function(){
		return 'Are you sure you want to an ongoing game?';
	  };
}

SceneTransitioner.prototype.goToIngame = function(){
	this.$activeScene.hide();
	this.$liParent.show();
	this.$ingame.show();
	
	this.$activeScene = this.$ingame;

	window.onbeforeunload = function(){
		return 'Are you sure you want to an ongoing game?';
	  };
}

SceneTransitioner.prototype.goToRoomBrowser = function(){
	this.$liParent.hide();
	this.$activeScene.hide();
	this.$roombrowser.show();
	this.$activeScene = this.$roombrowser;

	window.onbeforeunload = function(){
		return;
	  };
}


var sceneTransitioner = new SceneTransitioner();
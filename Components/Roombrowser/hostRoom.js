'use strict'
function HostRoom(){
    this.$hostBtn = $('#host-but-c') // host room

    this.$selectors = { // all selectors that are sent when hosting
        $name: $('#HR-roomname'),
        $password: $('#HR-roompass'),
        $lang: $('#HR-Lan'),
        $locked: $('#HR-locked'),
        $di: $('#HR-useDic'),
        $lol: $('#HR-useLol'),
        $an: $('#HR-useAn'),
        $hs: $('#HR-useHs')
    }
    //btns
    this.$hostBtn.click((e) => this.hostRoom.call(this));
    this.$selectors.$locked.change((e) => { //enable password only when locked
        let checked =   this.$selectors.$locked.prop('checked');
        if (checked){
            this.$selectors.$password.prop('disabled', false);
        }else{
            this.$selectors.$password.prop('disabled', true);
        }
    })
}


HostRoom.prototype.hostRoom = function(){
    topWindow.close();
    let selectors = this.$selectors;
    var message = {
        name: selectors.$name.val(),
        locked: selectors.$locked.prop('checked'),
        password: selectors.$password.val(),
        lang: parseInt(selectors.$lang.val()),
        di_enabled: selectors.$di.prop('checked'),
        lol_enabled: selectors.$lol.prop('checked'),
        an_enabled: selectors.$an.prop('checked'),
        hs_enabled: selectors.$hs.prop('checked')
    }

    if (message.name.length < constant_data.MIN_ROOMNAME_LENGTH){
        errorHandler.display('Room name too short');
    }

    socket.emit(constant_data.MSG_TYPES.CREATE_ROOM, true, message);
}

var hostRoom = new HostRoom();
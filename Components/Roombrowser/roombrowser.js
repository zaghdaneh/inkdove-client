'use strict'
function Roombrowser() {
    //selectors
    this.$refreshRoomBtn = $('#refreshbutton');
    this.$container = $('#room-cont');

    //properties
    this.rooms = {};
    this.filters = { ///FILTERS if true means included false hidden
        //search field
        name: '',
        //room state
        ingame: true,
        locked: true, //private 
        full: true,
        //language
        langs: [0,1],
        //themes
        di_enabled: true,
        lol_enabled: true,
        an_enabled: true,
        hs_enabled: true
    }; //passed by roomFilter.js, applied to each new room
    //values
    this.roomToJoinId = 0;
    //setup
    this.$refreshRoomBtn.click((event) => {
        //EnableloadingScreen($loadingScreen);
        this.refresh();
    });
    //Setup button responses
    this.$container.on("click", ".joinrBut", (event) => {
        var roomID = (event.target.id).substring(3, event.target.id.length); //"robr-" + data.id;
        this.roomToJoinId = roomID; //sent to roombrowser global var
        if (this.rooms[roomID].roomData.locked) {
            console.log('room is locked');
            this.openJoinPasswordUI();
        } else {
            this.joinRoom();
        }
    });

    //functions called by outsider (Room filter)
    this.updateFilter = function (filterName, newValue, langValue = null) {
        //Language is handled specially, this is because it's different from other stuff where only 1 language per room but multiple languages in filter, so we use an array
        if (filterName === 'langs'){
            if (newValue){
                this.filters.langs.push(langValue);
            } else {
                var index = this.filters.langs.indexOf(langValue);
                if (index > -1){
                    this.filters.langs.splice(index, 1);
                }
            }
        } else {
            this.filters[filterName] = newValue;
        }    
        for (const [key, room] of Object.entries(this.rooms)) {
            room.filterCheck(this.filters);
        }
    }.bind(this);
    //observers
    socket.addObserver(constant_data.MSG_TYPES.USER_DATA, () => this.refresh.call(this));
    socket.addObserver(constant_data.MSG_TYPES.LEAVE_ROOM, () => this.refresh.call(this));
    socket.addObserver(constant_data.MSG_TYPES.BROWSER_UPDATE, (data) => this.refreshCallback.call(this, data));
    socket.addObserver(constant_data.MSG_TYPES.SPAM_ALERT, () => this.enableRefreshBtn.call(this));
    
    //error observers
    errorHandler.addObserver(constant_data.MSG_TYPES.BROWSER_UPDATE, () => this.enableRefreshBtn.call(this));
    errorHandler.addObserver(constant_data.ROOM_DOES_NOT_EXIST, () => this.refresh.call(this));
}

Roombrowser.prototype.refresh = function () {
    this.rooms = {};
    this.$container.empty(); //deletes all children
    socket.emit(constant_data.MSG_TYPES.BROWSER_UPDATE, false);
    this.$refreshRoomBtn.prop('disabled', true);
}

Roombrowser.prototype.refreshCallback = function (data) {   
    for (var i = 0; i < data.length; i++) {
        this.addroom(data[i]);
    }
    this.enableRefreshBtn();
}

Roombrowser.prototype.addroom = function (roomData) {
    this.rooms[roomData.id] = new RbRoom(roomData, this.$container, this.filters);
}

Roombrowser.prototype.openJoinPasswordUI = async function () {
    const { value: password } = await Swal.fire({
        title: 'Enter room Password',
        input: 'text',
        inputLabel: 'Room password',
        showCancelButton: true,
        confirmButtonText: `Join`,
        inputValidator: (value) => {
            if (!value) {
                return 'Password cannot be null!'
            }
        }
    })

    if (password) {
        this.joinRoom(password);
    }
}

Roombrowser.prototype.disableRefreshBtn = function () {
    this.$refreshRoomBtn.prop('disabled', true);
}

Roombrowser.prototype.enableRefreshBtn = function () {
    this.$refreshRoomBtn.prop('disabled', false);
}
Roombrowser.prototype.joinRoom = function (password = '') {
    // id / password
    var data = { id: this.roomToJoinId, password: password };
    socket.emit(constant_data.MSG_TYPES.JOIN_ROOM, true, data);
}





var roombrowser = new Roombrowser();
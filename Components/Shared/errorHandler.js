'use strict'
function ErrorHandler(){
    //data
    this.observers = {}; // for error some buttons may be unlocked so error handling is pecially observed here
    //nothing
    socket.addObserver(constant_data.MSG_TYPES.ERROR, (...args) => this.display.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.LEAVE_ROOM, (...args) => this.onLeaveRoom.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.ALREADY_LOGGED, (...args) => this.alreadyLogged.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.RECONNECT_ROOM, (...args) => this.reconnectToRoom.call(this, ...args));
}

ErrorHandler.prototype.display = function(message, msgtype = null){
    Swal.fire({
        icon: 'error',
        text: message,
    });

    if (msgtype){ // if the msgtype is returned we alert the listeners (TODO: make it always this condition is just while we restructure the error handling)
        this.alertObservers(msgtype)
    }
}

//The error handler has also observers to handle errors that may require unlocking of certain functions
ErrorHandler.prototype.addObserver = function(event, callback){
    if (!this.observers[event]){
        this.observers[event] = [];
    }
    
    this.observers[event].push(callback);
}

//The error handler has also observers to handle errors that may require unlocking of certain functions
ErrorHandler.prototype.alertObservers = function (event){
    let eventListeners = this.observers[event];
    if (!eventListeners){
        return;
    }

    for (var i=0; i < eventListeners.length; i++){
        eventListeners[i]();
    }

}
ErrorHandler.prototype.onLeaveRoom = function(message = null){
    if (message !== null){
        this.display('You have been kicked from the room');
    }
}

ErrorHandler.prototype.alreadyLogged = function(){
    Swal.fire({
        icon: 'warning',
        title: 'Already logged in',
        text: 'You are already logged in in another tab, do you want to continue anyway?',
        confirmButtonText: `contine anyway`,
        allowOutsideClick: false
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            socket.emit(constant_data.MSG_TYPES.ALREADY_LOGGED, true);
        }

    });
}

ErrorHandler.prototype.reconnectToRoom = function(){
    Swal.fire({
        icon: 'info',
        title: 'You are in an ongoing game',
        text: 'You are in an ongoing game, do you wish to reconnect?',
        showDenyButton: true,
        confirmButtonText: `Yes`,
        denyButtonText: `No`,
        allowOutsideClick: false
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            socket.emit(constant_data.MSG_TYPES.RECONNECT_ROOM, true, true);
        } //TODO refuse reconnect 
        else {
            socket.emit(constant_data.MSG_TYPES.RECONNECT_ROOM, true, false);
        }

    });
}

//TODO: keep disabled buttons class here, when I receive an error message, they are reenabled

var errorHandler = new ErrorHandler();
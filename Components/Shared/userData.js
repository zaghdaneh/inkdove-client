function UserData() {

    this.accountid = 0;
    this.username = '0';

    socket.addObserver(constant_data.MSG_TYPES.USER_DATA, (...args) => this.setup.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.RECONNECT_ROOM, (...args) => this.setup.call(this, ...args));

}

UserData.prototype.description = function () {
    return {
        accountid: this.accountid,
        username: this.username,
        score: 0
    }
}

UserData.prototype.minDesc = function(){
    var output = {};
    output[this.accountid] = this.username;
    return output;
}
UserData.prototype.isPlayer = function (other) {
    if (typeof other === 'string'){
        other = parseInt(other, 10);
    }
    return (this.accountid === other);
}

UserData.prototype.setup = function (data) {
    this.accountid = parseInt(data.accountid, 10);
    this.username = data.username;
}
var userData = new UserData();



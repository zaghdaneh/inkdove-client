'use strict'
function Bottombar(){
    this.$username = $("#botbar_username");
    this.$logoutbtn = $('#logoutbtn');
    //binders
    //this.setData.bind(this);
    this.$logoutbtn.click((e) => this.logout.call(this));
    socket.addObserver(constant_data.MSG_TYPES.USER_DATA, (data) => this.setData.call(this, data));
    socket.addObserver(constant_data.MSG_TYPES.RECONNECT_ROOM, (data) => this.setData.call(this, data));
}

Bottombar.prototype.setData = function(data){ 
    this.$username.html(data.username);
}

Bottombar.prototype.logout = function(){
    loadingScreen.enable();
    $.ajax({
        type: "POST",
        url: "logout",
        contentType: "application/json",
        success: function() {
            location.reload();
        },

        error: function(res, statut, error){
            location.reload();
        }
      });
}

var bottombar = new Bottombar();
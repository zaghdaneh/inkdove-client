'use strict'
function AccountSettings() {

    //anime selectors
    this.$accountInp = $('#an-inp');
    this.$updateList = $('#updateList-btn');
    this.$listType = $('#an-site');
    this.$updateDate = $('#ans-date');
    this.$anloadingSpinner =  $('#anupload');

    //pwd change selectors
    this.$oldpwd = $('#acc-oldpwd');
    this.$newpwd = $('#acc-newpwd');
    this.$rnewpwd = $('#acc-newpwdr');
    this.$newpwdbtn = $('#acc-updatepwd-btn');

    //report bug selectors
    this.$rbTitle = $('#Bug_title_inp');
    this.$rbDesc = $('#Bug_Descr_Inp');
    this.$rbSend = $('#sendreportbtn');

    //vars
    //this.updateCd = null; //prevents user from spamming updates
    this.canUpdate = true;
    this.$updateList.click((e) => this.updateList.call(this));
    this.$rbSend.click((e) => this.sendBugReport.call(this));
    this.$newpwdbtn.click((e) => this.changePassword.call(this));
    socket.addObserver(constant_data.MSG_TYPES.UPDATE_ANIME_LIST, (...args) => this.updateListFeedback.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.USER_DATA, (data) => this.setAnimeSettings.call(this, data));
    socket.addObserver(constant_data.MSG_TYPES.RECONNECT_ROOM, (data) => this.setAnimeSettings.call(this, data));

    //error handler feedback
    errorHandler.addObserver(constant_data.MSG_TYPES.UPDATE_ANIME_LIST, () => this.enableUpdateList.call(this));
}



AccountSettings.prototype.updateList = function () {
    if (!this.canUpdate) {
        errorHandler.display('You can not reupdate your list so quickly')
        return;
    }
    socket.emit(constant_data.MSG_TYPES.UPDATE_ANIME_LIST, false, {
        account: this.$accountInp.val(),
        type: parseInt(this.$listType.val())
    });

    this.disableUpdateList();
    //this.updateCd = setTimeout(this.enableUpdate.bind(this), 1000 * 60);
}

AccountSettings.prototype.disableUpdateList = function () {
    this.canUpdate = false;
    this.$anloadingSpinner.show();
    this.$updateList.prop('disabled', true);

}

AccountSettings.prototype.enableUpdateList = function(){
    this.canUpdate = true;
    this.$anloadingSpinner.hide();
    this.$updateList.prop('disabled', false);
}

AccountSettings.prototype.updateListFeedback = function (data) {
    let m = (data.m)?data.m:'List successfully updated';
    Swal.fire({
        icon: 'success',
        text: m,
    });

    this.enableUpdateList();
    if (data !== null && data.account) {
        this.setAnimeSettings(data);
    }
}

//sets the anime data when loading (like username, type and update date)
AccountSettings.prototype.setAnimeSettings = function (data) {
    if (!data.animelist) {
        return;
    }
    this.$accountInp.val(data.animelist);
    this.$listType.val(data.animelisttype);
    let date = new Date(data.listdate)
    this.$updateDate.html(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate());
}

//change password, needs old and new password
AccountSettings.prototype.changePassword = function () {
    let oldPwd = this.$oldpwd.val();
    let newPwd = this.$newpwd.val();
    let rnewPwd = this.$rnewpwd.val();

    if (newPwd.length < constant_data.MIN_PASSWORD_LENGTH || newPwd.length > constant_data.MAX_PASSWORD_LENGTH) {
        return errorHandler.display('Bad new password, please try a different one');
    }

    if (newPwd !== rnewPwd) {
        return errorHandler.display('Passwords do not correspond');
    }

    loadingScreen.enable();
    let me = this;
    return $.ajax({
        type: "POST",
        url: "changepwd",
        data: JSON.stringify({
            oldPwd: oldPwd,
            newPwd: newPwd
        }),
        contentType: "application/json",
        success: function (answer, status) {
            loadingScreen.disable();
            Swal.fire({
                icon: 'success',
                text: 'Your password has been successfully updated',
            });
        },

        error: function (res, statut, error) {
            loadingScreen.disable();
            errorHandler.display(res.responseText);
        }
    });

}


//send a bug report
AccountSettings.prototype.sendBugReport = function(){
    let title = this.$rbTitle.val();
    let description = this.$rbDesc.val();

    this.$rbSend.prop('disabled', true);
    if (title.length > 40) {
        errorHandler.display('Title too long');
    }

    if (description.length > 400) {
        errorHandler.display('Passwords do not correspond');
    }

    let me = this;
    return $.ajax({
        type: "POST",
        url: "reportbug",
        data: JSON.stringify({
            title: title,
            description: description
        }),
        contentType: "application/json",
        success: function (answer, status) {
            Swal.fire({
                icon: 'success',
                text: 'Your report has been registered ! Thank you',
            });
            me.$rbSend.prop('disabled', false);
        },

        error: function (res, statut, error) {
            errorHandler.display(res.responseText);
            me.$rbSend.prop('disabled', false);
        }
    });
}

var accountSettings = new AccountSettings();
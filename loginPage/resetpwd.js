function ResetPwd(){
    this.$emailInp = $('#resetpwd-mail-inp');
    this.$sendbtn = $('#sendresetpwd-but');

    this.$inputs = $('.resetInp');
    this.$sendbtn.click((e) => this.send());

    this.$emailInp.keydown((e) =>{
        if (e.keyCode == 13) {
            this.send();
        }
    });
}



ResetPwd.prototype.send = function() {
    loadingAnimation.enable(this.$inputs);
    let email = this.$emailInp.val();
    const me = this;
    $.ajax({
        type: "POST",
        url: "resetpwd",
        data: JSON.stringify({
			email: email
        }),
        contentType: "application/json",
        success: function(data) {
            Swal.fire({
                icon: 'success',
                text: 'Your request has been succesfully sent. If the email you provided is correct, you should receive and email with the instructions to reset '+
                'Your password in a few minutes',
            });
            loadingAnimation.disable(me.$inputs);
            sceneTransitioner.GoToLogin();
        },

        error: function(res, statut, error){
            Swal.fire({
                icon: 'error',
                text: res.responseText
            });
            loadingAnimation.disable(me.$inputs);
        }
      });
}

var resetpwd = new ResetPwd();
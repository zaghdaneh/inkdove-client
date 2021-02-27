function NewPassword() {
    this.$password = $('#reset-password-input');
    this.$rPassword = $('#reset-Rpassword-input');
    this.$sendbtn = $('#sendnp-but');
    this.$inputs = $('.newpInp');

    this.id = -1;
    this.token = '';

    this.$sendbtn.click((e) => this.send());

    this.parseQuery();
}

NewPassword.prototype.parseQuery = function () {
    const urlParams = new URLSearchParams(window.location.search);

    if (!urlParams.has('token') || !urlParams.has('id')){
        return;
    }

    this.token = urlParams.get('token');
    this.id = urlParams.get('id');

    sceneTransitioner.GoToNewPwd();
};


NewPassword.prototype.send = function () {
    if (this.id === -1){
        return Swal.fire({
            icon: 'error',
            text: 'Unauthorized request, please reload this page',
        });;
    }
    loadingAnimation.enable(this.$inputs);
    let password = this.$password.val();
    let rPassword = this.$rPassword.val();

    var output = { 'p': true, 'rp': true };
    if (password !== rPassword) {
        output['rp'] = false;
    }
    if (password.length < constant_data.MIN_PASSWORD_LENGTH || password.length > constant_data.MAX_PASSWORD_LENGTH) {
        output['p'] = false;
    }

    if (!output['p'] || !output['rp']) {
        return this.InputFeedback(output)
    }

    const me = this;
    return $.ajax({
        type: "POST",
        url: "newpwd",
        data: JSON.stringify({
            id: me.id,
            token: me.token,
            password: password

        }),
        contentType: "application/json",
        success: function (answer, status) {
            loadingAnimation.disable(me.$inputs);
            sceneTransitioner.GoToLogin();
            Swal.fire({
                icon: 'success',
                text: 'Your password has been succesfully changed',
                showCancelButton: false,
                allowOutsideClick: false,
                confirmButtonText: 'Go to login'
              }).then((result) => {
                if (result.isConfirmed) {
                    window.location.assign(window.location.origin);
                }
              })
            

        },

        error: function (res, statut, error) {
            loadingAnimation.disable(me.$inputs);
            Swal.fire({
                icon: 'error',
                text: res.responseText,
            });
        }
    });


}

NewPassword.prototype.InputFeedback = function (validaters) {
    InputCheck(validaters['p'], this.$password);
    InputCheck(validaters['rp'], this.$rPassword);

}
var newPassword = new NewPassword();
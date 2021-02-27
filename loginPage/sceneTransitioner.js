function SceneTransitioner() {
    this.$loginForm = $('#login-p');
    this.$registerForm = $('#register-p');
    //this.$registerSuccessView = $('#SuccessRegis-p');
    this.$resetPasswordView = $('#Reset-p');
    this.$typeNewPasswordView = $('#Typenewp-p');

    this.$forgotpwdbtn = $('#repwdreqbtn');
    this.$cancelRegButton = $('#cancel-but');
    this.$CreateAccButton = $('#createacc-but');
    //this.$SuccessToLoginButton = $('#succ-q-but');//register succes, click gets back to login page
    this.$cencelresetpwd = $('#cancel-resetpwd-but');

    this.$activeScene = this.$loginForm;

    this.$cancelRegButton.click((e) =>this.transition(this.$loginForm));
    this.$cencelresetpwd.click((e) =>this.transition(this.$loginForm));
    this.$CreateAccButton.click((e) => this.transition(this.$registerForm));
    this.$forgotpwdbtn.click((e) => this.transition(this.$resetPasswordView))

}

/*SceneTransitioner.prototype.GoToRegisterSuccess = function() {
    this.transition(this.$registerSuccessView);
}*/

SceneTransitioner.prototype.GoToLogin = function() {
    this.transition(this.$loginForm);
}

SceneTransitioner.prototype.GoToNewPwd = function() {
    this.transition(this.$typeNewPasswordView);
}

SceneTransitioner.prototype.transition = function ($newView) {
    this.$activeScene.hide();
    $newView.show();
    this.$activeScene = $newView;
}


var sceneTransitioner = new SceneTransitioner();
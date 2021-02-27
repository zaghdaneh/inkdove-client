function Register() {
    this.$username = $('#RusernameInp');
    this.$password = $('#RPassInp');
    this.$r_password = $('#RRpassInp');
    this.$email = $('#RmailInp');

    this.$inputs = $('.regInp');
    this.$registerButton = $('#register-but');

    this.errorSelectors = {
        $username : $('#reg-user'),
        $password : $('#reg-pass'),
        $email : $('#reg-mail')
    };

    this.$registerButton.click((e) => this.sendRegister());

    this.$inputs.keydown(function (e) {
        if (e.keyCode == 13) {
            this.sendRegister();
        }
    });
}

Register.prototype.sendRegister = function () {
    loadingAnimation.enable(this.$inputs);

    let username = this.$username.val();
    let email = this.$email.val();
    let password = this.$password.val();
    let passwordR = this.$r_password.val();

    var output = { 'u': true, 'p': true, 'rp': true, 'v': true };
    if (username.length > constant_data.MAX_USERNAME_LENGTH  || username.length < constant_data.MIN_USERNAME_LENGTH) {
        output['u'] = false;
        output['v'] = false;
    }

    if (password.length < constant_data.MIN_PASSWORD_LENGTH || password.length > constant_data.MAX_PASSWORD_LENGTH) {
        output['p'] = false;
        output['v'] = false;
    }

    if (password !== passwordR) {
        output['rp'] = false;
        output['v'] = false;
    }


    if (output['v'] == false) {
        loadingAnimation.disable(this.$inputs);
        return this.RegisterInputFeedback(output);
    }


    //send register request
    var me = this;
    return $.ajax({
        type: "POST",
        url: "register",
        data: JSON.stringify({
            username: username,
            password: password,
            email: email
        }),
        contentType: "application/json",
        success: function (answer, status) {
            Swal.fire({
                icon: 'success',
                text: 'you have been registered successfully. You can now login',
            });
            loadingAnimation.disable(me.$inputs);
            sceneTransitioner.GoToLogin();
        },

        error: function (res, statut, error) {
            loadingAnimation.disable(me.$inputs);
            me.RegisterFailureFeedback(error);
        }
    });
}

Register.prototype.RegisterFailureFeedback = function (errorMessage) {
    this.SetOnListenRegisterFeedback();
    var errors = errorMessage.split("");
    if (errors.length < 1) {
        return;
    }

    for (var i = 0; i < errors.length; i++) {
        if (errors[i] == 'u') {
            InputCheck(false, this.$username);
        }
        else if (errors[i] == 'p') {
            InputCheck(false, this.$password);
        } else if (errors[i] == 'e') {
            InputCheck(false, this.$email);
        }
    }
}

Register.prototype.RegisterInputFeedback = function(validaters) {
    this.SetLocalRegisterFeedback();
    InputCheck(validaters['u'], this.$username);
    InputCheck(validaters['p'], this.$password);
    InputCheck(validaters['rp'], this.$r_password);
}

//sets feedback when answer from servert is sent
Register.prototype.SetOnListenRegisterFeedback = function(){
    this.errorSelectors.$email.text("Email is already used");
    this.errorSelectors.$password.text("Invalid password error");
    this.errorSelectors.$username.text("Username is already used");
}

//sets feedback from local data
Register.prototype.SetLocalRegisterFeedback = function () {
    this.errorSelectors.$email.text("please type a correct mail");
    this.errorSelectors.$password.text("please type a password longer than " + constant_data.MIN_PASSWORD_LENGTH);
    this.errorSelectors.$username.text("please type a username shorter than " + constant_data.MAX_USERNAME_LENGTH + " characters and longer than " + constant_data.MIN_USERNAME_LENGTH);

}


var register = new Register();
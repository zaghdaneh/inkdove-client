/*import {tracked_data} from './globalData';
import { constant_data } from '../Shared/constants';*/

function Login() {
    this.$username = $('#username-input');
    this.$password = $('#password-input');

    this.$inputs = $('.logInp');
    this.$loginBtn = $('#login-but');

    this.$loginBtn.click((e) => this.sendLogin());

    this.$inputs.keydown((e) =>{
        if (e.keyCode == 13) {
            this.sendLogin();
        }
    });

    window.cookieconsent.initialise({
        "palette": {
            "popup": {
                "background": "#17252A"
            },
            "button": {
                "background": "#2B7A78"
            }
        },
        "theme": "classic",
        "content": {
            "message": "Inkdove uses cookies to help improve user experience. By continuing to use this website you agree to allow Inkdove to use cookies.",
            "href": "www.inkdove.com/privacy"
        }
    });// cookies here cause dunno where else
}
Login.prototype.sendLogin = function(){
    loadingAnimation.enable(this.$inputs);
    var output = {'u': true, 'p':true, 'v':true};
    let username = this.$username.val();
    let password = this.$password.val();
    if (username.length > constant_data.MAX_USERNAME_LENGTH || username.length < constant_data.MIN_USERNAME_LENGTH){
        output['u'] = false;
        output['v'] = false;
    }

    if (password.length < constant_data.MIN_PASSWORD_LENGTH || password.length > constant_data.MAX_PASSWORD_LENGTH){
        output['p'] = false;
        output['v'] = false;
    }

   
    if (output['v'] == false){
        loadingAnimation.disable(this.$inputs);
        return this.InputFeedback(output);
    }

    var me = this;
    $.ajax({
        type: "POST",
        url: "login",
        data: JSON.stringify({
			username: username,
			password: password
        }),
        contentType: "application/json",
        success: function(data) {
            location.reload()
        },

        error: function(res, statut, error){
            loadingAnimation.disable(me.$inputs);
            me.FailureFeedback(error);
        }
      });
    
}

Login.prototype.FailureFeedback = function(errorMessage){
    /*var errors = errorMessage.split("");
    if (errors.length < 1){
        return;
    }
    InputCheck(false, $Lusername);*/

    Swal.fire({
        icon: 'error',
        text: 'Incorrect credentials. Could not login',
    });
}

Login.prototype.InputFeedback = function(validaters){
    InputCheck(validaters['u'], this.$username);
    InputCheck(validaters['p'], this.$password);

}

var login = new Login();
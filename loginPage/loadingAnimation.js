function LoadingAnimation() {
    this.$spinner = $('#loading-log');
}


LoadingAnimation.prototype.enable = function($inputs){
    $inputs.prop("disabled", true);
    this.$spinner.show();
}

LoadingAnimation.prototype.disable = function($inputs){
    $inputs.prop("disabled", false);
    this.$spinner.hide();
}
var loadingAnimation = new LoadingAnimation();
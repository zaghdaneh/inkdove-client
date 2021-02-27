function LoadingScreen(){
    this.$view = $('#loading-screen');
}


LoadingScreen.prototype.enable = function (){
    this.$view.show();
}

LoadingScreen.prototype.disable = function (){
    this.$view.hide();
}

loadingScreen = new LoadingScreen();
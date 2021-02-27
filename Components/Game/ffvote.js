//small popover that shows the ff vote, 
//with time bar
//hopefully will one day also be animated
function FFVote(){
    this.$selector = $('#ffBox');

    this.$voteSelector = $('#ffvote');
    this.$resultSelector = $('#ffres');

    //selectors for voting step
    this.$timebar = $('#fftime');
    this.$yes = $('#gbtlbtn-y');
    this.$no = $('#gbtlbtn-n');

    //init duration
    this.$timebar.css('--duration', constant_data.BTL_VOTE_DURATION);
    this.$yes.click((e) => this.CastVote(this.$yes, true));
    this.$no.click((e) => this.CastVote(this.$yes, false));

    socket.addObserver(constant_data.MSG_TYPES.BACK_TO_LOBBY_VOTE, (...args) => this.StartVote.call(this, ...args)); 
    socket.addObserver(constant_data.MSG_TYPES.END_BTL_VOTE, (...args) => this.DisplayResult.call(this, ...args)); 
}


//shows voting part, time bar is reset
FFVote.prototype.StartVote = function() {
    //resets timer
    this.$timebar.removeClass("round-time-bar");
    this.$timebar.offsetWidth;
    this.$timebar.addClass("round-time-bar");

    //enables button
    this.$yes.prop('disabled', false);
    this.$no.prop('disabled', false);

    //show selectors
    this.$resultSelector.hide();
    this.$voteSelector.show();
    this.$selector.show();
}

//sends vote, disables buttons
FFVote.prototype.CastVote = function($selector, vote){
    this.$yes.prop('disabled', true);
    this.$no.prop('disabled', true);
    $selector.addClass('active-vote');
    
    socket.emit(constant_data.MSG_TYPES.BACK_TO_LOBBY_VOTE, false, vote);
}

FFVote.prototype.DisplayResult = function(result){
    //set result text
    if (result){
        this.$resultSelector.html('Vote passed: Going back to lobby after this turn');
    }else {
        this.$resultSelector.html('Vote failed: Game will continue');
    }

    this.$voteSelector.hide();
    this.$resultSelector.show();
    //set timeout before hiding the window
    setTimeout(this.Hide.bind(this), 5 * 1000);
}


//remove enabled classes and hides the selector
FFVote.prototype.Hide = function() {
    this.$yes.removeClass('active-vote');
    this.$no.removeClass('active-vote');
    this.$selector.hide();
}

var ffvote = new FFVote();
function WordChoice() {
    //selectors
    
    this.$modal = $('#wg-modal');
    this.$container = $('#wg-mod-cont');
    this.$timer = $('#timer-cw');
    this.modalContainer = '.lobby-container';
    this.wordsClass = '.c-word';
    this.interval = null;

    this.$container.on("click", this.wordsClass, (e) => { //give ownership ()
        this.clearTimer();
        this.close();
        var message = (e.target.id).substring(2, (e.target.id).length);
        socket.emit(constant_data.MSG_TYPES.WORDS_CHOICE, false, message);
    });
    //observers
    socket.addObserver(constant_data.MSG_TYPES.WORDS_CHOICE, (...args) => this.display.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.START_DRAW_D, (...args) => this.close.call(this, ...args));
}


WordChoice.prototype.display = function (data) {
    this.$container.empty();

    for (const [key, value] of Object.entries(data)) {
        this.addWord(value);
    }
    this.open();
    this.setTimer();
}

WordChoice.prototype.setTimer = function () {
    var countdown = constant_data.FORCE_WORD_TIMER;
    this.clearTimer();
    this.interval = setInterval((function (self) {
        //every second, countdown goes down
        countdown = countdown - 1;
        self.$timer.html(countdown);
        if (countdown <= 0) {
            self.close();
            self.clearTimer();
        }
    }), 1000, this);

}

WordChoice.prototype.clearTimer = function () {
    if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
    }
}

WordChoice.prototype.addWord = function (word) {
    var wordid = 'wg' + word.id;
    var $gword = $('<button>', {
        'type': 'button',
        'class': 'btn btn-light c-word',
        'id': wordid
    }).html(word.name);

    this.$container.append($gword);
}
WordChoice.prototype.open = function () {
    this.$modal.modal('show');
    $('.modal-backdrop').appendTo(this.modalContainer);
    //remove the padding right and modal-open class from the body tag which bootstrap adds when a modal is shown
    $('body').removeClass();
    $('body').css("padding-right", "");
}

WordChoice.prototype.close = function () {
    this.$modal.modal('hide');
}
var wordChoice = new WordChoice();



/**
 * For autocompleting words, useful for anime since words are too hard to spell
 */
function AutoComplete($inputSelector) {

    //selectors
    this.$inputSelector = $inputSelector;
    this.words = [];
    //function
    this.$inputSelector.autocomplete({

        source: function (request, response) {
            var matcher = request.term;
            let term = GenerateAnimeRegex(matcher);
            var results = $.ui.autocomplete.filter(this.words, term);
            response(results.slice(0, 10));
        }.bind(this),
        minLength: 2
    });

    //observers
    socket.addObserver(constant_data.MSG_TYPES.START_GAME, (...args) => this.ready.call(this));
    socket.addObserver(constant_data.MSG_TYPES.GET_ANIME_NAMES, (...args) => this.readyAnime.call(this, ...args));
}

AutoComplete.prototype.ready = function () {
    let aniEnabled = room.mainData.an_enabled;
    console.log(aniEnabled);
    if (this.words.length == 0 && aniEnabled) {
        return socket.emit(constant_data.MSG_TYPES.GET_ANIME_NAMES, false);
    }

    if (aniEnabled) {
        this.$inputSelector.autocomplete({
            disabled: false
        });
    } else {
        this.$inputSelector.autocomplete({
            disabled: true
        });
    }
}

//parses data
AutoComplete.prototype.readyAnime = async function (data) {
    this.words = data.split('\n');
    if (this.words.length === 0)
        return;
    this.ready();
}
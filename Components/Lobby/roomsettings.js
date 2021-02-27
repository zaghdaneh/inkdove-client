'use strict'
function RoomSettings() {
    //selectors
    this.$container = $('#room-settings');
    this.rs_prefix = '#rs-';
    this.$closebtn = $('#close-roomSettings');
    this.$savebtn = $('#save-roomSettings');
    this.$options = $('.rs-vals');  //common class for all selectors to detect changes
    this.$constrainedOps = $('.rs-valsCs'); // roomsetting vals with constraints, will handle constraints before adding changes
    //anime specific
    this.$animeYear = {
        $fromyear: $('#rs-an_fromy'),
        $fromSeason: $('#rs-an_froms'),
        $toYear: $('#rs-an_toy'),
        $toSeason: $('#rs-an_tos')
    }
    //data
    this.localChanges = {};
    //buttons/events
    this.$closebtn.click((e) => this.close.call(this));
    this.$savebtn.click((e) => this.save.call(this));
    this.$options.change((event) => {
        this.addChange($(event.target), event.target.id);
    });

    this.$constrainedOps.change((event) => {
        var $selector = $(event.target);
        var $selectorName = $selector.attr('name');
        if ($selectorName.startsWith('an_')) { //Maybe: better way of handling this (this is pretty crude)
            this.animeYearHandler();
            this.addChange($selector, event.target.id);
        }
    });



    //observers
    socket.addObserver(constant_data.MSG_TYPES.UPDATE_ROOM, (...args) => this.update.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.CREATE_ROOM, (roomData) => this.joinRoomcb.call(this, roomData, true));
    socket.addObserver(constant_data.MSG_TYPES.JOIN_ROOM, (roomData, players, ingData = null) => this.joinRoomcb.call(this, roomData, false));
    socket.addObserver(constant_data.MSG_TYPES.REMOVE_PLAYER, (data) => this.onOwnerUpdate.call(this, data.owner));
    socket.addObserver(constant_data.MSG_TYPES.NEW_OWNER, (...args) => this.onOwnerUpdate.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.START_GAME, () => this.disable.call(this));
    socket.addObserver(constant_data.MSG_TYPES.BACK_TO_LOBBY, () => this.enableIfOwner.call(this));
}

//get a dictionary of changed data, we update the selectors with the data
RoomSettings.prototype.update = function (data) {
    this.assignValues(data);
}

RoomSettings.prototype.joinRoomcb = function(data, owner){
    if (owner){
        topWindow.openRoomSettings(); //if the owner joins the room, means we created the room, just open room settings
        this.enable();
    } else (this.disable());

    this.update(data);
}

RoomSettings.prototype.onOwnerUpdate = function (owner) {
    if (owner === null) {
        return;
    }

    if (userData.isPlayer(owner)) {
        this.enable();
    } else {
        this.disable();
    }
}

RoomSettings.prototype.disable = function () {
    this.$options.prop("disabled", true);
    this.$constrainedOps.prop("disabled", true);
}

RoomSettings.prototype.enable = function () {
    this.$options.prop("disabled", false);
    this.$constrainedOps.prop("disabled", false);
}

RoomSettings.prototype.enableIfOwner = function () {
    if (room.ownerIsPlayer()) {
        this.enable();
    }
}

/* Constraint to not have irrealistic time intervals
*/
RoomSettings.prototype.animeYearHandler = function () {
    //$fromyear, $fromSeason, $toYear, $toSeason
    //Set the inputs to integer
    var fromYearVal = forceIntegerInput(this.$animeYear.$fromyear);
    var toYearVal = forceIntegerInput(this.$animeYear.$toYear);

    //set new min max values
    this.$animeYear.$fromyear.attr('max', toYearVal);
    this.$animeYear.$toYear.attr('min', fromYearVal);

    //fix seasons if same years (winter -> spring -> summer -> fall)
    if (fromYearVal === toYearVal) {
        //if fromSeason > tOSeason we set fromSeason = toSeason
        var fromSVal = parseInt(this.$animeYear.$fromSeason.val());
        var toSVal = parseInt(this.$animeYear.$toSeason.val());

        if (fromSVal > toSVal) {
            this.$animeYear.$fromSeason(toSVal);
        }


    }
}
RoomSettings.prototype.save = function () {
    topWindow.close();
    if (jQuery.isEmptyObject(this.localChanges) || !(room.ownerIsPlayer())) {
        return;
    }

    //remove fake changes (when checked unchecked the change gets registered)
    for (const [setting, value] of Object.entries(this.localChanges)) {
        if (Array.isArray(value)) {
            //value is array we need to iterate
            var roomSettingData = room.mainData[setting];
            var same = true;
            for (var i = 0; i < value.length; i++) {
                if (roomSettingData.indexOf(value[i] === -1)) {
                    same = false;
                    break;
                }
            } //compares each value and sees if its contained in room arrray, if not we break and keep the change
            if (same) {
                delete this.localChanges[setting];
            }
        }
        else if (value === room.mainData[setting]) {
            delete this.localChanges[setting];
        }
    }

    if (jQuery.isEmptyObject(this.localChanges)){
        return;
    }

    socket.emit(constant_data.MSG_TYPES.UPDATE_ROOM, true, this.localChanges);
    this.localChanges = {};
}

RoomSettings.prototype.close = function () {
    topWindow.close();
    if (room.ownerIsPlayer())
        this.resetLocalChanges();
}

/**
 * How this works: The value is the name of the div. if the div has a value value='0' that means that the name is the array that contains values
 * Example: anime format is tv, movie .... that  means all are an_format each one has value 0,1,2 .... so when we enable TV we add an_format = {1}
 * For checkboxes just object name is enough
 * @param {*} $selector 
 * @param {*} id 
 */
RoomSettings.prototype.addChange = function ($selector, id) {
    var value;
    var settingName = $selector.attr('name');
    if (settingName[0] === '!') { // this means its an array of values that share similar names
        value = parseInt($selector.attr('value'));
        //array value, so we remove add values to this array depending on change
        settingName = settingName.substring(1, settingName.length);
        if (!this.localChanges[settingName]) { //array doesn't exist, we copy the roomDataValues
            this.localChanges[settingName] = room.mainData[settingName].slice();
        }
        var checker = $selector.prop('checked');
        if (checker) { // now we simply add it to array if its there or remove it if its not there
            this.localChanges[settingName].push(value);
        } else { // else we add
            this.localChanges[settingName].splice(this.localChanges[settingName].indexOf(value), 1);
        }


    }
    else if ($selector.is(':checkbox')) {
        value = $selector.prop('checked');
        this.localChanges[settingName] = value;
    } else {
        value = $selector.val();
        this.localChanges[settingName] = value;
    }
}
//cancel changes so we reset (only owner ofc)
RoomSettings.prototype.resetLocalChanges = function () {
    this.localChanges = {};
    this.assignValues(room.mainData);
}

/**
 * ALL ids have a prefix 'rs-'
 * There are two ways that this happens: 
 * - The value received is singular (like are sequels allowed ? yes or no / room name changed => change value) => we get the checkbox by ID or the input list and set the value and move on
 * - The value received is an array => then we have an array of allowed intervals (like is hearthstone card rare,legendary? can be both can be none) => we get a container div that has 
 * the key name and iterate through all children, if child value is in the the value array we enable otherwise we disable
 * @param {Object} data : Data object which contains all changed values we need to assign
 */
RoomSettings.prototype.assignValues = function (data) {
    for (const [key, value] of Object.entries(data)) {
        var $selector = $(this.rs_prefix + key);
        if (!Array.isArray(value)) {
            if ($selector.length === 0) {
                //nothing to do inexistent
            }
            else if ($selector.is(':checkbox')) {
                //checkmark
                $selector.prop("checked", value);
            } else {
                $selector.val(value);
            }
        } else {
            let logKey = this.rs_prefix + key;
            //it's an array so we iterate through children and see*
            $selector.find(".rs-vals").each(function (index) {
                let itemVal = parseInt($(this).val(), 10);
                if (value.includes(itemVal)){
                    $(this).prop("checked", true);
                } else {
                    $(this).prop("checked", false);
                }
            });
        }

    }
}

var roomSettings = new RoomSettings();
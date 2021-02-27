/*
var browserRoomData = {
    id: 1,
    name: 'default',
    owner: 'ownerName', //here username is used
    locked: false,
    max_players: 10,
    ing_players: 1,
    rounds: 8,
    ing_round: 1,
    lang: 0,
    ingame: false,//0 => lobby and 1 => ingame
    di_enabled: true,
    lol_enabled: false,
    an_enabled: false,
    hs_enabled: false
};
*/

//roombrowser room (has less detail tn room) also returns it own UI element
function RbRoom(data, $roomContainer, filters){
    this.roomData = data;
    this.$selector = null;
    this.filterCheck = function(filters){
        for (const [filter, value] of Object.entries(filters)) {
            //if value = true, means show all rooms that are from example with a certain game, but means also rooms with false are shown
            //if false, we make sure the rooms that have these true are removed
            //so if we get ingame = false, not show any ingame room so if comparison is true, remove this
            if (value === true){ //and not if(value) because can be string for name
                continue;
            }
            var remove = true;
            switch(String(filter)){
                case 'name':
                    remove = !(this.roomData.name.startsWith(value));
                    break;
                case 'full':
                    remove = (this.roomData.ing_players === this.roomData.max_players);
                    break;
                case 'langs':
                    remove = !(value.includes(this.roomData.lang));
                    break;
                default:
                    remove = this.roomData[filter];
                    break;

            }

            if (remove){
                this.disable();
                return;
            }
        }
        this.enable();
    }.bind(this);

    this.addRoomToBrowser($roomContainer);
    this.filterCheck(filters);
}

RbRoom.prototype.enable = function(){
    this.$selector.show();
}

RbRoom.prototype.disable = function(){
    this.$selector.hide();
}
RbRoom.prototype.addRoomToBrowser = function($roomContainer) {
    
    var elemID = "robr-" + this.roomData.id;
    var $roomBox = $('<div></div>').addClass('room-box').attr('id', elemID);
    var $title = this.setupTitlebox();
    var $data = this.setupMiddleData();
    var $buttons = this.setupButtons();
    /*
                    <div class="room-box">
                    </div>
    */
    $roomBox.append($title).append($data).append($buttons);
    $roomContainer.append($roomBox);
    this.$selector = $roomBox;
}

RbRoom.prototype.setupTitlebox = function() {
    //rb-title part
    /*                  <div class="rb-title">
                            <img src="https://cdn.inkdove.com/images/lock.png" data-toggle="tooltip" data-placement="top" title="Locked" class="lock_icon_rb">
                            <p class="room-title"> ijew louled aaaaaaa</p>
                            <div class="double-equals-columns">
                                <div class="forms-half">
                                    <p class="state-text"> in lobby</p>
                                </div>
                                <div class="forms-half">
                                    <p class="state-text"> Round 1/10</p>
                                </div>
                            </div>
                        	
                        </div>
    */
    var stateText = '';
    if (this.roomData.ingame) {
        stateText = 'ingame';
    } else {
        stateText = 'in lobby';
    }

    //main container
    var $titleCont = $('<div></div>').addClass('rb-title'); //main container
    if (this.roomData.locked){
        var $locked = $('<img src="https://cdn.inkdove.com/images/lock.png" data-toggle="tooltip" data-placement="top" title="Locked" class="lock_icon_rb"/>');
        $titleCont.append($locked);
    }
    var $title = $('<p></p>').addClass('room-title').html(this.roomData.name); //title

    var $doublepart = $('<div></div>').addClass('double-equals-columns'); //second part container

    var $part = $('<div></div>').addClass('forms-half');
    var $state = $('<p></p>').addClass('state-text').html(stateText); // first half state
    $part.append($state);
    $doublepart.append($part);

    // second half with round
    $part = $('<div></div>').addClass('forms-half');
    var $round = $('<p></p>').addClass('state-text').html('Round: ' + this.roomData.ing_round + '/' + this.roomData.rounds); // first half state
    $part.append($round);
    $doublepart.append($part);

    //link up everything
    $titleCont.append($title).append($doublepart);

    return $titleCont;
}

RbRoom.prototype.setupMiddleData = function() {
    /* <div class="rb-data">
                            <div class="double-equals-columns rb-data-top">
                                <div class="forms-half">
                                    <p class="room-text ">Host: abcdefghij</p>
                                </div>
                                <div class="forms-half centered-title" style="align-items: center;">
                                    <img class="lan-icon" src="https://cdn.inkdove.com/images/en.jpg" data-toggle="tooltip" data-placement="right" title="English">
                                </div>
                            </div>
                            <p class="room-text">Players : 10/12</p>
                            <div class="filler-box"></div>
                            <div class="type-icons">
                                <img class="game-icon rounded" src="https://cdn.inkdove.com/images/an.png" data-toggle="tooltip" data-placement="top" title="Anime">
                                <img class="game-icon" src="https://cdn.inkdove.com/images/hs.png" data-toggle="tooltip" data-placement="top" title="hearthstone">
                                <img class="game-icon" src="https://cdn.inkdove.com/images/lol.png" data-toggle="tooltip" data-placement="top" title="League of legends">
                                <img class="game-icon" src="https://cdn.inkdove.com/images/dic.png" data-toggle="tooltip" data-placement="top" title="Dictionary">
                            </div>
                        </div>
    */

    var $dataCont = $('<div></div>').addClass('rb-data'); //main container

    //start
    var $doublepart = $('<div></div>').addClass('double-equals-columns rb-data-top'); //first part container

    var $part = $('<div></div>').addClass('forms-half');
    var $host = $('<p></p>').addClass('room-text').html('Host: ' + this.roomData.owner); // first half state
    $part.append($host);
    $doublepart.append($part);


    $part = $('<div style="align-items: center;"></div>').addClass('forms-half centered-title');
    var $lanIcon = $('<img class="lan-icon" src="https://cdn.inkdove.com/images/flags/' + this.roomData.lang + '.jpg" data-toggle="tooltip" data-placement="right">');
    $part.append($lanIcon);
    $doublepart.append($part);

    //end
    var $players = $('<p></p>').addClass('room-text').html('Players: ' + this.roomData.ing_players + '/' + this.roomData.max_players); //players
    var $filler = $('<div></div>').addClass('filler-box'); //filler

    //Start icons
    var $icons = $('<div></div>').addClass('type-icons');
    if (this.roomData.di_enabled) {
        $icons.append($('<img class="game-icon" src="https://cdn.inkdove.com/images/themes/dic.png" data-toggle="tooltip" data-placement="top" title="Dictionary">'));
    }
    if (this.roomData.an_enabled) {
        $icons.append($('<img class="game-icon rounded" src="https://cdn.inkdove.com/images/themes/an.png" data-toggle="tooltip" data-placement="top" title="Anime">'));
    }
    if (this.roomData.lol_enabled) {
        $icons.append($('<img class="game-icon" src="https://cdn.inkdove.com/images/themes/lol.png" data-toggle="tooltip" data-placement="top" title="League of legends">'));
    }
    if (this.roomData.hs_enabled) {
        $icons.append($('<img class="game-icon" src="https://cdn.inkdove.com/images/themes/hs.png" data-toggle="tooltip" data-placement="top" title="hearthstone">'));
    }

    //end
    //append all to container
    $dataCont.append($doublepart).append($players).append($filler).append($icons);
    return $dataCont;

}

RbRoom.prototype.setupButtons = function(){
    /*
    <div class="rb-buttons">
                            <button type="button" class="btn btn-outline-custom joinRoombut">Join</button><br>
                        </div>
                        */
    var buttonId = 'jr-' + this.roomData.id;

    var $roomBox = $('<div></div>').addClass('rb-buttons');
    
    var buttonClasslist = 'btn btn-outline-custom buttonsStyle';
    if (this.roomData.ingame === false){
        buttonClasslist += ' joinrBut';
    }
    var $button = $('<button type="button" ></button>').addClass(buttonClasslist);
    
    
    $button.attr('id', buttonId).html('Join');

    return $roomBox.append($button);
    
}

/*
//search field
        name: '',
        //room state
        ingame: true,
        locked: true,
        full: true,
        //language
        langs: ['en', 'fr'],
        //themes
        di_enabled: true,
        lol_enabled: true,
        an_enabled: true,
        hs_enabled: true
    };*/


/*
<div class="room-box">
  <div class="rb-title">
                            <img src="https://cdn.inkdove.com/images/lock.png" data-toggle="tooltip" data-placement="top" title="Locked" class="lock_icon_rb">
                            <p class="room-title"> ijew louled aaaaaaa</p>
                            <div class="double-equals-columns">
                                <div class="forms-half">
                                    <p class="state-text"> in lobby</p>
                                </div>
                                <div class="forms-half">
                                    <p class="state-text"> Round 1/10</p>
                                </div>
                            </div>
                        	
                        </div>                  
<div class="rb-data">
                            <div class="double-equals-columns rb-data-top">
                                <div class="forms-half">
                                    <p class="room-text ">Host: abcdefghij</p>
                                </div>
                                <div class="forms-half centered-title" style="align-items: center;">
                                    <img class="lan-icon" src="https://cdn.inkdove.com/images/en.jpg" data-toggle="tooltip" data-placement="right" title="English">
                                </div>
                            </div>
                            <p class="room-text">Players : 10/12</p>
                            <div class="filler-box"></div>
                            <div class="type-icons">
                                <img class="game-icon rounded" src="https://cdn.inkdove.com/images/an.png" data-toggle="tooltip" data-placement="top" title="Anime">
                                <img class="game-icon" src="https://cdn.inkdove.com/images/hs.png" data-toggle="tooltip" data-placement="top" title="hearthstone">
                                <img class="game-icon" src="https://cdn.inkdove.com/images/lol.png" data-toggle="tooltip" data-placement="top" title="League of legends">
                                <img class="game-icon" src="https://cdn.inkdove.com/images/dic.png" data-toggle="tooltip" data-placement="top" title="Dictionary">
                            </div>
                        </div>
<div class="rb-buttons">
                            <button type="button" class="btn btn-outline-custom joinRoombut">Join</button><br>
</div>
 </div>
*/
function Room(){
    //nothing
    this.mainData = {};
    this.ingameData = {};
    this.players = {};
 
    this.observers = {}; //Room change observers (we want the change to happen before it is sent)

    this.ownerIsPlayer = function(){
        return (this.mainData.owner === userData.accountid);
    }.bind(this);

    socket.addObserver(constant_data.MSG_TYPES.CREATE_ROOM, (roomData) =>this.setData.call(this, roomData, [userData.description()]));
    socket.addObserver(constant_data.MSG_TYPES.JOIN_ROOM, (...args) => this.setData.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.ADD_PLAYER, (...args) => this.addPlayer.call(this, true, ...args));
    socket.addObserver(constant_data.MSG_TYPES.REMOVE_PLAYER, (...args) => this.removePlayer.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.REMOVE_PLAYERS, (...args) => this.removePlayers.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.NEW_OWNER, (...args) =>this.setOwner.call(this, ...args));
    socket.addObserver(constant_data.MSG_TYPES.UPDATE_ROOM, (...args) =>this.updateRoomData.call(this, ...args));
    //socket.addObserver(constant_data.MSG_TYPES.REMOVE_PLAYERS, ;

}

Room.prototype.setData = function (roomData, players, ingameData) {
    this.mainData = roomData;
    this.players = {};
    for(const [pId, pData] of Object.entries(players)) {    
        this.addPlayer(false, pData);
    }
    
    if (ingameData){
        this.ingameData = ingameData;
    } else {
        this.ingameData = {
            ing_round: 0,
            ing_drawer: 0,
            ing_players: 1,
            time: 0,
            ing_word: '_', //for drawer only 
            ing_wordtype: 'lol',
        }
    }
    
}

Room.prototype.updateRoomData = function(data){
    Object.assign(this.mainData, data);
}
Room.prototype.setOwner = function (newOwner) {
    this.mainData.owner = newOwner;
}

Room.prototype.addPlayer = function (alert, playerdata) {
    this.players[playerdata.accountid] = playerdata.username;
    if (alert){
        this.alertObservers(constant_data.MSG_TYPES.ADD_PLAYER, playerdata.accountid);
    }
}

Room.prototype.removePlayers = function(data){
    if (!data)
        return;
    for (var i=0; i<data.length; i++){
        delete this.players[data[i].accountid];
    }
}

Room.prototype.removePlayer = function (data) {
    this.alertObservers(constant_data.MSG_TYPES.REMOVE_PLAYER, data);
    let newOwner = data.owner;
    if (newOwner !== null){
        this.mainData.owner = newOwner;
    }
    delete this.players[data.accountid];
}

Room.prototype.addObserver = function(event, callback){
    if (!this.observers[event]){
        this.observers[event] = [];
    }
    
    this.observers[event].push(callback);
}

//add observer from some
Room.prototype.alertObservers = function (event, ...args){
    let eventListeners = this.observers[event];
    
    if (!eventListeners){
        return;
    }

    for (var i=0; i < eventListeners.length; i++){
        eventListeners[i](...args);
    }
}

var room = new Room();

/*Room.prototype.addPlayer = function (data) {
    var accountid = data.accountid;
    this.players[accountid] = data;
}*/







/*
{
        //Main data
        id: 1,
        name: 'default',
        //game data
        locked: false,
        password: '',
        owner: 1, //playerID
        show_wortype: true,
        lang: 'en',
        ingame: false, //0 => lobby and 1 => ingame$
        rounds: 8,
        drawtime: 80,
        max_players: 10,
        //dictionary
        di_enabled: true,
        di_countries: true,
        di_celeb: false,
        //league
        lol_enabled: false,
        lol_champs: true,
        lol_skins: false,
        lol_items: true,
        //anime
        an_enabled: false,
        an_shared: false,
        an_sequels: true,
        //hearthstone
        hs_enabled: false,
        hs_r_free: true,
        hs_r_common: true,
        hs_r_rare: true,
        hs_r_epic: true,
        hs_r_legend: true,
        hs_t_hero: false,
        hs_t_minion: true,
        hs_t_spell: true,
        hs_t_weap: true,
        hs_basic: true,
        hs_classic: true,
        hs_naxx: false,
        hs_gvg: false,
        hs_blackmoun: false,
        hs_tgt: false,
        hs_tloe: false,
        hs_wotolg: false,
        hs_onik: false,
        hs_msog: false,
        hs_jtug: false,
        hs_kotft: false,
        hs_kac: false,
        hs_witch: false,
        hs_tbp: false,
        hs_rasta: false,
        hs_ros: false,
        hs_sou: false,
        hs_dod: false,
        hs_gala: false,
        hs_dhi: false,
        hs_aoo: false,
        hs_scholo: false,
        hs_mad: false,


    }
*/
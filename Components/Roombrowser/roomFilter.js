/**
 * Works directly with roombrowser (so dependent on the roombrowser, not the inverse)
 */
function RoomFilter(){
    this.$filters = $('.filterinp');
    this.$lanfilters = $('.lanfilter');
    this.$search = $('#roomSearchInp');

    this.$filters.change((e) => {
        roombrowser.updateFilter((e.target.id).substring(3, e.target.id.length), $(e.target).prop('checked'));
    });

    //for languages, since they're kinda special (explanation roombrowser in updatefilter func)
    this.$lanfilters.change((e) => {
        roombrowser.updateFilter('langs', $(e.target).prop('checked'), parseInt((e.target.id).substring(3, e.target.id.length)));
    });


    this.$search.keyup((e) => {
        roombrowser.updateFilter('name', this.$search.val());
    });
}



var roomFilter = new RoomFilter();

/*
//search field
        name: '',
        //room state
        ingame: true,
        locked: true,
        full: true,
        //language
        langs: 0, 1,
        //themes
        di_enabled: true,
        lol_enabled: true,
        an_enabled: true,
        hs_enabled: true
    };*/
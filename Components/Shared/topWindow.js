/**
 * Handles the top window that pops notably when creating a room, opening room settings and opening account settings
 * We also use this to implement the script that handles changing between tabs of the navigation
 */

function TopWindow() {
    this.$view = $('#top-window'); //for host, settings
    //boxes 
    this.$bigBox = $('#BC-box');
    this.$smallBox = $('#SC-box');
    //open buttons
    this.$openhostRoomBtn = $('#hostgame-but');
    this.$openRoomSetBtn = $('.open-roomSettings'); //class because different access exist
    this.$openAccSetBtn = $('#open_Accsettings_but');
    //closing buttons (only buttons which close the top view with no other consequence)
    this.$closeViewBtns = $('.closewindowBtn');
    //pages
    this.$hostPage = $('#host-room-w');
    this.$accountSettingsPage = $('#account-settings');
    this.$roomSettingsPage = $('#room-settings')
    //navigation tab class (changes between tabs)
    this.$navButtons = $('.nav_btn');
    //Default navigation tabs
    this.$rsDefNav = $("#rs-general-nav"); // default roomsettings highlighted nav
    this.$rsDeftab = $("#rs-general"); //default roomsettings open tab
    this.$asDefNav = $("#acc-general-nav"); // default account settings highlighted nav
    this.$asDeftab = $("#acc-general"); //default account settings open tab
    //tracker
    this.$activeView = null;
    this.$oldNavHigh = null;
    this.$oldTab = null;

    //btns
    this.$navButtons.click( (e) => {
        this.changeTab($("#" + e.target.id), $("#" + (e.target.id).substring(0, (e.target.id).length - 4)))
    });

    this.$openAccSetBtn.click(() => this.openAccountSettings.call(this));
    this.$openRoomSetBtn.click(() => this.openRoomSettings.call(this));
    this.$openhostRoomBtn.click(() => this.openHostPage.call(this));
    this.$closeViewBtns.click(() => this.close.call(this));
}


TopWindow.prototype.changeTab = function ($newNav, $newTab) {
    //changes tabs
    this.$oldTab.hide();
    $newTab.show();
    //change highlight
    this.$oldNavHigh.removeClass('highlightedNav');
    $newNav.addClass('highlightedNav');
    //update properties
    this.$oldTab = $newTab;
    this.$oldNavHigh = $newNav;

}
//help function to reuse the view changer (open the page and set the highlight to the active tab if it is passed)
TopWindow.prototype.helpFunction = function ($page, $NavHigh, $tab) {
    this.$smallBox.hide();
    this.$bigBox.show();
    this.$view.show();
    $page.show();
    this.$activeView = $page;

    if ($NavHigh !== undefined && $tab !== undefined) {
        this.$oldNavHigh = $NavHigh;
        this.$oldTab = $tab;

        this.$oldNavHigh.show();
        this.$oldNavHigh.addClass('highlightedNav');
        this.$oldTab.show();
    }
}

//uses smallBox
TopWindow.prototype.openHostPage = function () {
    this.$bigBox.hide();
    this.$smallBox.show();
    this.$view.show();
    this.$hostPage.show();
    this.$activeView =  this.$hostPage;
}

TopWindow.prototype.openAccountSettings = function () {
    this.helpFunction(this.$accountSettingsPage, this.$asDefNav, this.$asDeftab);
}

TopWindow.prototype.openRoomSettings = function () {
    this.helpFunction(this.$roomSettingsPage, this.$rsDefNav, this.$rsDeftab);
}

//closes window (also reset highlighted tabs)
TopWindow.prototype.close = function () {
    if (this.$oldNavHigh != null && this.$oldTab != null) {
        this.$oldTab.hide();
        this.$oldNavHigh.removeClass('highlightedNav');
    }
    this.$view.hide();
    this.$activeView.hide();

    this.$oldNavHigh = null;
    this.$oldTab = null;
}


var topWindow = new TopWindow();
function shake($selector) {
    var interval = 100;
    var distance = 10;
    var times = 4;

    $selector.css('position', 'relative');

    for (var iter = 0; iter < (times + 1); iter++) {
        $selector.animate({
            left: ((iter % 2 == 0 ? distance : distance * -1))
        }, interval);
    }//for                                                                                                              

    $selector.animate({ left: 0 }, interval);
}
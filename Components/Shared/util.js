
/**
 * Pass a number selector input, remove decimal part and force an integer value
 * @param {*} $selector : the input selector
 */
function forceIntegerInput($selector){
    var value = $selector.val();
    var index = value.indexOf('.');
    if (index !== -1){
        value = $selector.val().slice(0, index);
        $selector.val(value);
    }

    return value;
}
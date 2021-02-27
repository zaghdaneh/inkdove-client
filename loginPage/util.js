function InputCheck(res, $elem){
    if (res){
        $elem.removeClass("is-invalid");
		$elem.addClass("is-valid");
    }else{
        $elem.removeClass("is-valid");
        $elem.addClass("is-invalid");
    }
}
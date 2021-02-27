
/**
 * Since anime names are weird and we need autocomplete for that reason we need a regex for the autocomplete for special characters
 * list taken from : getting all distinct characters from anime titles in database (https://www.yourhtmlsource.com/text/specialcharacters.html also)
 */
const Singleregexes = {
    //combinations
    'pi':'(pi|π)',
    //letters
    'a' : '[aàáâãäąåα@ａ]',
    'b' : '[bβ]',
    'c' : '[cćç]',
    'e' : '[eèéêëē]',
    'i': '[iìⅱíîïıǐīł]',
    'k': '[kκ]',
    'n': '[nñ]',
    'o': '[oòóôõöøð]',
    'u': '[uúü]',
    'x': '[x×χ]',
    'u': '[uμùûǔ]',
    's': '[sśş]',
    'm': '[]',
    'm': '[]',
    ' ': '(-|−|–|—|―|＊|~|～|△|▽|◎|→|…|☆|★|♀|♡|♥|♪|♭|†|∞|∀|ψ|‧|〜|゜́|＆|【|】|√|∽|□|◇|®|〈|〉|¥|『|』|°|／| )',
    '\!':'[!‼！¡]',
    //'\?': '​[\?\？\¿]',
    '1': '[½1⅙]',
    '2': '[2²]',
    '3': '[3³]',
    "'": "[‘’]",
    '"': '[“”"]',
    //'\+': '[\+\＋\±]',
    '=':'[=＝≠]'
}

const combiRegex = {
    'oo' : '(oo|ō)',
    'ß' : '(ß|ss)',
    'ou' : '(ou|ō)',
    'uu' : '(ū|uu)',
    'ae' : '(æ|ae)',
    'oe' : '(œ|oe)'
}


function GenerateAnimeRegex(term) {
    for (const [key, value] of Object.entries(combiRegex)) {
        term.toString().replace(new RegExp(key, 'gi') , value);
    }
    for (const [key, value] of Object.entries(Singleregexes)) {
        term.toString().replace(new RegExp(key, 'gi') , value);
    }

    return term;
}

function normalize( term ) {
    var ret = "";
    for ( var i = 0; i < term.length; i++ ) {
      ret += accentMap[ term.charAt(i) ] || term.charAt(i);
    }
    return ret;
  };
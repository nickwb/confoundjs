var ugly = require('uglifyjs');

var rotString = {};

var MAX_CHAR = 126;
var MIN_CHAR = 32;
var ESCAPE_CHAR = "`";
var effectiveMax = MAX_CHAR - MIN_CHAR;

rotString.encodeString = function(s) {
    var result = '', rot = 13, i, c;
    
    for(i = 0; i < s.length; i++) {
        c = s.charCodeAt(i);
        
        if(c < MIN_CHAR || c > MAX_CHAR) {
            result += ESCAPE_CHAR + ('0000' + (+c).toString(16)).substr(-4);
        } else if (c === 96) {
            result += ESCAPE_CHAR + ESCAPE_CHAR;
        } else {
            result += String.fromCharCode(c);
        }
    }
    
    s = result;
    result = '';
    
    for(i = 0; i < s.length; i++) {
        c = ((s.charCodeAt(i) - MIN_CHAR) + rot) % (effectiveMax + 1);
        result += String.fromCharCode(c + MIN_CHAR);
    }
    
    return result;
};

rotString.decodeString = function(s) {
    var result = '', rot = 13, i, c;
    
    for(i = 0; i < s.length; i++) {
        c = ((s.charCodeAt(i) - MIN_CHAR) - rot);
        c = (c < 0) ? effectiveMax + (c + 1) : c;
        result += String.fromCharCode(c + MIN_CHAR);
    }
    
    s = result;
    result = '';
    
    for(i = 0; i < s.length; i++) {
        c = s[i];
        
        if(c === ESCAPE_CHAR) {
            result += (s[i + 1] == ESCAPE_CHAR) ? ESCAPE_CHAR : String.fromCharCode( parseInt( s.substr(i + 1, 4), 16) );
            i += (s[i + 1] == ESCAPE_CHAR) ? 1 : 4;
        } else {
            result += c;
        }
    }
    
    return result;
};

rotString.getTinyDecoder = function(rot) {
    var js = 'function __confoundjs_decode_string(r){for(var e,o,t=r,n=13,d=2,a="`",f=32,i=String.fromCharCode;d--;)for(r=t,t="",e=0;e<r.length;)d&&(o=r.charCodeAt(e)-f-n),o=d?0>o?95+o:o:r[e],t+=d?i(o+f):o===a?r[e+1]==a?a:i(parseInt(r.substr(e+1,4),16)):o,e+=d||o!==a?1:r[e+1]==a?2:5;return t}';
    
    var ast = ugly.parse(js);
};

function tinyDecodeReferenceSource(s) {

    var result = s,
        rot = 13,
        pass = 2,
        escapeChar = "`",
        minChar = 32,
        fromCharCode = String.fromCharCode,
        i,
        c;
    
    while(pass--) {
        
        s = result;
        result = '';
        
        for(i = 0; i < s.length;) {
        
            if(pass) {
                c = ((s.charCodeAt(i) - minChar) - rot);
            }
            
            c = pass ?
                (
                    // Effective Max (94) + c + 1
                    (c < 0) ? 95 + c : c
                )
                : s[i];
            
            result += pass ?
                fromCharCode(c + minChar) :
                (
                    (c === escapeChar) ?
                        (
                            (s[i + 1] == escapeChar) ?
                                escapeChar :
                                fromCharCode(parseInt(s.substr(i + 1, 4), 16))
                        )
                        : c
                );
            
            i += (!pass && c === escapeChar)
                ? ((s[i + 1] == escapeChar) ? 2 : 5)
                : 1;
        }
    
    }
    
    return result;
}


module.exports = rotString;
var _ = require('underscore'),
    numbers = require('./numbers');

var strings = {},
    map = {};
    
var expand = function(string) {
    string = string.replace(/true/g, '(!!{}+{})');
    string = string.replace(/false/g, '(!{}+{})');
    string = string.replace(/undefined/g, '([][![]]+[])');
    string = string.replace(/obj/g, '([]+{})');
    string = string.replace(/Infinity/g, '(!!{}/[]+[])');
    string = string.replace(/NaN/g, '([]*{}+[])');
    string = string.replace(/\d+/g, function(n){ return numbers.getSymbolic(Number(n)); });
    return string;
};

var initialiseMap = function() {
    if(strings.initialised) { return };
    strings.initialised = true;
    
    map['a'] = expand('false[1]');
    map['b'] = expand('obj[2]');
    map['c'] = expand('obj[5]');
    map['d'] = expand('undefined[2]');
    map['e'] = expand('true[3]');
    map['f'] = expand('false[0]');
    // g - transient
    // h - transient
    map['i'] = expand('undefined[5]');
    map['j'] = expand('obj[3]');
    // k
    map['l'] = expand('false[2]');
    // m - transient
    map['n'] = expand('undefined[1]');
    map['o'] = expand('obj[1]');
    // p
    // q
    map['r'] = expand('true[1]');
    map['s'] = expand('false[3]');
    map['t'] = expand('true[0]');
    map['u'] = expand('undefined[0]');
    // v - transient
    // w
    // x
    map['y'] = expand('Infinity[7]');
    // z
    
    map['I'] = expand('Infinity[0]');
    map['N'] = expand('NaN[0]');
    map['O'] = expand('obj[8]');
    
    map[' '] = expand('obj[7]');
};

strings.resetTransients = function() {
    map['g'] = null;
    map['h'] = null;
    map['m'] = null;
    map['v'] = null;
};

strings.mapToString = function(ref) {
    map['g'] = '(' + ref + ')' + expand('[7]');
};

strings.mapSingle = function(c, ref) {
    map[c] = '(' + ref + ')';
};

strings.obscureString = function(str) {
    initialiseMap();
    
    var chars = str.split('');
    var parts = [];
    var literal = '';
    
    _.each(chars, function(c) {
        if(!map[c]) {
            literal += c;
        } else {
            if(literal.length > 0) {
                parts.push("'" + literal + "'");
                literal = '';
            }
            parts.push(map[c]);
        }
    });
    
    if(literal.length > 0) {
        parts.push("'" + literal + "'");
    }
    
    return parts.join('+');
};

module.exports = strings;

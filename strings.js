define(['numbers'], function(numbers) {

    var module = {},
        map = {};
        
    var expand = function(string) {
        string = string.replace(/true/g, '(!!{}+{})');
        string = string.replace(/false/g, '(!{}+{})');
        string = string.replace(/undefined/g, '([][![]]+([]+[]))');
        string = string.replace(/obj/g, '([]+{})');
        string = string.replace(/Infinity/g, '(!!{}/[]+[])');
        string = string.replace(/NaN/g, '({+{}+{}})');
        string = string.replace(/\d+/g, function(n){ return numbers.getSymbolic(Number(n)); });
        return string;
    };
    
    var initialiseMap = function() {
        if(module.initialised) { return };
        module.initialised = true;
        
        //obj = "[object Object]"
        
        map['a'] = expand('false[1]');
        map['b'] = expand('obj[2]');
        map['c'] = expand('obj[5]');
        map['d'] = expand('undefined[2]');
        map['e'] = expand('true[3]');
        map['f'] = expand('false[0]');
        map['i'] = expand('undefined[5]');
        map['j'] = expand('obj[3]');
        map['l'] = expand('false[2]');
        map['n'] = expand('undefined[1]');
        map['o'] = expand('obj[1]');
        map['r'] = expand('true[1]');
        map['s'] = expand('false[3]');
        map['t'] = expand('true[0]');
        map['u'] = expand('undefined[0]');
        map['y'] = expand('Infinity[7]');
        
        map['I'] = expand('Infinity[0]');
        map['N'] = expand('NaN[0]');
        map['O'] = expand('obj[8]');
    };
    
    module.obscureString = function(str) {
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
    
    return module;

});
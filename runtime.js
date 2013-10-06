define(['numbers', 'strings', 'underscore'], function(numbers, strings, _) {

    var module = {};
    
    var initialise = function() {
        if(module.initialised) { return };
        module.initialised = true;
        
        module.hashCode = (new Function('return ' + module.writeHashCodeFn() +';'))();
        module.stateTable = new module.stateTable();
    };
    
    
    var variableMap = function() {
        var characterSet = ['\u03DF', '\u1D24', '\u0394', '\u02AD', '\u0465', '\u04E3', '\u0549', '\u1D77'];
        characterSet = _.sortBy(characterSet, function(c) {  return Math.random(); });
        
        var map = {};
        
        var counter = 0;
        this.makeOne = function(name) {
            if(map[name]) { return this };
        
            var sequence = counter.toString(characterSet.length).split('');
            var variable = _.reduce(sequence, function(variable, s) { return variable + characterSet[parseInt(s, characterSet.length)]; }, '');
            counter++;
            
            map[name] = variable;
            return this;
        };
        
        this.make = function() {
            for(var i = 0; i < arguments.length; i++) {
                this.makeOne(arguments[i]);
            }
            return this;
        };
        
        this.substitute = function(js) {
            var pattern = /#([a-zA-Z]+)~/g;
            return js.replace(pattern, function(m, name) { return map[name]; });
        };
    };
    
    module.stateTable = function() {
        
        this.reserve = function(name) {
        };
        
    };

    module.writeHashCodeFn = function() {
        
        var variables = new variableMap();
            variables.make('i', 'hashCode', 'input', 'length');
        
        
        var js = '';
        
        // The first argument is the input string,
        // The rest are variable declarations
        js += 'function(#input~,#hashCode~,#length~,#i~){';
        // Initialise the accumulator and the hash code to zero
        js += '#i~=#hashCode~=(+!!#hashCode~);';
        // Get the string length
        js += '#length~=#input~[' + strings.obscureString('length') + '];';
        // Iterate through each character in the string
        js += 'for(;#i~<#length~;#i~++){';
        // Add the current character to the hash and truncate to 32 bits
        js += '#hashCode~=' +
                '(' +
                    '((#hashCode~<<(' + numbers.getSymbolic(5) + '))-#hashCode~)' +
                    '+#input~[' + strings.obscureString('charCodeAt') + '](#i~)' +
                ')' +
                '|(' + numbers.getSymbolic(0) + ')';
        // End iteration
        js += '}';
        // Return the result
        js += 'return #hashCode~';
        js += '}';
        
        js = variables.substitute(js);
        
        return js;
    };
    
    module.generateRuntime = function(payload) {
        initialise();
        
        var js = '';
        
        js += '(function(){';
        js += '})();';
    };
    
    return module;

});
define(['numbers', 'strings', 'bitpack', 'underscore'], function(numbers, strings, bitpack, _) {

    var module = {};
    
    var initialise = function() {
        if(module.initialised) { return };
        module.initialised = true;
        
        strings.resetTransients();
        
        stateTable = new stateTable();
        
        stateTable.reserve('strH');
        stateTable.reserve('strLength');
        stateTable.reserve('strConstructor');
        stateTable.reserve('strToString');
        stateTable.reserve('fnFromCharCode');
        stateTable.reserve('fnUnpack');
        stateTable.reserve('payload');
        stateTable.reserve('key');
        stateTable.reserve('fnEvalute');
    };
    
    
    var variableMap = function() {
        var characterSet = ['\u03DF', '\u1D24', '\u0394', '\u02AD', '\u0465', '\u04E3', '\u0549', '\u1D77', '\u0194', '\u037D'];
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
            var pattern = /#([a-zA-Z]+)~?/g;
            return js.replace(pattern, function(m, name) { return map[name]; });
        };
    };
    
    var stateTable = function() {
    
        var reservations = [],
            state;
            
            
        var variableCandidates = ['\u01AA', '\u018D', '\u0283', '\u03BE'];
        this.variable = null;
        
        this.reserve = function(name) {
            reservations.push(name);
        };
        
        this.resetState = function() {
            state = {};
            reservations = _.sortBy(reservations, function(r) {  return Math.random(); });
            this.variable = variableCandidates[Math.floor(Math.random() * variableCandidates.length)];
        };
        
        this.getReference = function(name) {
            var idx = _.indexOf(reservations, name);
            return this.variable + '[' + numbers.getSymbolic(idx) + ']';
        };
        
        this.setState = function(name, val) {
            var idx = _.indexOf(reservations, name);
            state[idx] = val;
        };
        
        this.writeAll = function() {
            var js = '';
            
            for(var i = 0; i < reservations.length; i++) {
                if(state[i] === null || state[i] === undefined) {
                    continue;
                }
                js += this.variable + '[' + numbers.getSymbolic(i) + ']=' + state[i] + ';';
            }
            
            return js;
        };
        
    };
    
    module.writeUtilities = function() {
        var js = '';
        
        js += 'function(){';
        
        js += '};';
    };
    
    module.writeUnpacker = function() {
        var variables = new variableMap();
            variables.make('payload', 'key', 'eval', 'i', 'j', 'chars', 'block', 'cipherBlock', 'result', 'lastBlockLength');
        
        
        var js = '';
        
        // The first three arguments are the required parameters
        js += 'function(#payload,#key,#eval,#i,#j,#chars,#block,#cipherBlock,#result,#lastBlockLength){';
        js += 'for(' +
                // Initialise i = 1, result = '', lastBlockLength=payload[0]
                '#i=+!!#payload,#result=[]+[],#lastBlockLength=#payload[0];' +
                '#i<#payload[' + stateTable.getReference('strLength') + '];' +
                '#i++){';
        js += '#cipherBlock=#block=#payload[#i];';
        js += '#block=#block^#key;';
        // Calculate the number of characters in this block
        js += '#chars=(#i-#payload[' + stateTable.getReference('strLength') + ']==+!#payload)' +
                '?#lastBlockLength' +
                ':(' + numbers.getSymbolic(bitpack.packWidth) + ');';
        // Initialise j = 0 and Iterate up to the block length
        js += 'for(#j=+!#key;#j<#chars;#j++){';
        // Get 1 character from the block
        js += '#result+=' + stateTable.getReference('fnFromCharCode') +
                '((#block&(' + numbers.getSymbolic(127) + '))+(' + numbers.getSymbolic(bitpack.charMin) + '));';
        js += '#block=#block>>(' + numbers.getSymbolic(7) + ');';
        js += '}'; // End inner loop
        js += '#key=(#cipherBlock>>(' + numbers.getSymbolic(3) + '))^#key';
        js += '}'; // End outer loop
        js += '#eval(#result)';
        js += '}';
        
        js = variables.substitute(js);
        
        return js;
    };
    
    module.writeEvaluator = function() {
        var variables = new variableMap();
            variables.make('payload', 'key');
        
        
        var js = '';
        
        js += 'function(){';
        
        // Realise items in the state table
        // Get the "toString" string
        js += stateTable.getReference('strToString') + '=';
        js += strings.obscureString('to') + '+('
        js += '((+![])+([]+[])[' + stateTable.getReference('strConstructor') + '])[' + strings.obscureString('substr') + ']';
        js += '(' + numbers.getSymbolic(10) + ',' + numbers.getSymbolic(6) + ')'
        js += ');';
        
        // Map "toString" in to the strings map
        strings.mapToString(stateTable.getReference('strToString'));
        
        // Get the "h" string
        js += stateTable.getReference('strH') + '=(+(' + numbers.getSymbolic(101) + '))[' + stateTable.getReference('strToString') + '](' + numbers.getSymbolic(21) + ')[' + numbers.getSymbolic(1) + '];';
        strings.mapH(stateTable.getReference('strH'));
        
        // Get the "length" string
        js += stateTable.getReference('strLength') + '=' + strings.obscureString('length') + ';';
        
        // Get a reference to the fromCharCode function
        js += stateTable.getReference('fnFromCharCode') + '=' + '([]+[])[' + stateTable.getReference('strConstructor') + '][' + strings.obscureString('fromCharCode')  + '];';
        
        // Call the unpacker
        js += stateTable.getReference('fnUnpack') + '(';
        // unpacker arguments
        js += stateTable.getReference('payload') + ',';
        js += stateTable.getReference('key') + ',';
        // Third argument is the eval function
        js += '(';
        // Get the function constructor from array.join.constructor
        js += '([][' + strings.obscureString('join') + '][' + stateTable.getReference('strConstructor') + '])';
        // Call the function constructor to create the function 'return this', and evaluate it immediately
        js += '(' + strings.obscureString('return this') + ')' + '())'
        // Extract the eval function from the global object
        js += '[' + strings.obscureString('eval') + ']';
        // End argyments to the unpacker
        js += ')';
        js += '}';
        
        js = variables.substitute(js);
        
        return js;
    };
    
    module.generateRuntime = function(payload) {
        initialise();
        
        stateTable.resetState();
        stateTable.setState('strH', null);
        stateTable.setState('strLength', null);
        stateTable.setState('strConstructor', strings.obscureString('constructor'));
        stateTable.setState('strToString', null);
        stateTable.setState('fnFromCharCode', null);
        stateTable.setState('fnUnpack', module.writeUnpacker());
        stateTable.setState('fnEvalute', module.writeEvaluator());
        
        var key = bitpack.randomKey();
        var packed = _.map(bitpack.pack(payload, key), function(n) { return numbers.getSymbolic(n); });
        packed = '[' + packed.join(',') + ']';
        
        stateTable.setState('payload', packed);
        stateTable.setState('key', numbers.getSymbolic(key));
        
        var js = '';
        
        js += '(function(' + stateTable.variable + '){';
        js += stateTable.writeAll();
        js += stateTable.getReference('fnEvalute') + '()';
        js += '})({});';
        
        return js;
    };
    
    return module;

});
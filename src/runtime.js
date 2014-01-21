var ConfoundJS = ConfoundJS || {};
ConfoundJS.runtime = (function() {
    
    var numbers = ConfoundJS.numbers, strings = ConfoundJS.strings, bitpack = ConfoundJS.bitpack;
    
    if(!Promise) { throw "runtime: a required dependency, Promise.js, was not found." };
    if(!_) { throw "runtime: a required dependency, underscore.js, was not found." };
    if(!numbers) { throw "runtime: a required dependency, ConfoundJS.numbers, was not found." };
    if(!strings) { throw "runtime: a required dependency, ConfoundJS.strings, was not found." };
    if(!bitpack) { throw "runtime: a required dependency, ConfoundJS.bitpack, was not found." };
    
    var module = {};
    
    var initialise = function() {
        if(module.initialised) { return };
        module.initialised = true;
        
        strings.resetTransients();
        
        stateTable = new stateTable();
        
        stateTable.reserve('strH');
        stateTable.reserve('strM');
        stateTable.reserve('strV');
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
    
    module.writeFunctionConstructor = function() {
        var pathways = [
            '[]["join"]["constructor"]',
            '[]["shift"]["constructor"]',
            '[]["unshift"]["constructor"]',
            '[]["sort"]["constructor"]',
            '[]["concat"]["constructor"]',
            '[]["slice"]["constructor"]',
            //'[]["find"]["constructor"]', // Browser Support?
            '[]["some"]["constructor"]', // Browser Support?
            '[]["filter"]["constructor"]', // Browser Support?
            '[]["reduce"]["constructor"]', // Browser Support?
            '[]["toString"]["constructor"]',
            '[]["valueOf"]["constructor"]',
            '({})["toString"]["constructor"]',
            '({})["valueOf"]["constructor"]',
            '(/./)["test"]["constructor"]',
            '(/./)["toString"]["constructor"]',
            '(/./)["valueOf"]["constructor"]',
            '(![])["toString"]["constructor"]',
            '(![])["valueOf"]["constructor"]',
            '(+![])["toString"]["constructor"]',
            '(+![])["valueOf"]["constructor"]'
        ];
        
        // Choose a random pathway
        var path = pathways[Math.floor(Math.random() * pathways.length)];
        
        // Replace strings in the pathway with their obscured equivalents
        path = path.replace(/"([a-zA-Z]+)"/g, function(match, innerString) {
            // Special cases for strings in our state table
            if(innerString === 'constructor') { return stateTable.getReference('strConstructor'); }
            if(innerString === 'toString') { return stateTable.getReference('strToString'); }
            if(innerString === 'length') { return stateTable.getReference('strLength'); }
            
            return strings.obscureString(innerString);
        });
        
        return '(' + path + ')';
    };
    
    module.writeUnpacker = function() {
        var variables = new variableMap();
            variables.make('payload', 'key', 'i', 'j', 'chars', 'block', 'cipherBlock', 'result', 'lastBlockLength');
        
        
        var js = '';
        
        // The first three arguments are the required parameters
        js += 'function(#payload,#key,#i,#j,#chars,#block,#cipherBlock,#result,#lastBlockLength){';
        js += 'for(' +
                // Initialise i = 1, result = '', lastBlockLength=payload[0]
                '#i=+!!#payload,#result=[]+[],#lastBlockLength=#payload[+![]];' +
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
                '(#block&(' + numbers.getSymbolic(127) + '));';
        js += '#block=#block>>(' + numbers.getSymbolic(7) + ');';
        js += '}'; // End inner loop
        js += '#key=(#cipherBlock>>(' + numbers.getSymbolic(3) + '))^#key';
        js += '}'; // End outer loop
        
        // Get the function constructor from array.join.constructor
        js += module.writeFunctionConstructor();
        // Call the function constructor
        // Try to "hide" the passing of the result to the eval
        js += '(#lastBlockLength==#payload[+![]]?#result:#key)'
        // Call the resulting function immediately
        js += '();';
        // Noop at the end of the function so the final statement isn't an eval
        js += '#payload=![]';
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
        // Generate the "toString" string
        js += stateTable.getReference('strToString') + '=';
        js += strings.obscureString('to') + '+('
        // ((+![])+([]+[])['constructor']).substr(10, 6); == "String"
        js += '((+![])+([]+[])[' + stateTable.getReference('strConstructor') + '])[' + strings.obscureString('substr') + ']';
        js += '(' + numbers.getSymbolic(10) + ',' + numbers.getSymbolic(6) + ')'
        js += ');';
        
        // Map "toString" in to the strings map
        strings.mapToString(stateTable.getReference('strToString'));
        
        // Generate the "h" string
        js += stateTable.getReference('strH') + '=(' + numbers.getSymbolic(17) + ')[' + stateTable.getReference('strToString') + '](' + numbers.getSymbolic(36) + ');';
        strings.mapSingle('h', stateTable.getReference('strH'));
        
        // Generate the "m" string
        js += stateTable.getReference('strM') + '=(' + numbers.getSymbolic(22) + ')[' + stateTable.getReference('strToString') + '](' + numbers.getSymbolic(36) + ');';
        strings.mapSingle('m', stateTable.getReference('strM'));
        
        // Generate the "v" string
        js += stateTable.getReference('strV') + '=(' + numbers.getSymbolic(31) + ')[' + stateTable.getReference('strToString') + '](' + numbers.getSymbolic(36) + ');';
        strings.mapSingle('v', stateTable.getReference('strV'));
        
        // Generate the "length" string
        js += stateTable.getReference('strLength') + '=' + strings.obscureString('length') + ';';
        
        // Get a reference to the fromCharCode function
        js += stateTable.getReference('fnFromCharCode') + '=' + '([]+[])[' + stateTable.getReference('strConstructor') + '][' + strings.obscureString('fromCharCode')  + '];';
        
        // Invoke the unpacker
        js += stateTable.getReference('fnUnpack');
        // unpacker arguments
        js += '(' + stateTable.getReference('payload') + ',';
        js += stateTable.getReference('key') + ')';
        js += '}';
        
        js = variables.substitute(js);
        
        return js;
    };
    
    module.generateRuntime = function(options) {
    
        return new Promise(function(resolve, reject) {
        
            var WORK_INTERVAL = 20;
            var key, packed, encoded, js, i;
            
            function beforeEncode() {
                options.onProgress('Generating the runtime decoder');
                initialise();
                
                stateTable.resetState();
                stateTable.setState('strH', null);
                stateTable.setState('strM', null);
                stateTable.setState('strV', null);
                stateTable.setState('strLength', null);
                stateTable.setState('strConstructor', strings.obscureString('constructor'));
                stateTable.setState('strToString', null);
                stateTable.setState('fnFromCharCode', null);
                // Generate the evaluator before the unpacker
                stateTable.setState('fnEvalute', module.writeEvaluator());
                stateTable.setState('fnUnpack', module.writeUnpacker());
                
                key = bitpack.randomKey();
                
                packed = bitpack.pack(options._payload, key);
                encoded = [];
                i = 0;
                
                setTimeout(encodeBlock, WORK_INTERVAL);
            }
            
            function encodeBlock() {
                encoded.push(numbers.getSymbolic(packed[i], options));
                i++;
                
                options.onProgress('Encoding block: ' + i + ' of ' + packed.length);
                
                if(i === packed.length) {
                    setTimeout(afterEncode, WORK_INTERVAL);
                    return;
                }
                
                setTimeout(encodeBlock, WORK_INTERVAL);
            }
            
            function afterEncode() {
                encoded = '[' + encoded.join(',') + ']';
                
                options.onProgress('Assembling the runtime');
                
                stateTable.setState('payload', encoded);
                stateTable.setState('key', numbers.getSymbolic(key, options));
                
                js = '';
                
                js += '(function(' + stateTable.variable + '){';
                js += stateTable.writeAll();
                js += stateTable.getReference('fnEvalute') + '()';
                js += '})({});';
                
                options._payload = js;
                resolve(options);
            }
            
            beforeEncode();
        
        });
    };
    
    return module;

})();
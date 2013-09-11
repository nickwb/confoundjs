define(['underscore'], function(_) {

    var BASE_MAP_SIZE = 200;
    
    var module = {};

    var exp = {},
        map = {},
        bestStrategy = {};
        
    var ADD = '+', SUBTRACT = '-', MULTIPLY = '*', DIVIDE = '/';
    var operatorPrecedence = {};
    
    _.each([DIVIDE, MULTIPLY, ADD, SUBTRACT], function(o, i) {
        operatorPrecedence[o] = i + 1;
    });

    // In lieu of a mature class system, an inheritance mechanism for expressions
    exp.create = function(ctor) {
        ctor.prototype = new exp.base();
        
        return function() {
            var result = Object.create(ctor.prototype);
            ctor.apply(result, arguments);
            return result;
        };
    };

    // The base expression from which all others are derived
    exp.base = function() {
        this.getType = function() { throw 'Must override'; }
        this.build = function() { throw 'Must override'; }
        this.isAutoParenthesis = function() { return false; };
        this.isAssociative = function() { return true; };
        this.getOperatorPrecedence = function() { return 0; };
    };

    // A unit expression, either 0 or 1, created by coercing
    // an array literal between Array, Number and Boolean types.
    // All expression trees are comprised of at least one unit expression.
    exp.unit = exp.create(function(val) {
        this.getOperatorPrecedence = function() { return operatorPrecedence[ADD]; };
        this.getType = function() { return 'unit'; }
        this.build = function(opts) {
            opts = opts || {};
            if(val === 0) return '+[]';
            if(val === 1) return opts.coerce ? '+!+[]' : '!+[]';
            throw 'Invalid Unit';
        };
    });

    // A binary expression which supports addition, subtraction, multiplication and division.
    // Most of the power of the efficiency of the number system is derived from these binary expressions.
    exp.binary = exp.create(function(left, op, right) {
        
        this.getType = function() { return 'binary'; }
        this.getOperatorPrecedence = function() { return operatorPrecedence[op]; };
        this.isAssociative = function() { return op === ADD || op === MULTIPLY };
        
        this.build = function(opts) {
            opts = opts || {};
            
            // Map each operand if necessary
            var leftExpr = (typeof left === 'number') ? exp.map(left) : left,
                rightExpr = (typeof left === 'number') ? exp.map(right) : right;
            
            // Only the left operand needs to be explicitly coerced to a number,
            // and only addition (as it can be confused with concatenation).
            var leftCoerce = opts.coerce && (op === ADD),
                rightCoerce = false;
            
            // Determine if each sub-expression requires parenthesis.
            // Parenthesis are required if our operation is not associative,
            // or the operation at the root of the sub-tree is not associative,
            // or our operator precedence will change the meaning of the expression.
            var leftRequiresParenthesis =   !this.isAssociative()
                                            || !leftExpr.isAssociative(leftCoerce, op)
                                            || this.getOperatorPrecedence() < leftExpr.getOperatorPrecedence();
                                            
            var rightRequiresParenthesis =  !this.isAssociative()
                                            || !rightExpr.isAssociative(rightCoerce, op)
                                            || this.getOperatorPrecedence() < rightExpr.getOperatorPrecedence();
            
            
            // Build each sub-expression
            var leftSymbolic = leftExpr.build( { coerce: leftCoerce } ),
                rightSymbolic = rightExpr.build( { coerce: rightCoerce } );
                
            // Apply parenthesis if necessary
            if(leftRequiresParenthesis && !leftExpr.isAutoParenthesis(true)) {
                leftSymbolic = '(' + leftSymbolic + ')';
            }
            
            if(rightRequiresParenthesis && !rightExpr.isAutoParenthesis(false)) {
                rightSymbolic = '(' + rightSymbolic + ')';
            }
            
            return leftSymbolic + op + rightSymbolic;
        };
    });

    // The concat expression abuses coercion between Arrays and Strings, and Strings to numbers. 
    // It is a little known fact that single element arrays can be coerced to strings (e.g., ['a'] + 'b' == 'ab').
    // We can use this to form numbers one decimal digit at a time (e.g., [1]+[0]+[0] == '100')
    // It is an excellent general case, capable of representing any number, provided that it has at least two digits.
    // It is also an efficient representation in many cases, although it's complexity does scale linearly with
    // the number of decimal digits in the number.
    exp.concat = exp.create(function(val) {
        this.isAutoParenthesis = function(isLeft) { return isLeft; };
        this.isAssociative = function(isCoerced, outerOperator) { return !isCoerced && outerOperator !== ADD; };
        this.getType = function() { return 'concat'; }
        
        this.build = function(opts) {
            opts = opts || {};
            
            var digits = String(val).split(''),
                parts = [],
                result,
                i;
                
            for(i = 0; i < digits.length; i++) {
                parts.push( '[' + exp.map( Number(digits[i]) ).build({ coerce: true }) + ']' );
            }
            
            result = '(' + parts.join('+') + ')';
            if(opts.coerce) {
                result = '+' + result;
            }
            
            return result;
        };
    });
    
    // An expression proxy. The expression will be lazily initialised once any method is called.
    exp.lazy = exp.create(function(val) {
        var memo = null;
        var init = function() {
            !map[val] && exp.chooseBest(val);
            memo = map[val];
        };
        
        this.isAutoParenthesis = function(isLeft) { init(); return memo.isAutoParenthesis(isLeft);  };
        this.isAssociative = function(isCoerced, outerOperator) { init(); return memo.isAssociative(isCoerced, outerOperator); };
        this.getType = function() { init(); return memo.getType(); };
        this.build = function(opts) { init(); return memo.build(opts); };
    });
    
    // Get the expression for a value from the map, or return a lazily initialised proxy if it doesn't exist.
    exp.map = function(val) {
        return map[val] || exp.lazy(val);
    };

    exp.chooseBest = function(value, options) {
    
        var defaults = {
            maxPasses: 5,
            skipLarger: false,
            missingFilter: function(v) { return v <= 10000; }
        };
        
        options = _.extend({}, defaults, options);
    
        var missingMapping = [];
    
        var pass = function(val) {
        
            var winner = null, smallest = Number.POSITIVE_INFINITY, count = 0;
            var trySolution = function(name, expr) {
                var built = expr.build({ coerce: true }),
                    len = built.length;
                    
                if(len < smallest) {
                    smallest = len;
                    winner = { name: name, expr: expr };
                }
                
                count++;
            };
            
            trySolution('concat', exp.concat(val));
            
            var isCandidate = function(n) {
                n = +n;
                if(n < 0 || Math.floor(n) !== Math.ceil(n)) {
                    return false;
                }
                
                return true;
            };
            
            var expand = function(val) {
                var existing = map[val];
                if(existing) {
                    return existing;
                }
                
                missingMapping.push(val);
                return exp.concat(val);
            }
            
            var i, a, b;
            
            var max = Math.min(Math.ceil(val / 2), BASE_MAP_SIZE);
            for(i = 1; i <= max; i++) {
                a = i;  
                // val = a + b
                b = val - a;
                if(isCandidate(b)) {
                    // Sometimes the coercion is more efficient by swapping the operands
                    trySolution(val + '=' + a + '+' + b, exp.binary(expand(a), ADD, expand(b))); 
                    trySolution(val + '=' + b + '+' + a, exp.binary(expand(b), ADD, expand(a))); 
                }
            }
            
            max = Math.ceil(Math.sqrt(val));
            for(i = 1; i <= max; i++) {
                a = i;
                // val = a * b
                b = val / a;
                if(isCandidate(b)) {
                    trySolution(val + '=' + a + '*' + b, exp.binary(expand(a), MULTIPLY, expand(b)));
                }
            }
            
            if(!options.skipLarger) {
                max = val + BASE_MAP_SIZE;
                for(i = val + 1; i <= max; i++) {
                    a = i;
                    // val = a - b
                    b = -(val - a);
                    if(isCandidate(b)) {
                        trySolution(val + '=' + a + '-' + b, exp.binary(expand(a), SUBTRACT, expand(b))); 
                    }
                }
                
                max = BASE_MAP_SIZE;
                for(i = 2; i <= max; i++) {
                    b = i;        
                    // val = a / b
                    a = val * b;
                    if(isCandidate(b)) {
                        trySolution(val + '=' + a + '/' + b, exp.binary(expand(a), DIVIDE, expand(b))); 
                    }
                }
            }
            
            bestStrategy[val] = winner.name;
            return winner.expr;
        };
        
        for(var i = 0; i < options.maxPasses; i++) {
            map[value] = pass(value);
            missingMapping = _.uniq(_.filter(missingMapping, options.missingFilter));
            
            if(missingMapping.length === 0) {
                break;
            }
            
            var temp;
            missingMapping = [];
            _.each(temp, function(v) {
                map[v] = pass(v);
            });
        }
        
        return { missing: missingMapping };
    };

    var isInitialised = false;
    
    var initialiseMap = function() {
        if(isInitialised) { return };
        isInitialised = true;
        
        map[0] = exp.unit(0);
        map[1] = exp.unit(1);
        map[2] = exp.binary(1, ADD, 1);
        map[3] = exp.binary(1, ADD, 2);
        map[4] = exp.binary(2, ADD, 2);
        map[5] = exp.binary(10, DIVIDE, 2);
        map[6] = exp.binary(3, MULTIPLY, 2);
        map[7] = exp.binary(10, SUBTRACT, 3);
        map[8] = exp.binary(10, SUBTRACT, 2);
        map[9] = exp.binary(10, SUBTRACT, 1);
        map[10] = exp.concat(10);
        
        // Start by filling out the base map in a strictly incrementing fashion,
        // ignoring any candidates involving larger numbers.
        for(var i = 11; i <= BASE_MAP_SIZE; i++) {
            exp.chooseBest(i, { maxPasses: 1, skipLarger: true });
        }
        
        // Perform a second pass, this time considering larger candidates
        for(var i = 11; i <= BASE_MAP_SIZE; i++) {
            exp.chooseBest(i, { maxPasses: 1 });
        }

    };
    
    module.getSymbolic = function(val) {
        initialiseMap();
    
        var symbolic = exp.map(val).build( { coerce: true } ),
            validator = new Function('return (' + symbolic + ');');
        
        if(validator() !== val) {
            throw 'Symbolic representation did not match expected value.';
        }
        
        console.log(bestStrategy[val] || 'N/A');
        
        return symbolic;
    };
    
    module.test = function() {
        initialiseMap();
        
        var pad = function(direction, input, width) {
            input = String(input);
            while(input.length < width) {
                input = (direction === 'left') ? (' ' + input) : (input + ' ');
            }
            return input;
        };
        var padLeft = _.partial(pad, 'left');
        var padRight = _.partial(pad, 'right');
        
        var total = 0;
        for(var i = 0; i <= BASE_MAP_SIZE; i++) {
            var symbolic = exp.map(i).build( { coerce: true } );
            var validator = new Function('return (' + symbolic + ');');
            var evaluated = validator();
            total += symbolic.length;
            
            var strategy = (bestStrategy[i] || 'N/A');
            
            var info = padLeft(i, 3) + '=' + padRight(evaluated, 3) + ' ' + padLeft(symbolic.length, 2) + 'chars. ' + padRight(strategy, 11) + ' ' + symbolic;
            
            if((i === evaluated)) {
                console.log(info);
            } else {
                console.log('FAIL ' + info);
            }
        }
        console.log('TOTAL: ' + total + ' chars.'); 
    };   
    
    return module;
});
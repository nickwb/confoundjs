define(['underscore'], function(_) {

    var BASE_MAP_SIZE = 200;
    
    var module = {};

    var exp = {},
        map = {};
        
    var ADD = '+', SUBTRACT = '-', MULTIPLY = '*', DIVIDE = '/';
    var operatorPrecedence = {};
    
    // Create a map of the operator precedence
    _.each([DIVIDE, MULTIPLY, ADD, SUBTRACT], function(o, i) {
        operatorPrecedence[o] = i + 1;
    });

    // A simple class system
    var klass = function(base, ctor) {
        if(arguments.length === 1) {
            ctor = base;
            base = Object;
        }
        
        ctor.prototype = new base();
        
        return function() {
            var result = Object.create(ctor.prototype);
            ctor.apply(result, arguments);
            return result;
        };
    };

    // The base expression from which all others are derived
    exp.base = klass(function() {
        this.build = function() { throw 'Must override'; }
    });
    
    var def = function(val, d) {
        return (val !== undefined) ? val : d;
    };
    
    exp.buildParams = klass(function(opts) {
        var self = this;
        
        this.coerce = def(opts.coerce, false);
        this.isRoot = def(opts.isRoot, false);
        this.depth = def(opts.depth, 0);
        this.isBinaryOperand = def(opts.isBinaryOperand, false);
        this.isLeftOperand = def(opts.isLeftOperand, false);
        this.parentOperator = def(opts.parentOperator, null);
        
        this.createChild = function(opts) {
            opts.depth = def(opts.depth, self.depth + 1);
            opts.isBinaryOperand = def(opts.isBinaryOperand, self.isBinaryOperand);
            return exp.buildParams(opts);
        };
    });
    
    exp.buildResult = klass(function() {
        var self = this;
        
        this.type = null;
        this.numeric = null;
        this.symbolic = '';
        this.strategy = '';
        this.leafiness = 0;
        this.isAtomic = false;
        this.isAssociative = true;
        this.operatorPrecedence = 0;
        this.containsConcat = false;
        this.hasParenthesis = false;
    });

    // A unit expression, either 0 or 1, created by coercing
    // an array literal between Array, Number and Boolean types.
    // All expression trees are comprised of at least one unit expression.
    exp.unit = klass(exp.base, function(val) {
        this.getType = function() { return 'unit'; }
        this.build = function(params) {
            if(val === 0 || val === 1) {
                var s;
                if(val === 0) { s = '+[]'; }
                if(val === 1) { s = params.coerce ? '+!+[]' : '!+[]'; }
                
                var result = exp.buildResult();
                result.type = 'unit';
                result.symbolic = s;
                result.strategy = 'unit_' + val;
                result.numeric = val;
                result.isAtomic = true;
                
                return result;
            }
            throw 'Invalid Unit';
        };
    });

    // A binary expression which supports addition, subtraction, multiplication and division.
    // Most of the power of the efficiency of the number system is derived from these binary expressions.
    exp.binary = klass(exp.base, function(left, op, right) {
        
        var self = this;
        
        var myPrecedence = operatorPrecedence[op];
        var myAssociativity = (op === ADD || op === MULTIPLY);
        
        var doesNeedParenthesis = function(expr, params, result) {
            // If the operand is truly atomic, it won't need any parenthesis
            if(result.isAtomic) {
                return false;
            }
            
            // Parenthesis are required if our operation is not associative,
            // or the operation at the root of the sub-tree is not associative,
            // or our operator precedence will change the meaning of the expression.
            return  !myAssociativity
                    || !result.isAssociative
                    || myPrecedence < result.operatorPrecedence;
        };
        
        var evaluateNumeric = function(leftOperand, rightOperand) {
            if(op === ADD)          return leftOperand + rightOperand;
            if(op === SUBTRACT)     return leftOperand - rightOperand;
            if(op === MULTIPLY)     return leftOperand * rightOperand;
            if(op === DIVIDE)       return leftOperand / rightOperand;
        };
        
        var makeChildParams = function(params, isLeft) {
            // Only the left operand needs to be explicitly coerced to a number,
            // and only addition (as it can be confused with concatenation).     
            var shouldCoerce = isLeft && params.coerce && op === ADD;
            
            return params.createChild({
                coerce: shouldCoerce,
                isBinaryOperand: true,
                isLeftOperand: isLeft,
                parentOperator: op
            });
        };
        
        this.build = function(params) {
            
            var binaryResult = exp.buildResult();
            
            // Map each operand if necessary
            var leftExpr = (typeof left === 'number') ? exp.map(left) : left,
                rightExpr = (typeof left === 'number') ? exp.map(right) : right;
            
            // Create child parameters for each sub-expression
            var leftParams = makeChildParams(params, true),
                rightParams = makeChildParams(params, false);
                
            // Build each sub-expression
            var leftResult = leftExpr.build(leftParams),
                rightResult = rightExpr.build(rightParams);
            
            // Determine if each sub-expression requires parenthesis.
            var leftRequiresParenthesis = doesNeedParenthesis(leftExpr, leftParams, leftResult); 
            var rightRequiresParenthesis = doesNeedParenthesis(rightExpr, rightParams, rightResult); 
            
            if(leftResult.type === 'unit' && rightResult.type === 'concat' && op === ADD) {
                leftRequiresParenthesis = true;
            }
                
            // Apply parenthesis if necessary
            if(leftRequiresParenthesis && !leftResult.hasParenthesis) {
                leftResult.symbolic = '(' + leftResult.symbolic + ')';
            }
            
            if(rightRequiresParenthesis && !rightResult.hasParenthesis) {
                rightResult.symbolic = '(' + rightResult.symbolic + ')';
            }
            
            binaryResult.numeric = evaluateNumeric(leftResult.numeric, rightResult.numeric);
            binaryResult.strategy = String(leftResult.numeric) + op + String(rightResult.numeric);
            binaryResult.symbolic = leftResult.symbolic + op + rightResult.symbolic;
            binaryResult.operatorPrecedence = myPrecedence;
            binaryResult.isAssociative = myAssociativity;
            binaryResult.containsConcat = leftResult.containsConcat || rightResult.containsConcat;
            binaryResult.leafiness = 1 + Math.max(leftResult.leafiness, rightResult.leafiness);
            
            return binaryResult;
        };
    });

    // The concat expression abuses coercion between Arrays and Strings, and Strings to numbers. 
    // It is a little known fact that single element arrays can be coerced to strings (e.g., ['a'] + 'b' == 'ab').
    // We can use this to form numbers one decimal digit at a time (e.g., [1]+[0]+[0] == '100')
    // It is an excellent general case, capable of representing any number, provided that it has at least two digits.
    // It is also an efficient representation in many cases, although it's complexity does scale linearly with
    // the number of decimal digits in the number.
    exp.concat = klass(exp.base, function(val) {
        
        this.build = function(params) {
        
            var digits = String(val).split(''),
                parts = [],
                result = exp.buildResult(),
                childParams,
                symbolic,
                i;
                
            for(i = 0; i < digits.length; i++) {
                childParams = params.createChild({ coerce: true });
                parts.push( exp.map( Number(digits[i]) ).build(childParams) );
            }
            
            // Build the symbolic representation
            symbolic = _.map(parts, function(r) { return '[' + r.symbolic + ']'; });
            symbolic = '(' + symbolic.join('+') + ')';
            if(params.coerce) {
                symbolic = '+' + symbolic;
            }
            
            
            result.type = 'concat';
            result.symbolic = symbolic;
            result.numeric = val;
            result.strategy = 'concat_' + val;
            result.leafiness = 1 + _.reduce(parts, function(max, r) { return Math.max(r.leafiness, max); }, 0);
            result.containsConcat = true;
            result.isAssociative = params.isCoerced === false && params.parentOperator !== ADD;
            result.hasParenthesis = params.isLeftOperand;
            result.isAtomic = result.hasParenthesis;
            
            return result;
        };
    });
    
    // An expression proxy. The expression will be lazily initialised once any method is called.
    exp.lazy = klass(exp.base, function(val) {
        var memo = null;
        var init = function() {
            !map[val] && exp.chooseBest(val);
            memo = map[val];
        };
        this.build = function(params) { init(); return memo.build(params); };
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
            var trySolution = function(expr) {
                var built = expr.build(exp.buildParams({ coerce: true })),
                    len = built.symbolic.length;
                    
                if(len < smallest) {
                    smallest = len;
                    winner = { name: built.strategy, expr: expr };
                }
                
                count++;
            };
            
            trySolution(exp.concat(val));
            
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
                    trySolution(exp.binary(expand(a), ADD, expand(b))); 
                    trySolution(exp.binary(expand(b), ADD, expand(a))); 
                }
            }
            
            max = Math.ceil(Math.sqrt(val));
            for(i = 1; i <= max; i++) {
                a = i;
                // val = a * b
                b = val / a;
                if(isCandidate(b)) {
                    trySolution(exp.binary(expand(a), MULTIPLY, expand(b)));
                }
            }
            
            if(!options.skipLarger) {
                max = val + BASE_MAP_SIZE;
                for(i = val + 1; i <= max; i++) {
                    a = i;
                    // val = a - b
                    b = -(val - a);
                    if(isCandidate(b)) {
                        trySolution(exp.binary(expand(a), SUBTRACT, expand(b))); 
                    }
                }
                
                max = BASE_MAP_SIZE;
                for(i = 2; i <= max; i++) {
                    b = i;        
                    // val = a / b
                    a = val * b;
                    if(isCandidate(b)) {
                        trySolution(exp.binary(expand(a), DIVIDE, expand(b))); 
                    }
                }
            }
            
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
    
        var result = exp.map(val).build(exp.buildParams({ coerce: true })),
            symbolic = result.symbolic,
            validator = new Function('return (' + symbolic + ');');
        
        if(validator() !== val) {
            throw 'Symbolic representation did not match expected value.';
        }
        
        console.log(result.strategy);
        
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
            var result = exp.map(i).build(exp.buildParams({ coerce: true }));
            var symbolic = result.symbolic;
            var validator = new Function('return (' + symbolic + ');');
            var evaluated = validator();
            total += symbolic.length;
            
            var strategy = result.strategy;
            
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
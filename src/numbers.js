var _ = require('underscore');

var BASE_MAP_SIZE = 100;
var ADD_SUBTRACT_WINDOW = 100;
var DIVIDE_WINDOW = 20;
var STRONG_ADD_SUBTRACT_CANDIDATE_THRESHOLD = 20;
var MAX_SAFE_INT = Math.pow(2, 31) - 1;

var numbers = {};

var exp = {},
    map = {};
    
var ADD = '+', SUBTRACT = '-', MULTIPLY = '*', DIVIDE = '/', LSHIFT = '<<', RSHIFT = '>>';
var operatorPrecedence = {};

// Create a map of the operator precedence
_.each([DIVIDE, MULTIPLY, ADD, SUBTRACT, LSHIFT, RSHIFT], function(o, i) {
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

// A binary expression which supports addition, subtraction, multiplication, division and left/right shifts.
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
        if(op === LSHIFT)       return leftOperand << rightOperand;
        if(op === RSHIFT)       return leftOperand >> rightOperand;
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
        
        // Re-use the left result object
        var binaryResult = leftResult;
        
        binaryResult.type = 'binary';
        binaryResult.strategy = String(leftResult.numeric) + op + String(rightResult.numeric);
        binaryResult.numeric = evaluateNumeric(leftResult.numeric, rightResult.numeric);
        binaryResult.symbolic = leftResult.symbolic + op + rightResult.symbolic;
        binaryResult.leafiness = 1 + Math.max(leftResult.leafiness, rightResult.leafiness);
        binaryResult.isAtomic = false;
        binaryResult.isAssociative = myAssociativity;
        binaryResult.operatorPrecedence = myPrecedence;
        binaryResult.hasParenthesis = false;
        
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

    if(val < 10) {
        throw 'Concat expressions require at least two digits.';
    }
    
    this.build = function(params) {
    
        var digits = String(val).split(''),
            maxLeafiness = 0,
            symbolic = '',
            result,
            childParams,
            part,
            i;
            
        for(i = 0; i < digits.length; i++) {
            if(i !== 0) { symbolic += '+'; }
            childParams = params.createChild({ coerce: true });
            part = exp.map( Number(digits[i]) ).build(childParams);
            symbolic += '[' + part.symbolic + ']';
            maxLeafiness = Math.max(maxLeafiness, part.leafiness);
            
            // Reuse the final result object
            result = part;
        }
        
        symbolic = '(' + symbolic + ')';
        
        var coerce = params.coerce ||
                     (params.isBinaryOperand && params.isLeftOperand && params.parentOperator === ADD);
                     
        if(coerce) {
            symbolic = '+' + symbolic;
        }
        
        result.type = 'concat';
        result.numeric = val;
        result.symbolic = symbolic;
        result.strategy = 'concat_' + val;
        result.leafiness = 1 + maxLeafiness;
        result.isAtomic = result.hasParenthesis;
        result.isAssociative = coerce === false && params.parentOperator !== ADD;
        result.operatorPrecedence = 0;
        result.hasParenthesis = params.isLeftOperand;
        
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

var isInteger = function(v) {
    return v === +v && v === (v|0); 
};

exp.chooseBest = function(value, options) {

    var defaults = {
        skipLarger: false,
        deepSearch: true
    };
    
    options = _.extend({}, defaults, options);        
    
    if(value < 11) { throw "Values 0-10 are always hard-coded."; }

    var winner, smallest, count;
    var trySolution = function(expr) {
        var built = expr.build(exp.buildParams({ coerce: true })),
            len = built.symbolic.length;
            
        if(len < smallest) {
            smallest = len;
            winner = { name: built.strategy, expr: expr };
        }
        
        count++;
    };
    
    var isCandidate = function(n) {
        n = +n;
        if(n < 0 || !isInteger(n)) {
            return false;
        }
        
        return true;
    };
    
    var missingMapping = [null],
        isStrongExpansionCandidate = false,
        searchDepth = 1;
    
    var expand = function(val) {
        val = +val;
        if(val < 0) { throw "Invalid Expansion."; }
    
        var existing = map[val];
        if(existing) {
            return existing;
        }
        
        if(isStrongExpansionCandidate) {
            missingMapping.push(val);
        }
        
        return exp.concat(val);
    }
    
    var originalQuery = value;
    
    var i, a, b;
    
    while(true) {
        // Reset the best candidates
        winner = null, smallest = Number.POSITIVE_INFINITY, count = 0;
        
        trySolution(exp.concat(value));            
        
        var max = Math.min(Math.ceil(value / 2), ADD_SUBTRACT_WINDOW);
        for(i = 1; i <= max; i++) {                
            a = i;
            isStrongExpansionCandidate = (searchDepth === 1 && (a < STRONG_ADD_SUBTRACT_CANDIDATE_THRESHOLD));
            
            // value = a + b
            b = value - a;
            if(isCandidate(b)) {
                // Sometimes the coercion is more efficient by swapping the operands
                trySolution(exp.binary(expand(a), ADD, expand(b))); 
                trySolution(exp.binary(expand(b), ADD, expand(a))); 
            }
        }
        
        max = Math.ceil(Math.sqrt(value));
        for(i = 1; i <= max; i++) {
            a = i;
            // value = a * b
            b = value / a;
            if(isCandidate(b)) {
                // Multiplications and shifts are our most efficient representations,
                // so complete expansion is encouraged
                isStrongExpansionCandidate = (searchDepth <= 2);
                
                trySolution(exp.binary(expand(a), MULTIPLY, expand(b)));
                
                // value = a << b
                b = Math.log(b)/Math.log(2);
                if(isCandidate(b)) {
                    trySolution(exp.binary(expand(a), LSHIFT, expand(b)));
                }
                
                // Multiplications are commutative but shifts are not
                // value = b << a
                b = value / a;
                a = Math.log(a)/Math.log(2);
                if(isCandidate(a)) {
                   trySolution(exp.binary(expand(b), LSHIFT, expand(a)));
                }
                
                isStrongExpansionCandidate = false;
            }
        }
        
        if(!options.skipLarger) {            
            max = value + ADD_SUBTRACT_WINDOW;
            for(i = value + 1; i <= max; i++) {
                a = i;
                
                // value = a - b
                b = -(value - a);
                isStrongExpansionCandidate = searchDepth === 1 && (b < STRONG_ADD_SUBTRACT_CANDIDATE_THRESHOLD);
                
                if(isCandidate(b)) {
                    trySolution(exp.binary(expand(a), SUBTRACT, expand(b))); 
                }
            }
            
            max = DIVIDE_WINDOW;
            for(i = 2; i <= max; i++) {                    
                b = i;        
                // value = a / b
                a = value * b;
                
                // Rounding errors
                if(a > MAX_SAFE_INT) { break; }
                
                trySolution(exp.binary(expand(a), DIVIDE, expand(b))); 
                
                // value = a >> b
                b = Math.log(b)/Math.log(2);
                if(isCandidate(b)) {
                    trySolution(exp.binary(expand(a), RSHIFT, expand(b)));
                }
            }
        }
        
        map[value] = winner.expr;
        
        // Don't attempt deep searches?
        if(options.deepSearch === false) {
            break;
        }
        
        // Nothing left?
        if(missingMapping.length === 0) {
            break;
        }
        
        value = missingMapping.shift();
        
        if(value === null) {
            searchDepth++;
            
            // We're at the end of the mappings at this depth level.
            // If searchDepth is greater than two then we have evaluated at least
            // one additional candidate for the original query.
            // In this case, we should re-evaluate the original query to see if it
            // can now be represented more efficiently.
            if(missingMapping.length === 0) {
                if(searchDepth > 2) {
                    // NB: while loop will break after the next iteration as missingMapping.length === 0
                    value = originalQuery;
                    continue;
                } else {
                    break;
                }
            } else {
                // Organise the next depth level
                missingMapping = _.uniq(missingMapping);
                missingMapping.push(null);
            }
            
            // We pulled a null off the list so pull again
            value = missingMapping.shift();
        }
    }
    
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
    map[5] = exp.binary(10, RSHIFT, 1);
    map[6] = exp.binary(3, LSHIFT, 1);
    map[7] = exp.binary(10, SUBTRACT, 3);
    map[8] = exp.binary(10, SUBTRACT, 2);
    map[9] = exp.binary(10, SUBTRACT, 1);
    map[10] = exp.concat(10);
    
    // Start by filling out the base map in a strictly incrementing fashion,
    // ignoring any candidates involving larger numbers.
    for(var i = 11; i <= BASE_MAP_SIZE; i++) {
        exp.chooseBest(i, { skipLarger: true });
    }
    
    // Perform a second pass, this time considering larger candidates
    for(var i = 11; i <= BASE_MAP_SIZE; i++) {
        exp.chooseBest(i);
    }
};

numbers.canGetSymbolic = function(val) {
    return isInteger(val) && Math.abs(val) < MAX_SAFE_INT;
};

numbers.getSymbolic = function(val, options) {
    options = options || { optimalNumbers: true };

    if(!isInteger(val) || Math.abs(val) > MAX_SAFE_INT) {
        throw 'Only integers less than ' + MAX_SAFE_INT + ' are supported.';
    }
    
    var shouldNegate = false;
    if(val < 0) {
        shouldNegate = true;
        val = val * -1;
    }

    if(options.onProgress) {
        options.onProgress('Initialising number map.');
    }
    
    initialiseMap();
    
    var result = map[val];
    
    if(!result) {
        exp.chooseBest(val, { deepSearch: options.optimalNumbers });
        result = map[val];
    }
    
    result = result.build(exp.buildParams({ coerce: true }));
    
    var symbolic = result.symbolic,
        validator = new Function('return (' + symbolic + ');');
    
    if(validator() !== val) {
        throw 'Symbolic representation did not match expected value.';
    }
    
    if(shouldNegate) {
        symbolic = '-(' + symbolic + ')';
    }
    
    return symbolic;
};

numbers.test = function() {
    var testStart = new Date();
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
    
    var testTime = new Date().getTime() - testStart.getTime();
    console.log('Test Time: ' + testTime + 'ms');
};

numbers.expandBaseMap = function(done) {

    if(BASE_MAP_SIZE >= 1000) { return false; }
    
    var EXPANSION_RATE = 50;
    var WORK_RATE = 10;
    var WORK_INTERVAL = 150;
    
    initialiseMap();

    var target = BASE_MAP_SIZE + EXPANSION_RATE,
        i;
        
    console.log('Numbers: opportunistically expanding base map to: ' + target);
        
    function firstPass() {
    
        i = BASE_MAP_SIZE + 1;
        
        var doBlockOfWork = function() {
            var z = Math.min(i + WORK_RATE, target);
            for(; i <= z; i++) {
                exp.chooseBest(i, { skipLarger: true });
            }
            
            if(i >= target) {
                setTimeout(secondPass, WORK_INTERVAL);
                return;
            }
            
            setTimeout(doBlockOfWork, WORK_INTERVAL);
        };
        
        setTimeout(doBlockOfWork, WORK_INTERVAL);
    }
    
    function secondPass() {
        i = 11;
        var doBlockOfWork = function() {
            var z = Math.min(i + WORK_RATE, target);
            for(; i <= z; i++) {
                exp.chooseBest(i);
            }
            
            if(i >= target) {
                BASE_MAP_SIZE = target;
                done();
                return;
            }
            
            setTimeout(doBlockOfWork, WORK_INTERVAL);
        };
        
        setTimeout(doBlockOfWork, WORK_INTERVAL);
    }
    
    firstPass();
};

module.exports = numbers;
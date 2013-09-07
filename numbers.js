
var exp = {},
    map = {};

exp.create = function(ctor) {
    ctor.prototype = new exp.base();
    
    return function() {
        var result = Object.create(ctor.prototype);
        ctor.apply(result, arguments);
        return result;
    };
};

exp.base = function() {
    this.isAutoParenthesis = function() { return false; };
};

exp.unit = exp.create(function(val) {
    this.build = function(opts) {
        opts = opts || {};
        if(val === 0) return '+[]';
        if(val === 1) return opts.coerce ? '+!+[]' : '!+[]';
        throw 'Invalid Unit';
    };
});

var PLUS = '+', MINUS = '-', MULTIPLY = '*', DIVIDE = '/';

exp.binary = exp.create(function(left, op, right) {
    if(typeof left === 'number') {
        left = exp.map(left);
    }
    if(typeof right === 'number') {
        right = exp.map(right);
    }
    
    this.build = function(opts) {
        opts = opts || {};
        
        var isAddition = (op === PLUS);
        
        var l = left.build( { coerce: isAddition && opts.coerce } ),
            r = right.build( { coerce: false } );
        
        if(isAddition) {
            return l + op + r;
        } else {
            l = left.isAutoParenthesis() ? l : ( '(' + l + ')' );
            r = right.isAutoParenthesis() ? r : ( '(' + r + ')' );
            return l + op + r;
        }
    };
});

exp.concat = exp.create(function(val) {
    this.isAutoParenthesis = function() { return true; };
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

exp.map = exp.create(function(val) {
    var get = function() {
        if(map[val] === undefined) {
            map[val] = exp.best(val);
        }
        
        return map[val];
    };

    this.isAutoParenthesis = function() { return get().isAutoParenthesis(); };
    this.build = function(opts) {
        opts = opts || {};
        return get().build(opts);
    };
});

exp.best = function(val) {
    
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
    
    var simpleValue = function(val) {
        return map[val] || exp.concat(val);
    }
    
    var i, a, b;
    
    var max = Math.ceil(val / 2);
    for(i = 1; i <= max; i++) {
        a = i;  
        // val = a + b
        b = val - a;
        if(isCandidate(b)) {
            // Sometimes the coercion is more efficient by swapping the operands
            trySolution(val + ' = ' + a + ' + ' + b, exp.binary(a, PLUS, b)); 
            trySolution(val + ' = ' + b + ' + ' + a, exp.binary(b, PLUS, a)); 
        }
    }
    
    max = Math.ceil(Math.sqrt(val));
    for(i = 1; i <= max; i++) {
        a = i;
        // val = a * b
        b = val / a;
        if(isCandidate(b)) {
            trySolution(val + ' = ' + a + ' * ' + b, exp.binary(simpleValue(a), MULTIPLY, simpleValue(b)));
        }
    }
    
    max = val + 100;
    for(i = val + 1; i <= max; i++) {
        a = i;
        // val = a - b
        b = -(val - a);
        if(isCandidate(b)) {
            trySolution(val + ' = ' + a + ' - ' + b, exp.binary(simpleValue(a), MINUS, simpleValue(b))); 
        }
    }
    
    max = val * 4;
    for(i = val + 1; i <= max; i++) {
        a = i;        
        // val = a / b
        b = a / val;
        if(isCandidate(b)) {
            trySolution(val + ' = ' + a + ' / ' + b, exp.binary(simpleValue(a), DIVIDE, simpleValue(b))); 
        }
    }
    
    console.log('Best for ' + val  +' from ' +  count + ': ' + winner.name);
    return winner.expr;
};


var initialiseMap = function() {
    map[0] = exp.unit(0);
    map[1] = exp.unit(1);
    map[2] = exp.binary(1, PLUS, 1);
    map[3] = exp.binary(1, PLUS, 2);
    map[4] = exp.binary(2, PLUS, 2);
    map[5] = exp.binary(10, DIVIDE, 2);
    map[6] = exp.binary(3, MULTIPLY, 2);
    map[7] = exp.binary(10, MINUS, 3);
    map[8] = exp.binary(10, MINUS, 2);
    map[9] = exp.binary(10, MINUS, 1);
    map[10] = exp.concat(10);


    for(var i = 0; i < 3; i++) {
        for(var j = 11; j <= 100; j++) {
            map[j] = exp.best(j);
        }
    }
};


(function() {
    initialiseMap();
    var total = 0;
    for(var i = 0; i <= 100; i++) {
        var e = exp.map(i).build( { coerce: true } );
        var f = new Function('return (' + e + ');');
        var v = f();
        total += e.length;
        
        console.log( i + ((i === v) ? '=' : '!=') + v + ' c' + e.length + ' ' + e );
    }
    console.log("TOTAL: c" + total); 
})();

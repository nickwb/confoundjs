
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
            map[val] = exp.concat(val);
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
    var roundBinary = function(val) {
        var max = Math.ceil((val * 4) / 10);
        for(var i = 0; i <= max; i++) {
            for(var j = 0; j <= 4; j++) {
                var operand = (i * 10) + j;
            }
        }
    };
    
    var solutions = [];
    solutions.push(exp.concat(val));
    solutions.push(roundBinary(val));
};

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
map[25] = exp.binary(100, DIVIDE, 4);
map[76] = exp.binary(100, MINUS, 24);
map[77] = exp.binary(100, MINUS, 23);
map[78] = exp.binary(100, MINUS, 22);
map[79] = exp.binary(100, MINUS, 21);
map[95] = exp.binary(100, MINUS, 5);
map[96] = exp.binary(100, MINUS, 4);
map[97] = exp.binary(100, MINUS, 3);
map[98] = exp.binary(100, MINUS, 2);
map[99] = exp.binary(100, MINUS, 1);

(function() {
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


var Promise = require('promise'),
    ugly = require('uglifyjs'),
    numbers = require('../numbers'),
    strings = require('../strings');

var sourcetransform = {};

var AST_ConfoundVariableDefs = ugly.DEFNODE('ConfoundVariableDefs', null, {}, ugly.AST_Var);

var AST_ConfoundString = ugly.DEFNODE('ConfoundString', 'value', {
    $documentation: "A confounding string literal",
    $propdoc: {
        value: "The confounding string"
    }
}, ugly.AST_Constant);

var AST_ConfoundBoolean = ugly.DEFNODE('ConfoundBoolean', 'value', {
    $documentation: "A confounding boolean literal",
    $propdoc: {
        value: "The confounding boolean"
    }
}, ugly.AST_Constant);

var AST_ConfoundNumber = ugly.DEFNODE('ConfoundNumber', 'value', {
    $documentation: "A confounding number literal",
    $propdoc: {
        value: "The confounding number"
    }
}, ugly.AST_Constant);


///////////////////////////////////////////////////////////////////////////
////  Top Level Variables
///////////////////////////////////////////////////////////////////////////
var confoundVariables = [];
var addConfoundVariable = function(vardef, toplevel) {
    
    var defs = toplevel.body.filter(function(x) { return x instanceof AST_ConfoundVariableDefs; });
    
    if(defs.length === 0) {
        defs = new AST_ConfoundVariableDefs({ definitions: [] });
        toplevel.body.unshift(defs);
    } else {
        defs = defs[0];
    }
    
    defs.definitions.push(vardef);
    confoundVariables.push(vardef.name.name);
};

///////////////////////////////////////////////////////////////////////////
////  Re-reference Globals
///////////////////////////////////////////////////////////////////////////
var rereferenceGlobals = new ugly.TreeTransformer(null, function(node) {

    if(node instanceof ugly.AST_Toplevel) {
    
        var globalRef = new ugly.AST_VarDef({
            name: new ugly.AST_SymbolVar({ name: '__confoundjs_global' }),
            value: new ugly.AST_This()
        });
        
        addConfoundVariable(globalRef, node);
    }
    
    if(node instanceof ugly.AST_SymbolRef) {
        var defn = node.thedef;
        if(defn && defn.global && defn.undeclared) {
            return new ugly.AST_Dot({
                property: node.name,
                expression: new ugly.AST_SymbolRef({ name: '__confoundjs_global' })
            });
        }
    }
    
});

///////////////////////////////////////////////////////////////////////////
////  Transform Dot Notations
///////////////////////////////////////////////////////////////////////////
var dotToSub = new ugly.TreeTransformer(null, function(node){

    if(node instanceof ugly.AST_Dot) {
        return new ugly.AST_Sub({
            start: node.start,
            end: node.end,
            expression: node.expression,
            property: new ugly.AST_String({ value: node.property })
        });
    }
    
});


///////////////////////////////////////////////////////////////////////////
////  Lift Strings
///////////////////////////////////////////////////////////////////////////
var stringTable = [],
    stringMap = {};
    
var getStringReference = function(str, node) {
    if(!stringMap[str]) {
        stringMap[str] = stringTable.length;
        stringTable.push(str);
    }
    
    var idx = stringMap[str];
    
    var tableRef = new ugly.AST_SymbolRef({
        name: '__confoundjs_string_table'
    });
    
    var indexVal = new ugly.AST_Number({ value: idx });
    
    return new ugly.AST_Sub({
        start: node.start,
        end: node.end,
        expression: tableRef,
        property: indexVal
    });
};

var stringLifter = new ugly.TreeTransformer(null, function(node){
    if (node instanceof ugly.AST_Toplevel) {
        
        var tableElms = [];
        
        for(var i = 0; i < stringTable.length; i++) {
            tableElms.push( new ugly.AST_String({ value: stringTable[i] }) );
        }
        
        var table = new ugly.AST_VarDef({
            name: new ugly.AST_SymbolVar({ name: '__confoundjs_string_table' }),
            value: new ugly.AST_Array({ elements: tableElms })
        });
        
        addConfoundVariable(table, node);
        
        return node;
    }
    if (node instanceof ugly.AST_String) {
        return getStringReference(node.getValue(), node);
    }
});

///////////////////////////////////////////////////////////////////////////
////  Transform Strings
///////////////////////////////////////////////////////////////////////////
var stringTransformer = new ugly.TreeTransformer(null, function(node){
    if (node instanceof ugly.AST_String) {
        return new AST_ConfoundString({ value: strings.obscureString(node.getValue()) });
    }
});

///////////////////////////////////////////////////////////////////////////
////  Transform Booleans
///////////////////////////////////////////////////////////////////////////
var makeBoolean = function(b, node) {
    b = !!b;
    return new AST_ConfoundBoolean({
        value: b ? '!![]' : '![]',
        start: node.start,
        end: node.end
    });
};

var alternateBooleans = new ugly.TreeTransformer(null, function(node){
    if (node instanceof ugly.AST_UnaryPrefix) {
        if(node.operator === "!" && node.expression instanceof ugly.AST_Number) {
            return makeBoolean(!node.expression.getValue(), node);
        }
    }
    if(node instanceof ugly.AST_Boolean) {
        return makeBoolean(node.getValue(), node);
    }
});

///////////////////////////////////////////////////////////////////////////
////  Transform Numbers
///////////////////////////////////////////////////////////////////////////
var numberRequiresParenthesis = function(parent, stack) {
    if(parent instanceof ugly.AST_Sub) { return false; }
    if(parent instanceof ugly.AST_VarDef) { return false; }
    if(parent instanceof ugly.AST_ObjectProperty) { return false; }
    if(parent instanceof ugly.AST_Array) { return false; }
    if(parent instanceof ugly.AST_Conditional) { return false; }
    
    return true;
};

var shouldUseOptimalNumbers = true;

var numberTransformer = new ugly.TreeTransformer(null, function(node){
    if (node instanceof ugly.AST_Number) {
        if(numbers.canGetSymbolic(node.getValue())) {
            var options = {optimalNumbers: shouldUseOptimalNumbers},
                symbolic = numbers.getSymbolic(node.getValue(), options),
                parent = numberTransformer.parent(),
                stack = numberTransformer.stack;
            
            // Assignments, element of array, object property
            if(numberRequiresParenthesis(parent, stack)) {
                symbolic = '(' + symbolic + ')';
            }
            
            return new AST_ConfoundNumber({
                start: node.start,
                end: node.end,
                value: symbolic
            });
        }
    }
});

///////////////////////////////////////////////////////////////////////////
////  Source Transformation
///////////////////////////////////////////////////////////////////////////
var reset = function() {
    confoundVariables = [];
    stringTable = [];
    stringMap = {};
};

sourcetransform.doTransform = function (options) {
    return new Promise(function(resolve, reject) {
    
        var tasks = [];
        
        var step = function(describe, fn) {
            tasks.push({ describe: describe, fn: fn });
        };
        
        var transform = function(describe, xform) {
            step(describe, function() { ast = ast.transform(xform); });
        };
        
        var WORK_INTERVAL = 20;
        
        var process = function() {
            var item = tasks.shift();
            
            var run = function() {
                item.fn();
                if(tasks.length > 0) {
                    setTimeout(process, 0);
                }
            };
            
            options.onProgress(item.describe);
            setTimeout(run, WORK_INTERVAL);
        };
        
        reset();
        var ast;
        
        var do_calculate_scope = function() { ast.figure_out_scope(); };
        
        step('Parsing payload', function() { ast = ugly.parse(options._payload); });            
        step('Calculating scope', do_calculate_scope);
        
        if(options.minifySource) {
            transform('Minifying', ugly.Compressor());
        }
        
        if(options.rereferenceGlobals) {
            transform('Re-referencing Globals', rereferenceGlobals);
        }
        
        if(options.transformDotNotation) {
            transform('Transforming dot notations', dotToSub);
        }
        
        if(options.liftStrings) {
            transform('Lifting strings', stringLifter);
        }
        
        if(options.transformStrings) {
            transform('Transforming strings', stringTransformer);
        }
        
        if(options.transformBooleans) {
            transform('Transforming booleans', alternateBooleans);
        }
        
        if(options.transformNumbers) {
            shouldUseOptimalNumbers = options.optimalNumbers;
            transform('Obscuring numbers', numberTransformer);
        }            
        
        step('Calculating scope', do_calculate_scope);
        
        if(options.mangleVariables) {
            step('Mangling variables', function() {
                // Make any confound variables non-global
                for(var i = 0; i < confoundVariables.length; i++) {
                    ast.variables.get(confoundVariables[i]).global = false;
                }
                ast.mangle_names();
            });
        }
        
        step('Generating source', function() {
            options._payload = ast.print_to_string();
            resolve(options);
        });
        
        process();
    });
};

module.exports = sourcetransform;

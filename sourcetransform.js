var ConfoundJS = ConfoundJS || {};
ConfoundJS.sourceTransform = (function() {
    
    var numbers = ConfoundJS.numbers, strings = ConfoundJS.strings;
    var ugly = UglifyJS;
    
    
    var module = {};
    
    
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
    
    var stringTable = [],
        stringMap = {};
        
    var getStringReference = function(str, node) {
        if(!stringMap[str]) {
            stringMap[str] = stringTable.length;
            stringTable.push(str);
        }
        
        var idx = stringMap[str];
        
        var tableRef = new ugly.AST_SymbolRef({
            name: '__counfoundjs_string_table',
        });
        
        var indexVal = new ugly.AST_Number({ value: idx });
        
        return new ugly.AST_Sub({
            start: node.start,
            end: node.end,
            expression: tableRef,
            property: indexVal
        });
    };
    
    var stringTransformer = new ugly.TreeTransformer(null, function(node){
        if (node instanceof ugly.AST_Toplevel) {
            
            var tableElms = [];
            
            for(var i = 0; i < stringTable.length; i++) {
                tableElms.push( new AST_ConfoundString({ value: strings.obscureString(stringTable[i]) }) );
            }
            
            var table = new ugly.AST_Var({
                definitions: [
                    new ugly.AST_VarDef({
                        name: new ugly.AST_SymbolVar({ name: '__counfoundjs_string_table' }),
                        value: new ugly.AST_Array({ elements: tableElms })
                    })
                ]
            });
            
            node.body.unshift(table);
            return node;
        }
        if (node instanceof ugly.AST_String) {
            return getStringReference(node.getValue(), node);
        }
    });
    
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
    
    var numberTransformer = new ugly.TreeTransformer(null, function(node){
        if (node instanceof ugly.AST_Number) {
            if(numbers.canGetSymbolic(node.getValue())) {
                var symbolic = numbers.getSymbolic(node.getValue());
                var parent = numberTransformer.parent();
                
                // Assignments, element of array, object property
                if(!(parent instanceof ugly.AST_Sub)) {
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
    
    var reset = function() {
        stringTable = [];
        stringMap = {};
    };
    
    module.doSourceTransform = function (input) {
        reset();
        var ast = ugly.parse(input);
        
        ast.figure_out_scope();
        
        ast = ast.transform(ugly.Compressor());
        ast = ast.transform(dotToSub);
        ast = ast.transform(stringTransformer);
        ast = ast.transform(alternateBooleans);
        ast = ast.transform(numberTransformer);
        
        ast.figure_out_scope();
        
        // Allow the string table to be mangled
        ast.variables.get('__counfoundjs_string_table').global = false;
        
        ast.mangle_names();
        
        console.log(ast.print_to_string());
    };
    
    return module;

})();
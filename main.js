requirejs.config({
    paths: {
        'underscore': 'lib/underscore'
    },
    shim: {
        'underscore' : { exports: '_' }
    }
});

require(['numbers', 'bitpack'], function(n, b) {
    
    var input = 'Hello this is a test. It is quite a long string.';
    
    var a = b.pack(input);
    console.log(a);
    var fn = 'return unpack([';
    for(var i = 0; i < a.length; i++) {
        fn += n.getSymbolic(a[i]);
        if(i !== a.length - 1) {
            fn += ',';
        }
    }
    fn += ']);';
    
    console.log(fn);
    console.log(fn.length);
    
    var evaluator = new Function('unpack', fn);
    console.log(evaluator(b.unpack));
});

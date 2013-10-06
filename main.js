requirejs.config({
    paths: {
        'underscore': 'lib/underscore'
    },
    shim: {
        'underscore' : { exports: '_' }
    }
});

require(['runtime'], function(runtime) {

    console.log(runtime.generateRuntime("alert('Hello World!');"));
    
});

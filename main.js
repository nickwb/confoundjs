requirejs.config({
    paths: {
        'underscore': 'lib/underscore'
    },
    shim: {
        'underscore' : { exports: '_' }
    }
});

require(['runtime'], function(runtime) {

    var $jsIn = $('#jsInput'),
        $jsOut = $('#jsOutput');

    $('#doConfound').on('click', function(e) {
        e.preventDefault();
        $jsOut.val( runtime.generateRuntime($jsIn.val()) );
    });
    
    $('#doEval').on('click', function(e) {
        e.preventDefault();
        window.eval( $jsOut.val() );
    });
    
});

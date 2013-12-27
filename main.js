
$(function() {

    var $jsIn = $('#jsInput'),
        $jsOut = $('#jsOutput');

    $('#doConfound').on('click', function(e) {
        e.preventDefault();
        $jsOut.val( ConfoundJS.runtime.generateRuntime($jsIn.val()) );
    });
    
    $('#doEval').on('click', function(e) {
        e.preventDefault();
        window.eval( $jsOut.val() );
    });
    
});

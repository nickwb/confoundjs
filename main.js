
$(function() {

    var $jsIn = $('#jsInput'),
        $jsOut = $('#jsOutput');

    $('#doConfound').on('click', function(e) {
        e.preventDefault();
        
        $('#counfoundBtnContainer').slideUp();
        $('#progressInfo').slideDown(doGenerate);
        
        function doGenerate () {
            $jsOut.val( ConfoundJS.runtime.generateRuntime($jsIn.val()) );
            _.defer(function() {
                $('#counfoundBtnContainer').slideDown();
                $('#progressInfo').slideUp();
                
                $('#countInfo strong').text($jsOut.val().length);
                $('#countInfo span').text($jsIn.val().length);
                $('#countInfo').show();
            });
        }
        
    });
    
    $('#doEval').on('click', function(e) {
        e.preventDefault();
        window.eval( $jsOut.val() );
    });
    
});

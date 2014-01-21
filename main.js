
$(function() {

    var $jsIn = $('#jsInput'),
        $jsOut = $('#jsOutput');

    $('#doConfound').on('click', function(e) {
        e.preventDefault();
        
        $('#counfoundBtnContainer').slideUp();
        $('#progressInfo').slideDown(doGenerate);
        
        function doGenerate () {
            var options = {
                optimalNumbers: !!$('#deep-numbers').prop('checked'),
                onProgress: function(status) { $('#progressStatus').text( status ); }
            };
            
            $('#progressStatus').text( 'Building output' );
            
            ConfoundJS.generate($jsIn.val(), options).then(function(result) {
                $jsOut.val(result);
                
                $('#counfoundBtnContainer').slideDown();
                $('#progressInfo').slideUp();
                
                $('#countInfo strong').text(result.length);
                $('#countInfo span').text($jsIn.val().length);
                $('#countInfo').show();
            });

        }
        
    });
    
    $('#doEval').on('click', function(e) {
        e.preventDefault();
        window.eval( $jsOut.val() );
    });
    
    var expandEvery = 30000;
    
    function expandBaseMapWhenIdle() {
        var again = function() { if(!canRepeat) return; setTimeout(expandBaseMapWhenIdle, expandEvery); };
        var canRepeat = !(ConfoundJS.numbers.expandBaseMap(again) === false);
    };
    
    window.setTimeout(expandBaseMapWhenIdle, expandEvery);
    
});

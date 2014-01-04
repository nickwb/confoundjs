
$(function() {

    var $jsIn = $('#jsInput'),
        $jsOut = $('#jsOutput');

    $('#doConfound').on('click', function(e) {
        e.preventDefault();
        
        $('#counfoundBtnContainer').slideUp();
        $('#progressInfo').slideDown(doGenerate);
        
        function onProgress(complete) {
            $('#progressPercent').text( (complete * 100).toFixed(2) + '%' );
        }
        
        function doGenerate () {
            ConfoundJS.numbers.deepSearch = !!$('#deep-numbers').prop('checked');
            ConfoundJS.runtime.generateRuntime($jsIn.val(), onProgress, function(js) {
                $jsOut.val(js);
                
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
    
    var expandEvery = 30000;
    
    function expandBaseMapWhenIdle() {
        var again = function() { if(!canRepeat) return; setTimeout(expandBaseMapWhenIdle, expandEvery); };
        var canRepeat = !(ConfoundJS.numbers.expandBaseMap(again) === false);
    };
    
    window.setTimeout(expandBaseMapWhenIdle, expandEvery);
    
});

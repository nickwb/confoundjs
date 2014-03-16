
$(function() {
    
    if(!window['ConfoundJS']) {
        $('#demo-form').hide();
        return;
    } else {
        $('#needsbuild').hide();
    }
    
    var $jsIn = $('#jsInput'),
        $jsOut = $('#jsOutput');
        
    $('#option-useSourceTransform').on('change', function(e) {
        $('.only-with-st')
            .prop('disabled', !e.target.checked)
            .closest('label')
            .toggleClass('disabled', !e.target.checked);
    }).trigger('change');

    $('#doConfound').on('click', function(e) {
        e.preventDefault();
        
        $('#counfoundBtnContainer').slideUp();
        $('#progressInfo').slideDown(doGenerate);
        
        function doGenerate () {
            
            var checkbox = function(name) { return !!!!$('#option-' + name).prop('checked') };
            
            var options = {
                useSourceTransform: checkbox('useSourceTransform'),
                minifySource: checkbox('minifySource'),
                rereferenceGlobals: checkbox('rereferenceGlobals'),
                transformDotNotation: checkbox('transformDotNotation'),
                liftStrings: checkbox('liftStrings'),
                transformStrings: checkbox('transformStrings'),
                transformBooleans: checkbox('transformBooleans'),
                transformNumbers: checkbox('transformNumbers'),
                mangleVariables: checkbox('mangleVariables'),
                useRuntime: checkbox('useRuntime'),
                optimalNumbers: checkbox('optimalNumbers'),
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

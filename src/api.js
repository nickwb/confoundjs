(function(ConfoundJS) {

    var runtime = ConfoundJS.runtime, sourceTransform = ConfoundJS.sourceTransform;
    
    if(!Promise) { throw "api: a required dependency, Promise.js, was not found." };
    if(!_) { throw "api: a required dependency, underscore.js, was not found." };
    if(!runtime) { throw "api: a required dependency, ConfoundJS.runtime, was not found." };
    if(!sourceTransform) { throw "api: a required dependency, ConfoundJS.sourceTransform, was not found." };
    
    var defaultOptions = {
        useSourceTransform: true,
        minifySource: true,
        rereferenceGlobals: true,
        transformDotNotation: true,
        liftStrings: true,
        transformStrings: true,
        transformBooleans: true,
        transformNumbers: true,
        mangleVariables: true,
        useRuntime: false,
        optimalNumbers: false,
        onProgress: function(status) { }
    };

    ConfoundJS.generate = function(payload, options) {

        options = _.extend({}, defaultOptions, options);
        options._payload = payload;
        
        return new Promise(function(resolve, reject) {
        
            var next = Promise.from(options);
            
            if(options.useSourceTransform) {
                next = next.then(sourceTransform.doTransform, null);
            }
            
            if(options.useRuntime) {                
                next = next.then(runtime.generateRuntime, null);
            }
            
            next.then(function(options) { resolve(options._payload); }, reject);
        });
    };
    
})(ConfoundJS || {});
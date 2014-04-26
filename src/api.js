var Promise = require('promise'),
    _ = require('underscore'),
    numbers = require('./numbers'),
    strings = require('./strings'),
    bitpack = require('./bitpack'),
    runtime = require('./runtime'),
    sourceTransform = require('./sourceTransform');

var ConfoundJS = {
    numbers: numbers,
    strings: strings,
    bitpack: bitpack,
    sourceTransform: sourceTransform
};

var optionsMap = ConfoundJS.options = {};

ConfoundJS.generate = function(payload, options) {

    var defaultOptions = {};
    _.each(optionsMap, function(v, k) {
        defaultOptions[k] = v.defaultValue;
    });
    
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

var outputSize = ConfoundJS.outputSize = { smaller: -1, similar: 0, larger: 1 };
var outputObfuscation = ConfoundJS.outputObfuscation = { weak: 0, medium: 1, strong: 2, extreme: 3 };

var warnIfNotDefault = function(opts, key, item) {
     return (opts[key] !== undefined && opts[key] !== item.defaultValue);
};

var warnIfNoMangle = function(opts, key, item) {
    return !opts.mangleVariables;
};

var onlyIfSourceTransform = function(opts) {
    return !!opts.useSourceTransform;
};

optionsMap['useSourceTransform'] = {
    type: 'bool',
    defaultValue: true,
    title: 'Use source transform',
    summary: 'Enables the source transforming stage of obfuscator.',
    detail: 'This option has no direct impact on the output, though many other options will require it to be enabled. The source transformer will parse your JavaScript source and then perform a series of transformations on it according to the options chosen. The source transformer is powered by uglifyjs2.',
    outputSize: outputSize.similar,
    outputObfuscation: null,
    warn: 'Disabling the source transformer will encode your input losslessly. Your source code will be very vulnerable to reverse engineering.',
    warnIf: warnIfNotDefault
};

optionsMap['minifySource'] = {
    type: 'bool',
    defaultValue: true,
    title: 'Minify Source',
    summary: 'Shrinks the size of your source code using the uglifyjs2 compressor.',
    detail: 'Equivalent to using the uglifyjs CLI tool with the -c option set. Shrinking the size of your source code will minimise the total amount of code which will need to be obfuscated. The option is highly recommended unless your source has already been minified.',
    outputSize: outputSize.smaller,
    outputObfuscation: outputObfuscation.medium,
    onlyIf: onlyIfSourceTransform
};

optionsMap['rereferenceGlobals'] = {
    type: 'bool',
    defaultValue: true,
    title: 'Re-reference globals',
    summary: 'Takes global variables and re-references them as properties of the root object.',
    detail: 'For example, document.createElement() can be re-written as root.document.createElement(). If "Transform dot notations" is enabled, then this becomes root["document"]["createElement"]. These strings can be further obfuscated with the "Lift strings" and "Transform strings" options.',
    outputSize: outputSize.similar,
    outputObfuscation: outputObfuscation.medium,
    onlyIf: onlyIfSourceTransform,
    warn: 'This option should be used with "Mangle variable names" enabled. A new variable will be introduced to your JavaScript code, and no attempt is made to conceal its purpose.',
    warnIf: warnIfNoMangle,
    synergy: ['transformDotNotation', 'liftStrings', 'transformStrings']
};

optionsMap['transformDotNotation'] = {
    type: 'bool',
    defaultValue: true,
    title: 'Transform dot notations',
    summary: 'Converts object property access from dot notation to bracket notation.',
    detail: 'For example, Math.max() can be re-written as Math["max"](). The string introduced can be further obfuscated with the "Lift strings" and "Transform strings" options.',
    outputSize: outputSize.similar,
    outputObfuscation: outputObfuscation.medium,
    onlyIf: onlyIfSourceTransform,
    synergy: ['liftStrings', 'transformStrings']
};

optionsMap['liftStrings'] = {
    type: 'bool',
    defaultValue: true,
    title: 'Lift strings',
    summary: 'Lifts all string literals from the source code to a table defined at the beginning.',
    detail: 'A new array is introduced to the beginning of the source code, containing each of the string literals the appear subsequently in the code. The strings in the original code are replaced by array access. Further obfuscation of the strings can be achieved with the "Transform strings" option, and further obfuscation of the array access can be achieved with the "Transform numbers" option.',
    outputSize: outputSize.similar,
    outputObfuscation: outputObfuscation.strong,
    onlyIf: onlyIfSourceTransform,
    warn: 'This option should be used with "Mangle variable names" enabled. A new variable will be introduced to your JavaScript code, and no attempt is made to conceal its purpose.',
    warnIf: warnIfNoMangle,
    synergy: ['transformStrings', 'transformNumbers']
};

optionsMap['transformStrings'] = {
    type: 'bool',
    defaultValue: true,
    title: 'Transform strings',
    summary: 'Obscures string literals to make them difficult to recognise.',
    detail: 'String literals are converted to an equivalent expression, using a jsfuck style "hieroglyphics".',
    outputSize: outputSize.larger,
    outputObfuscation: outputObfuscation.extreme,
    onlyIf: onlyIfSourceTransform,
    synergy: ['liftStrings']
};

optionsMap['transformBooleans'] = {
    type: 'bool',
    defaultValue: true,
    title: 'Transform booleans',
    summary: 'Obscures boolean literals to make them difficult to recognise.',
    detail: 'Boolean literals are converted to array coercions, ![] for true and !![] for false.',
    outputSize: outputSize.similar,
    outputObfuscation: outputObfuscation.strong,
    onlyIf: onlyIfSourceTransform
};

optionsMap['transformNumbers'] = {
    type: 'bool',
    defaultValue: true,
    title: 'Transform numbers',
    summary: 'Obscures number literals to make them difficult to recognise.',
    detail: 'confoundjs can obscure integer number literals by constructing an expression tree from a series of coercions, numeric arithmetic, and bitwise operations.',
    outputSize: outputSize.larger,
    outputObfuscation: outputObfuscation.extreme,
    onlyIf: onlyIfSourceTransform,
    synergy: ['liftStrings']
};

optionsMap['mangleVariables'] = {
    type: 'bool',
    defaultValue: true,
    title: 'Mangle variable names',
    summary: 'Replaces all variable names in the JavaScript source.',
    detail: 'Equivalent to using the uglifyjs CLI tool with the -m option set. All variable names will be replaced with shortened names.',
    outputSize: outputSize.smaller,
    outputObfuscation: outputObfuscation.strong,
    onlyIf: onlyIfSourceTransform
};

optionsMap['useRuntime'] = {
    type: 'bool',
    defaultValue: false,
    title: 'Enable the runtime decoder',
    summary: 'JavaScript is decoded/unpacked at runtime.',
    detail: 'Enabling this option will packs and encode your complete JavaScript source - or the output from the source transformer if it is enabled. It emits an obfuscated payload, as well as hand-obfuscated JavaScript used to decode the payload at runtime.',
    outputSize: outputSize.larger,
    outputObfuscation: outputObfuscation.extreme
};

optionsMap['optimalNumbers'] = {
    type: 'bool',
    defaultValue: false,
    title: 'Enable number optimisation',
    summary: 'Spends more time searching for efficient obfuscated number expressions.',
    detail: 'The payload that is decoded by the runtime decoder is obfuscated using numeric expressions. Enabling this option may improve the obfuscation efficiency for some numbers, which can give marginal improvements to the total output size. However, this will make the obfuscation process much slower.',
    outputSize: outputSize.similar,
    outputObfuscation: null
};

optionsMap['onProgress'] = {
    type: 'callback',
    defaultValue: function(status) { },
    title: 'Progress callback',
    summary: 'Recieve periodic status messages as confoundjs progresses through the obfuscation process.',
    detail: 'The callback can accept a single string as an argument. The return value from the callback is ignored.'
};

module.exports = ConfoundJS;
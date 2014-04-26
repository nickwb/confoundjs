var gulp = require('gulp'),
    browserify = require('browserify'),
    uglify = require('gulp-uglifyjs'),
    source = require('vinyl-source-stream'),
    streamify = require('gulp-streamify'),
    concat = require('gulp-concat');


gulp.task('browser', function() {        
    var bundleStream = browserify('./src/browser.js').bundle()

    bundleStream
        .pipe(source('./src/browser.js'))
        .pipe(streamify(uglify()))
        .pipe(streamify(concat('confound.js')))
        .pipe(gulp.dest('./'))
});
    
gulp.task('default', ['browser']);
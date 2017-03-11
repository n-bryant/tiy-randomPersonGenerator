'use strict';

var gulp = require('gulp');
var util = require('gulp-util');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cache = require('gulp-cached');

// keeping track of directories and production value
var config = {
    srcSass: './src/styles/**/*.scss',
    srcJs: './src/js/*.js',
    vendorJs: './src/js/vendor/*.js',
    production: !!util.env.production
      // !! lets the value be false if no production given without being null
};

// sass
gulp.task('sass', function() {
    return gulp.src(config.srcSass)
        .pipe(sass(config.production ? {
            outputStyle: 'compressed'
        } : {}).on('error', sass.logError))
        .pipe(config.production ? concat('main.min.css') : util.noop())
        .pipe(gulp.dest('./lib/styles/'));
});

// js
gulp.task('js', function() {
    gulp.src(config.srcJs)
        .pipe(babel({
            presets: ['es2015']
        }))
        // concat and minify if production
        .pipe(config.production ? concat('app.min.js') : util.noop())
        .pipe(config.production ? uglify() : util.noop())
        .pipe(gulp.dest('./lib/js'));
    // caching the minifying and concatenating of vendor files
    gulp.src(config.vendorJs)
        .pipe(cache('vendor-processing'))
        .pipe(uglify())
        .pipe(concat('vendor.min.js'))
        .pipe(gulp.dest('./lib/js/vendor'));
});

// watching for sass and js changes
gulp.task('watch', function() {
    gulp.watch(config.srcSass, ['sass']);
    gulp.watch(config.srcJs, ['js']);
});

gulp.task('default', ['watch']);

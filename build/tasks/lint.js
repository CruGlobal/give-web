var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

var paths = require('../paths');

gulp.task('lint', function () {
  return gulp.src(paths.sourceIncludingSpecs)
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
});

var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'del', 'vinyl-paths']
});

var paths = require('../paths');

gulp.task('clean', function () {
  return gulp.src([paths.output])
    .pipe($.vinylPaths($.del));
});

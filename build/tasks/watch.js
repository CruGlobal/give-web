var gulp = require('gulp');
var paths = require('../paths');
var browserSync = require('browser-sync');

function changed(event) {
  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
}

gulp.task('suppress-errors', function () {
  global.suppressErrors = true;
});

gulp.task('watch', ['suppress-errors', 'build'], function () {
  gulp.watch([ paths.source ], [ '', browserSync.reload ]).on('change', changed); //Removing the empty string seems to run all tasks...
  gulp.watch([ paths.html ], [ 'html', browserSync.reload ]).on('change', changed);
  gulp.watch([ paths.scssWatch ], [ 'scss' ]).on('change', changed);
});

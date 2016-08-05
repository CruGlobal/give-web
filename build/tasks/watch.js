var gulp = require('gulp');
var paths = require('../paths');
var browserSync = require('browser-sync');

function changed(event) {
  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
}

gulp.task('watch', ['build'], function () {
  gulp.watch([ paths.source ], [ '', browserSync.reload ]).on('change', changed); //Removing the empty string seems to run all tasks...
  gulp.watch([ paths.html ], [ 'html', browserSync.reload ]).on('change', changed);
  gulp.watch([ paths.scss ], [ 'scss' ]).on('change', changed);
});

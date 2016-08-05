var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var paths = require('../paths');

gulp.task('replace', function(){
  return gulp.src('./*.html')
    .pipe($.replaceTask({
      patterns: [
        {
          match: /<!-- build:dev -->(.|\s)*?<!-- endbuild -->/,
          replacement: ''
        },
        {
          match: /<!-- <script src="common.js"><\/script> -->/,
          replacement: '<script src="common.js"></script>'
        },
        {
          match: /<!-- <script src="localDev.js"><\/script> -->/,
          replacement: '<script src="localDev.js"></script>'
        },
        {
          match: /<link rel="stylesheet" type="text\/css" href="dist\/common\/localDev\/main.css">/,
          replacement: '<link rel="stylesheet" type="text/css" href="main.css">'
        }
      ]
    }))
    .pipe(gulp.dest(paths.outputBundles));
});

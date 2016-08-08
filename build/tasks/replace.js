var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var paths = require('../paths');

gulp.task('replace', function(){
  return gulp.src('./index.html')
    .pipe($.replaceTask({
      usePrefix: false,
      patterns: [
        {
          match: '<script src="jspm_packages/system.js"></script>',
          replacement: '<!-- <script src="jspm_packages/system.js"></script> -->'
        },
        {
          match: '<script src="system.config.js"></script>',
          replacement: '<!-- <script src="system.config.js"></script> -->'
        },
        {
          match: '<!-- <script src="main.js?bust={{date}}"></script> -->',
          replacement: '<script src="main.js?bust={{date}}"></script>'
        },
        {
          match: '{{date}}',
          replacement: Math.round(new Date() / 1000)
        }
      ]
    }))
    .pipe(gulp.dest(paths.output));
});

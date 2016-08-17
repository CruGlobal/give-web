var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var paths = require('../paths');

gulp.task('replace', function(){
  return gulp.src('./index.html')
    .pipe($.preprocess({
      context: {
        ENV: 'prod'
      }
    }))
    .pipe($.replaceTask({
      usePrefix: false,
      patterns: [
        {
          match: '{{date}}',
          replacement: Math.round(new Date() / 1000)
        }
      ]
    }))
    .pipe(gulp.dest(paths.output));
});

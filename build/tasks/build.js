var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'run-sequence', 'browser-sync']
});

var paths = require('../paths');

gulp.task('build', function (callback) {
  return $.runSequence(
    ['scss', 'html'],
    callback
  );
});

gulp.task('html', function () {
  return gulp.src(paths.templates)
    .pipe($.plumber())
    //.pipe($.changed(paths.srcDir, { extension: '.html' })) //TODO: fix this. It doesn't work on travis
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.ngHtml2js({
      template: "import angular from 'angular';\n" +
        "export default angular.module('<%= moduleName %>', []).run(($templateCache) => {\n" +
        "   $templateCache.put('<%= template.url %>',\n    '<%= template.prettyEscapedContent %>');\n" +
        "});\n"
    }))
    .pipe(gulp.dest(paths.srcDir));
});

gulp.task('scss', function () {
  return gulp.src(paths.scss)
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.systemjsResolver({systemConfig: './system.config.js'}))
    .pipe($.sass())
    .pipe($.concat('give.css'))
    .pipe($.sourcemaps.write("."))
    .pipe(gulp.dest(paths.output))
    .pipe($.browserSync.reload({ stream: true }));
});

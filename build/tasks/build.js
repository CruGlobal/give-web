var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'run-sequence', 'browser-sync']
});

var paths = require('../paths');
var compilerOptions = require('../babelOptions');

gulp.task('build', function (callback) {
  return $.runSequence(
    'clean',
    ['scss', 'html', 'es6', 'move'],
    callback
  );
});

gulp.task('es6', function () {
  return gulp.src(paths.source, { base: 'src' })
    .pipe($.plumber())
    .pipe($.changed(paths.output, { extension: '.js' }))
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe($.babel(compilerOptions))
    .pipe($.ngAnnotate({
      sourceMap: true,
      gulpWarnings: false
    }))
    .pipe($.sourcemaps.write("/sourcemaps", { sourceRoot: '/src' }))
    .pipe(gulp.dest(paths.output));
});

gulp.task('html', function () {
  return gulp.src(paths.templates)
    .pipe($.plumber())
    .pipe($.changed(paths.output, { extension: '.html' }))
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.ngHtml2js({
      template: "import angular from 'angular';\n" +
        "export default angular.module('<%= moduleName %>', []).run(['$templateCache', function($templateCache) {\n" +
        "   $templateCache.put('<%= template.url %>',\n    '<%= template.prettyEscapedContent %>');\n" +
        "}]);\n"
    }))
    .pipe($.babel(compilerOptions))
    .pipe(gulp.dest(paths.output));
});

gulp.task('scss', function () {
  return gulp.src(paths.scss)
    .pipe($.plumber())
    .pipe($.changed(paths.output, {extension: '.css'}))
    .pipe($.sourcemaps.init())
    .pipe($.systemjsResolver({systemConfig: './system.config.js'}))
    .pipe($.sass())
    .pipe($.sourcemaps.write("."))
    .pipe(gulp.dest(paths.output))
    .pipe($.browserSync.reload({ stream: true }));
});

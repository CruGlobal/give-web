var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'run-sequence', 'systemjs-route-bundler', 'merge-stream']
});

var paths = require('../paths');

gulp.task('cache-bust', function () {
  return gulp.src('dist/app/app.js')
    .pipe($.insert.prepend("window.prod = true;\n"))
    .pipe(gulp.dest('dist/app'));
});

gulp.task('inline-systemjs', function () {
  return gulp.src([
      './jspm_packages/es6-module-loader.js',
      './jspm_packages/system.js',
      './system.config.js'
    ])
    .pipe($.concat('common.js'))
    .pipe(gulp.dest(paths.outputBundles));
});

gulp.task('release', function (callback) {
  return $.runSequence(
    'clean',
    'build',
    'bundle',
    'cache-bust',
    'replace',
    'inline-systemjs',
    'copyCss',
    callback
  );
});

gulp.task('bundle', function () {
  return $.jspmBuild({
      bundles: [
        { src: 'common/localDev/localDev.component',
          dst: 'localDev.js'
        },
        { src: 'app/cart/cart.component',
          dst: 'cart.js'
        },
        { src: 'app/checkout/checkout.component',
          dst: 'checkout.js'
        }
      ]
    })
    .pipe($.uglify())
    .pipe(gulp.dest(paths.outputBundles));
});

gulp.task('copyCss', function () {
  return gulp.src('dist/**/*.css')
    .pipe($.flatten())
    .pipe(gulp.dest(paths.outputBundles));
});

var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'run-sequence', 'systemjs-route-bundler']
});

var paths = require('../paths');

gulp.task('cache-bust', function () {
  var cacheBust = "var systemLocate = System.locate; System.locate = function(load) { var cacheBust = '?bust=' + " + Math.round(new Date() / 1000) +"; return Promise.resolve(systemLocate.call(this, load)).then(function(address) { if (address.indexOf('bust') > -1 || address.indexOf('css') > -1 || address.indexOf('json') > -1) return address; return address + cacheBust; });}\n"
  return gulp.src('dist/app/app.js')
    .pipe($.insert.prepend("window.prod = true;\n"))
    .pipe($.insert.prepend(cacheBust))
    .pipe(gulp.dest('dist/app'));
});

gulp.task('inline-systemjs', function () {
  return gulp.src([
      './jspm_packages/es6-module-loader.js',
      './jspm_packages/system.js',
      './system.config.js',
      'dist/bundles/app.js'
    ])
    //.pipe(uglify())
    .pipe($.concat('bundles/app.js'))
    .pipe(gulp.dest(paths.output));
});

gulp.task('release', function (callback) {
  return $.runSequence(
    'clean',
    'build',
    'bundle',
    'cache-bust',
    //'replace',
    'inline-systemjs',
    callback
  );
});

gulp.task('bundle', function () {
  return $.jspmBuild({
      bundles: [
        { src: 'angular',
          dst: 'app.js'
        },
        { src: 'app/checkout/checkout.component - angular',
          dst: 'checkout.js'
        }
      ],
      bundleOptions: {
        minify: true
      }
    })
    .pipe(gulp.dest('dist/bundles'));
});

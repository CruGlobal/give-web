var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'run-sequence', 'systemjs-route-bundler', 'merge-stream']
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
  var app = gulp.src([
      './jspm_packages/es6-module-loader.js',
      './jspm_packages/system.js',
      './system.config.js',
      'dist/bundles/main.js'
    ])
    //.pipe($.uglify())
    .pipe($.concat('main.js'));

  var bundles = gulp.src([
      './jspm_packages/es6-module-loader.js',
      './jspm_packages/system.js',
      './system.config.js',
      'dist/bundles/common.js'
    ])
    //.pipe($.uglify())
    .pipe($.concat('common.js'));

  return $.mergeStream(app, bundles)
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
    callback
  );
});

gulp.task('bundle', function () {
  var bundles = [
    'app/cart/cart.component',
    'app/checkout/checkout.component'
  ];
  var commonFilesForBundles = bundles.join(' & ');
  return $.jspmBuild({
      bundles: [
        { src: 'app/main/main.component',
          dst: 'main.js'
        },
        { src: commonFilesForBundles,
          dst: 'common.js'
        },
        { src: 'app/cart/cart.component - ' + commonFilesForBundles,
          dst: 'cart.js'
        },
        { src: 'app/checkout/checkout.component - ' + commonFilesForBundles,
          dst: 'checkout.js'
        }
      ]
    })
    .pipe($.uglify())
    .pipe(gulp.dest(paths.outputBundles));
});

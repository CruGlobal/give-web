var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'run-sequence', 'systemjs-route-bundler', 'merge-stream']
});

var paths = require('../paths');

gulp.task('minify-css', function () {
  return gulp.src(paths.outputCss)
    .pipe($.cleanCss())
    .pipe($.concat('give.min.css'))
    .pipe(gulp.dest(paths.output));
});

gulp.task('inline-systemjs', function () {
  var app = gulp.src([
      './jspm_packages/es6-module-loader.js',
      './jspm_packages/system.js',
      './system.config.js',
      'dist/main.js'
    ])
    //.pipe($.uglify())
    .pipe($.concat('main.js'));

  var bundles = gulp.src([
      './jspm_packages/es6-module-loader.js',
      './jspm_packages/system.js',
      './system.config.js',
      'dist/common.js'
    ])
    //.pipe($.uglify())
    .pipe($.concat('common.js'));

  return $.mergeStream(app, bundles)
    .pipe(gulp.dest(paths.output));
});

gulp.task('release', function (callback) {
  return $.runSequence(
    'clean',
    'build',
    ['bundle', 'minify-css', 'replace', 'move'],
    'inline-systemjs',
    callback
  );
});

gulp.task('bundle', function () {
  var bundles = [
    'app/cart/cart.component',
    'app/checkout/checkout.component'
  ];
  var commonFilesForBundles = '(' + bundles.join(' & ') + ')';
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
        },
        { src: 'app/productConfig/productConfig.component - ' + commonFilesForBundles,
          dst: 'productConfig.js'
        },
        { src: 'app/signIn/signIn.component - ' + commonFilesForBundles,
          dst: 'signIn.js'
        }
      ]
    })
    .pipe($.ngAnnotate())
    .pipe($.uglify())
    .pipe(gulp.dest(paths.output));
});

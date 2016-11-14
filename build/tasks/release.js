var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'run-sequence', 'systemjs-route-bundler', 'merge-stream']
});

var paths = require('../paths');

gulp.task('minify-css', function () {
  return gulp.src(paths.outputCss)
    .pipe($.cleanCss({
      keepSpecialComments: 0
    }))
    .pipe($.concat('give.min.css'))
    .pipe(gulp.dest(paths.output));
});

gulp.task('inline-systemjs', function () {
  var app = gulp.src([
      './jspm_packages/es6-module-loader.js',
      './jspm_packages/system-polyfills.js',
      './jspm_packages/system.js',
      './system.config.js',
      'dist/main.js'
    ])
    //.pipe($.uglify())
    .pipe($.concat('main.js'));

  var bundles = gulp.src([
      './jspm_packages/es6-module-loader.js',
      './jspm_packages/system-polyfills.js',
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
    'app/checkout/checkout.component',
    'app/thankYou/thankYou.component',
    'app/productConfig/productConfig.component',
    'app/signIn/signIn.component',
    'app/searchResults/searchResults.component',
    'app/homeSignIn/homeSignIn.component',
    'app/profile/profile.component',
    'app/profile/yourGiving/yourGiving.component',
    'app/profile/receipts/receipts.component',
    'app/profile/payment-methods/payment-methods.component',
    'app/designationEditor/designationEditor.component'
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
        { src: 'app/thankYou/thankYou.component - ' + commonFilesForBundles,
          dst: 'thankYou.js'
        },
        { src: 'app/productConfig/productConfig.component - ' + commonFilesForBundles,
          dst: 'productConfig.js'
        },
        { src: 'app/signIn/signIn.component - ' + commonFilesForBundles,
          dst: 'signIn.js'
        },
        { src: 'app/searchResults/searchResults.component - ' + commonFilesForBundles,
          dst: 'searchResults.js'
        },
        { src: 'app/homeSignIn/homeSignIn.component - ' + commonFilesForBundles,
          dst: 'homeSignIn.js'
        },
        { src: 'app/profile/yourGiving/yourGiving.component - ' + commonFilesForBundles,
          dst: 'yourGiving.js'
        },
        { src: 'app/profile/profile.component - ' + commonFilesForBundles,
          dst: 'profile.js'
        },
        { src: 'app/profile/receipts/receipts.component - ' + commonFilesForBundles,
          dst: 'receipts.js'
        },
        { src: 'app/profile/payment-methods/payment-methods.component - ' + commonFilesForBundles,
          dst: 'paymentMethods.js'
        },
        { src: 'app/designationEditor/designationEditor.component - ' + commonFilesForBundles,
          dst: 'designationEditor.js'
        }
      ]
    })
    .pipe($.ngAnnotate())
    .pipe($.uglify())
    .pipe(gulp.dest(paths.output));
});

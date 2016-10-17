// Karma configuration

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['systemjs', 'jasmine'],

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome','PhantomJS'],
    browserNoActivityTimeout: 30000,

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'coverage'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // list of files / patterns to load in the browser

    files: [
      'node_modules/jasmine-promise-matchers/dist/jasmine-promise-matchers.js',
      'src/**/*.spec.js'
    ],

    systemjs: {
      configFile: 'system.config.js',
      config: {
        transpiler: 'plugin-babel',
        packages: 'jspm_packages',
        paths: {
          "github:*": "/base/jspm_packages/github/*",
          "npm:*": "/base/jspm_packages/npm/*",
          'es6-module-loader': 'node_modules/es6-module-loader/dist/es6-module-loader.js',
          'systemjs': 'node_modules/systemjs/dist/system.js',
          'system-polyfills': 'node_modules/systemjs/dist/system-polyfills.js',
          'phantomjs-polyfill': 'node_modules/phantomjs-polyfill/bind-polyfill.js'
        }
      },

      serveFiles: [
        'jspm_packages/**/*',
        'src/**/*.js',
        'src/**/*.css',
        'dist/**/*.json'
      ]
    },

    proxies: {
      '/test': '/base/test',
      '/src': '/base/src',
      '/node_modules': '/base/node_modules'
    },

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/**/!(*spec|*tpl|*fixture).js': ['babel']
    },

    babelPreprocessor: {
      options: {
        "plugins": [ "__coverage__" ]
      }
    },

    // optionally, configure the reporter
    coverageReporter: {
      type : 'lcov',
      dir : 'coverage/'
    }

  });
};

const path = require('path');
const webpackConfig = require('./webpack.config.js');

delete webpackConfig.entry;
delete webpackConfig.plugins;
delete webpackConfig.devServer;
webpackConfig.module.rules[0].use[0].options.plugins = webpackConfig.module.rules[0].use[0].options.plugins[0];
webpackConfig.devtool = 'inline-source-map';
webpackConfig.module.rules.push({
  test: /^(?!.*\.(spec|fixture)\.js$).*\.js$/,
  include: path.resolve('src/'),
  loader: 'istanbul-instrumenter-loader',
  query: {
    esModules: true
  }
});

module.exports = function(config) {
  config.set({

    singleRun: true,

    frameworks: ['jasmine'],

    browsers: ['PhantomJS'],

    reporters: ['mocha', 'coverage-istanbul'],

    files: [
      'node_modules/jasmine-promise-matchers/dist/jasmine-promise-matchers.js',
      'src/all-tests.spec.js'
    ],

    preprocessors: {
      'src/all-tests.spec.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    coverageIstanbulReporter: {
      reports: [ 'lcov'],
      fixWebpackSourcePaths: true
    },
  });
};

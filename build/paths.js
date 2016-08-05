module.exports = {
  source: ['src/**/*.js', '!**/*.spec.js'],
  html: ['src/**/*.html', '*.html'],
  json: 'src/**/*.json',
  templates: 'src/**/*.html',
  scss: ['src/**/*.scss'],
  output: 'dist/',
  outputBundles: 'dist/bundles',
  outputCss: 'dist/**/*.css',
  tests: 'test/e2e/**/*.spec.js'
};

module.exports = {
  source: ['src/**/*.js', '!**/*.spec.js'],
  html: ['src/**/*.html', 'index.html'],
  json: 'src/**/*.json',
  templates: 'src/**/*.html',
  scss: ['src/**/*.scss'],
  output: 'dist/',
  outputCss: 'dist/**/*.css',
  tests: 'test/e2e/**/*.spec.js'
};

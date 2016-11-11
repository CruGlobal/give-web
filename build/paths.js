module.exports = {
  source: ['src/**/*.js', '!**/*.spec.js', '!**/*.fixture.js'],
  sourceIncludingSpecs: ['src/**/*.js'],
  html: ['src/**/*.html', 'index.html'],
  json: 'src/**/*.json',
  templates: 'src/**/*.html',
  scss: {
    give: ['src/app/**/*.scss', 'src/common/**/*.scss'],
    nav: ['src/assets/scss/styles.scss']
  },
  scssWatch: ['src/**/*.scss'],
  srcDir: 'src/',
  output: 'dist/',
  outputCss: 'dist/**/*.css',
  tests: 'test/e2e/**/*.spec.js'
};

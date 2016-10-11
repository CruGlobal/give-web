var gulp = require('gulp');
var browserSync = require('browser-sync');
var historyApiFallback = require('connect-history-api-fallback');
var proxy = require('proxy-middleware'), url = require('url');

var proxyOptions = url.parse('https://give-stage2.cru.org/bin');
proxyOptions.route = '/bin';

gulp.task('serve', ['watch'], function (done) {
  browserSync({
    open: false,
    port: 9000,
    server: {
      baseDir: ['.'],
      middleware: [
        historyApiFallback({
          rewrites: [
            //redirects all root files ending in .html to index.html excluding test-release.html
            {from: /\/(?!test\-release).+\.html/, to: '/index.html'},
            // Rewrite all requests to /assets to /src/assets
            {from: /^\/assets\/(.*)$/, to: function(context) {
              return '/src/assets/' + context.match[1];
            }}
          ]
        }),
        proxy(proxyOptions)
      ]
    }
  }, done);
});

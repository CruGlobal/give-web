import '@babel/polyfill';
import Loader from './loader';

(function () {
  Loader.start(['vendors~main.js', 'main.js', 'main.css']).then(() => {
    window.setTimeout(() => {
      window.angular.bootstrap(document.body, ['main'], { strictDi: true });
    }, 10);
  });
})();

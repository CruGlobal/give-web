import '@babel/polyfill';
import Loader from './loader';

(function () {
  Loader.start(['vendors~branded~give.js', 'branded.js', 'branded.css']).then(
    () => {
      window.setTimeout(() => {
        window.angular.bootstrap(document.body, ['brandedCheckout'], {
          strictDi: true,
        });
      }, 10);
    },
  );
})();

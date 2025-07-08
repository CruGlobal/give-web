import '@babel/polyfill';
import Loader from './loader';

// Polyfill for IE 9+
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill
(function () {
  if (typeof window.CustomEvent === 'function') return false;

  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: null };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(
      event,
      params.bubbles,
      params.cancelable,
      params.detail,
    );
    return evt;
  }
  window.CustomEvent = CustomEvent;
})();

(function () {
  Loader.start(['vendors~branded~give.js', 'give.js', 'give.css']).then(() => {
    const script = document.getElementById('give-web-script');
    const modules = (
      script.getAttribute('data-modules') || 'productConfig'
    ).split(',');
    window.setTimeout(() => {
      const $injector = window.angular.bootstrap(document.body, modules, {
        strictDi: true,
      });
      $injector.get('analyticsFactory').pageLoaded();
      $injector.get('analyticsFactory').pageReadyForOptimize();
      document.body.dispatchEvent(
        new window.CustomEvent('giveloaded', {
          bubbles: true,
          detail: { $injector },
        }),
      );
    }, 10);
  });
})();

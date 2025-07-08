import angular from 'angular';

const serviceName = 'checkoutService';

class CheckoutService {
  /* @ngInject */
  constructor($window, envService) {
    this.$window = $window;
    this.envService = envService;
  }

  initializeRecaptcha() {
    const script = this.$window.document.createElement('script');
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${this.envService.read('recaptchaKey')}`;
    script.id = 'give-checkout-recaptcha';
    if (!this.$window.document.getElementById(script.id)) {
      this.$window.document.head.appendChild(script);
    }
  }
}

export default angular
  .module(serviceName, [])
  .service(serviceName, CheckoutService);

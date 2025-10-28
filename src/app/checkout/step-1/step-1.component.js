import angular from 'angular';

import contactInfoComponent from 'common/components/contactInfo/contactInfo.component';
import cartService from 'common/services/api/cart.service';

import template from './step-1.tpl.html';

const componentName = 'checkoutStep1';

class Step1Controller {
  /* @ngInject */
  constructor($window, cartService) {
    this.$window = $window;
    this.cartService = cartService;
  }

  onSubmit(success) {
    if (success) {
      this.changeStep({ newStep: 'payment' });
    } else {
      this.submitted = false;
      this.$window.scrollTo(0, 0);
    }
  }

  buildCartUrl() {
    return this.cartService.buildCartUrl();
  }
}

export default angular
  .module(componentName, [contactInfoComponent.name, cartService.name])
  .component(componentName, {
    controller: Step1Controller,
    templateUrl: template,
    bindings: {
      changeStep: '&',
    },
  });

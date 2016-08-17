import 'babel/external-helpers';
import angular from 'angular';
import 'rxjs/add/operator/mergeMap';
import 'angular-gettext';

import appConfig from 'common/app.config';

import step1 from './step-1/step-1.component';
import step2 from './step-2/step-2.component';
import step3 from './step-3/step-3.component';
import thankYou from './thank-you/thank-you.component';
import cartSummary from './cart-summary/cart-summary.component';
import help from './help/help.component';

import cartService from 'common/services/api/cart.service';
import designationsService from 'common/services/api/designations.service';

import template from './checkout.tpl';

let componentName = 'checkout';

class CheckoutController{

  /* @ngInject */
  constructor($window, $log, cartService, designationsService){
    this.$log = $log;
    this.$window = $window;
    this.cartService = cartService;
    this.designationsService = designationsService;

    this.checkoutStep = 'contact';

    this.loadCart();
  }

  changeStep(newStep){
    this.$window.scrollTo(0, 0);
    this.checkoutStep = newStep;
  }

  loadCart(){
    this.cartService.get()
      .subscribe((data) => {
        this.cartData = data;
      });
  }
}

export default angular
  .module(componentName, [
    template.name,
    appConfig.name,
    'gettext',
    step1.name,
    step2.name,
    step3.name,
    thankYou.name,
    help.name,
    cartSummary.name,
    cartService.name,
    designationsService.name
  ])
  .component(componentName, {
    controller: CheckoutController,
    templateUrl: template.name
  });

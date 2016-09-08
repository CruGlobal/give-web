import 'babel/external-helpers';
import angular from 'angular';
import 'rxjs/add/operator/finally';

import appConfig from 'common/app.config';

import step1 from './step-1/step-1.component';
import step2 from './step-2/step-2.component';
import step3 from './step-3/step-3.component';
import cartSummary from './cart-summary/cart-summary.component';
import help from './help/help.component';
import showErrors from 'common/filters/showErrors.filter';

import cartService from 'common/services/api/cart.service';
import designationsService from 'common/services/api/designations.service';
import commonModule from 'common/common.module';

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
    this.loadingCartData = true;

    this.loadCart();
  }

  changeStep(newStep){
    this.$window.scrollTo(0, 0);
    this.checkoutStep = newStep;
  }

  loadCart(){
    this.cartService.get()
      .finally(()=> {
        this.loadingCartData = false;
      })
      .subscribe((data) => {
        this.cartData = data;
      });
  }
}

export default angular
  .module(componentName, [
    commonModule.name,
    template.name,
    appConfig.name,
    step1.name,
    step2.name,
    step3.name,
    help.name,
    cartSummary.name,
    cartService.name,
    designationsService.name,
    showErrors.name
  ])
  .component(componentName, {
    controller: CheckoutController,
    templateUrl: template.name
  });

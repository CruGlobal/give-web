import 'babel/external-helpers';
import angular from 'angular';

import step1 from './step-1/step-1.component';
import step2 from './step-2/step-2.component';
import step3 from './step-3/step-3.component';
import thankYou from './thank-you/thank-you.component';

import cartService from 'common/services/api/cart.service';
import designationsService from 'common/services/api/designations.service';

import template from './checkout.tpl';

let componentName = 'checkout';

class CheckoutController{

  /* @ngInject */
  constructor($log, cartService, designationsService){
    this.$log = $log;
    this.cartService = cartService;
    this.designationsService = designationsService;

    this.checkoutStep = 'contact';

    this.testRequests();
  }

  testRequests(){
    this.designationsService.createSearch('a')
      .then((id) => {
        this.$log.info('search id', id);
        this.designationsService.getSearchResults(id, 1)
          .then((response) => {
            this.$log.info('search page', response.data);
          });
      });

    this.cartService.getDonorDetails()
      .then((data) => {
        this.$log.info('donor details', data);
      });
  }

  changeStep(newStep){
    this.checkoutStep = newStep;
  }

}

export default angular
  .module(componentName, [
    template.name,
    step1.name,
    step2.name,
    step3.name,
    thankYou.name,
    cartService.name,
    designationsService.name
  ])
  .component(componentName, {
    controller: CheckoutController,
    templateUrl: template.name
  });

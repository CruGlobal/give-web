import 'babel/external-helpers';
import angular from 'angular';

import step1 from './step-1/step-1.component';
import step2 from './step-2/step-2.component';
import step3 from './step-3/step-3.component';
import thankYou from './thank-you/thank-you.component';

import apiService from 'common/services/api.service';

import template from './checkout.tpl';
import './checkout.css!';

let componentName = 'checkout';

class CheckoutController{

  /* @ngInject */
  constructor(api, $log){
    api.get('lookups/crugive').then(function(data){
      $log.info(data);
    });
  }

}

export default angular
  .module(componentName, [
    template.name,
    apiService.name,
    step1.name,
    step2.name,
    step3.name,
    thankYou.name
  ])
  .component(componentName, {
    controller: CheckoutController,
    templateUrl: template.name
  });

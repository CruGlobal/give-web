import angular from 'angular';
import 'angular-ui-router';

import step1 from './step-1/step-1.component';

import template from './checkout.tpl';
import './checkout.css!';

let componentName = 'checkout';

class CheckoutController{

  /* @ngInject */
  constructor(){

  }

}

/* @ngInject */
function ConfigureModule($stateProvider){
  $stateProvider.state('checkout', {
    url: '/checkout',
    abstract: true, //TODO: implement default child
    template: '<checkout></checkout>'
  }).state('checkout.step1', {
    url: '/step-1',
    template: '<checkout-step-1></checkout-step-1>'
  });
}

export default angular
  .module(componentName, [
    'ui.router',
    template.name,
    step1.name
  ])
  .config(ConfigureModule)
  .component(componentName, {
    controller: CheckoutController,
    templateUrl: template.name
  });

import angular from 'angular';
import 'angular-ui-router';

import step1 from './step-1/step-1.component';
import step2 from './step-2/step-2.component';
import step3 from './step-3/step-3.component';

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
  }).state('checkout.step2', {
    url: '/step-2',
    template: '<checkout-step-2></checkout-step-2>'
  }).state('checkout.step3', {
    url: '/step-3',
    template: '<checkout-step-3></checkout-step-3>'
  });
}

export default angular
  .module(componentName, [
    'ui.router',
    template.name,
    step1.name,
    step2.name,
    step3.name
  ])
  .config(ConfigureModule)
  .component(componentName, {
    controller: CheckoutController,
    templateUrl: template.name
  });

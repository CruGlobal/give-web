import angular from 'angular';

import cartComponent from 'app/cart/cart.component';
import checkoutComponent from 'app/checkout/checkout.component';

import localDevNav from './nav/local-dev-nav.component';
import localDevTools from './tools/local-dev-tools.component';

let componentName = 'localDev';

export default angular
  .module(componentName, [
    localDevNav.name,
    localDevTools.name,
    cartComponent.name,
    checkoutComponent.name
  ])
  .component(componentName, {
    template: ''
  });

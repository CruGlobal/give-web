import angular from 'angular';
import desigSrc from 'common/directives/desigSrc.directive';
import productModalService from 'common/services/productModal.service';
import template from './historicalGift.tpl';

let componentName = 'historicalGift';

class HistoricalGift {

  /* @ngInject */
  constructor( productModalService ) {
    this.productModalService = productModalService;
  }

  giveNewGift() {
    this.productModalService.configureProduct( this.gift['historical-donation-line']['designation-number'], {amount: 50} );
  }

  manageGift() {
    this.onManageGift({gift: this.gift});
  }
}

export default angular
  .module( componentName, [
    desigSrc.name,
    productModalService.name,
    template.name
  ] )
  .component( componentName, {
    controller:  HistoricalGift,
    templateUrl: template.name,
    bindings:    {
      gift: '<',
      onManageGift: '&'
    }
  } );

import angular from 'angular';
import desigSrc from 'common/directives/desigSrc.directive';
import productModalService from 'common/services/productModal.service';
import template from './historicalGift.tpl.html';

let componentName = 'historicalGift';

class HistoricalGift {

  /* @ngInject */
  constructor( productModalService ) {
    this.productModalService = productModalService;
  }

  giveNewGift() {
    this.productModalService.configureProduct( this.gift['historical-donation-line']['designation-number'] );
  }

  manageGift() {
    this.onManageGift({gift: this.gift});
  }
}

export default angular
  .module( componentName, [
    desigSrc.name,
    productModalService.name
  ] )
  .component( componentName, {
    controller:  HistoricalGift,
    templateUrl: template,
    bindings:    {
      gift: '<',
      onManageGift: '&'
    }
  } );

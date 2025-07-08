import angular from 'angular';
import desigSrc from 'common/directives/desigSrc.directive';
import productModalService from 'common/services/productModal.service';
import analyticsFactory from 'app/analytics/analytics.factory';
import template from './historicalGift.tpl.html';

const componentName = 'historicalGift';

class HistoricalGift {
  /* @ngInject */
  constructor(productModalService, analyticsFactory) {
    this.productModalService = productModalService;
    this.analyticsFactory = analyticsFactory;
  }

  giveNewGift() {
    this.productModalService.configureProduct(
      this.gift['historical-donation-line']['designation-number'],
    );
  }

  manageGift() {
    this.onManageGift({ gift: this.gift });
  }
}

export default angular
  .module(componentName, [
    desigSrc.name,
    productModalService.name,
    analyticsFactory.name,
  ])
  .component(componentName, {
    controller: HistoricalGift,
    templateUrl: template,
    bindings: {
      gift: '<',
      onManageGift: '&',
    },
  });

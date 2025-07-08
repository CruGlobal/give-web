import angular from 'angular';
import 'angular-messages';
import template from './productConfig.tpl.html';
import commonModule from 'common/common.module';
import productModalService from 'common/services/productModal.service';
import modalStateService from 'common/services/modalState.service';
import { giveGiftParams } from './giveGiftParams';
import analyticsFactory from 'app/analytics/analytics.factory';

// include designation edit button component to be included on designation page
import designationEditButtonComponent from '../designationEditButton/designationEditButton.component';

const componentName = 'productConfig';

class ProductConfigController {
  /* @ngInject */
  constructor(productModalService, analyticsFactory, $window, $log) {
    this.productModalService = productModalService;
    this.analyticsFactory = analyticsFactory;
    this.$window = $window;
    this.$log = $log;
  }

  configModal() {
    this.productModalService.configureProduct(
      this.productCode,
      {
        CAMPAIGN_CODE: this.campaignCode,
        'campaign-page': this.campaignPage,
      },
      false,
    );
  }
}

export default angular
  .module(componentName, [
    commonModule.name,
    'ngMessages',
    modalStateService.name,
    productModalService.name,
    designationEditButtonComponent.name,
    analyticsFactory.name,
  ])
  .component(componentName, {
    controller: ProductConfigController,
    templateUrl: template,
    bindings: {
      campaignCode: '@',
      campaignPage: '@',
      productCode: '@',
      describedBy: '@',
      buttonLabel: '@',
      buttonSize: '@',
    },
  })
  // todo: Move config to designation page (individual search result).
  .config(function (modalStateServiceProvider) {
    modalStateServiceProvider.registerModal(
      'give-gift',
      /* @ngInject */
      function ($location, productModalService) {
        const params = $location.search();
        if (
          Object.prototype.hasOwnProperty.call(
            params,
            giveGiftParams.designation,
          )
        ) {
          productModalService.configureProduct(
            params[giveGiftParams.designation],
            null,
            false,
          );
        }
      },
    );
  });

import angular from 'angular';
import map from 'lodash/map';

import displayAddressComponent from 'common/components/display-address/display-address.component';
import displayRateTotals from 'common/components/displayRateTotals/displayRateTotals.component';

import capitalizeFilter from 'common/filters/capitalize.filter';

import commonModule from 'common/common.module';
import orderService from 'common/services/api/order.service';
import profileService from 'common/services/api/profile.service';
import sessionService, {
  SignOutEvent,
} from 'common/services/session/session.service';
import sessionModalService from 'common/services/session/sessionModal.service';
import designationsService from 'common/services/api/designations.service';
import analyticsFactory from 'app/analytics/analytics.factory';

import template from './thankYouSummary.tpl.html';
/* global Image */

const componentName = 'thankYouSummary';

class ThankYouSummaryController {
  /* @ngInject */
  constructor(
    $rootScope,
    $window,
    analyticsFactory,
    envService,
    orderService,
    profileService,
    sessionModalService,
    designationsService,
    $log,
  ) {
    this.$rootScope = $rootScope;
    this.$window = $window;
    this.envService = envService;
    this.orderService = orderService;
    this.profileService = profileService;
    this.sessionModalService = sessionModalService;
    this.designationsService = designationsService;
    this.analyticsFactory = analyticsFactory;
    this.$log = $log;
  }

  $onInit() {
    this.$rootScope.$on(SignOutEvent, (event) => this.signedOut(event));
    this.loadLastPurchase();
    this.loadEmail();
  }

  signedOut(event) {
    if (!event.defaultPrevented) {
      event.preventDefault();
      this.$window.location = '/';
    }
  }

  loadLastPurchase() {
    this.loading = true;
    const lastPurchaseLink = this.orderService.retrieveLastPurchaseLink();
    if (!lastPurchaseLink) {
      this.loadingError = 'lastPurchaseLink missing';
      this.loading = false;
      return;
    }
    this.profileService.getPurchase(lastPurchaseLink).subscribe(
      (data) => {
        this.purchase = data;

        // Map rate totals to match format from order endpoint
        this.rateTotals = map(this.purchase.rateTotals, (rateTotal) => {
          return {
            frequency: rateTotal.recurrence.display,
            total: rateTotal.cost.display,
            amount: rateTotal.cost.amount,
          };
        });
        delete this.loadingError;
        this.loading = false;
        this.onPurchaseLoaded({
          $event: { purchase: this.purchase },
        });

        this.analyticsFactory.pageLoaded();
        this.analyticsFactory.setPurchaseNumber(
          data.rawData['purchase-number'],
        );
        if (!this.envService.read('isBrandedCheckout')) {
          this.analyticsFactory.transactionEvent(this.purchase);
        }
      },
      (error) => {
        this.$log.error(
          'Error loading purchase data for thank you component',
          error,
        );
        this.loadingError = 'api error';
        this.loading = false;
      },
    );
  }

  loadEmail() {
    this.profileService.getEmails().subscribe((data) => {
      this.email = data[0].email;
    });
  }

  loadFacebookPixel(item) {
    if (!item.itemCode || !item.itemCode.code) {
      return;
    }

    const designation = item.itemCode.code;
    const value = item.rate.cost[0].amount;

    this.designationsService.facebookPixel(designation).subscribe((pixelId) => {
      if (!pixelId) {
        return;
      }

      // append FB pixel to page
      const pixel = new Image();
      pixel.src =
        'https://www.facebook.com/tr?id=' +
        pixelId +
        '&ev=Purchase&cd[value]=' +
        value +
        '&cd[currency]=USD';
      pixel.style.display = 'none';

      angular.element(this.$window.document.body).append(pixel);
    });
  }
}

export default angular
  .module(componentName, [
    commonModule.name,
    displayAddressComponent.name,
    displayRateTotals.name,
    capitalizeFilter.name,
    orderService.name,
    profileService.name,
    sessionService.name,
    sessionModalService.name,
    designationsService.name,
    analyticsFactory.name,
  ])
  .component(componentName, {
    controller: ThankYouSummaryController,
    templateUrl: template,
    bindings: {
      onPurchaseLoaded: '&',
    },
  });

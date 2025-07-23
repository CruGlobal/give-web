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
import thankYouService from '../../../common/services/api/thankYou.service';
import analyticsFactory from 'app/analytics/analytics.factory';

import { Observable } from 'rxjs/Observable';

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
    thankYouService,
    $log,
  ) {
    this.$rootScope = $rootScope;
    this.$window = $window;
    this.envService = envService;
    this.orderService = orderService;
    this.profileService = profileService;
    this.sessionModalService = sessionModalService;
    this.designationsService = designationsService;
    this.thankYouService = thankYouService;
    this.analyticsFactory = analyticsFactory;
    this.$log = $log;
    this.STAFF_ORG_ID = '1-TG-11';
  }

  $onInit() {
    this.$rootScope.$on(SignOutEvent, (event) => this.signedOut(event));
    this.loadLastPurchase();
    this.loadEmail();
    this.shouldShowThankYouImage();
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
        this.loadThankYouImage();

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

  shouldShowThankYouImage() {
    if (this.isBrandedCheckout) {
      this.showImage = false;
    }
    return this.thankYouService.shouldShowThankYouImage().subscribe((data) => {
      this.showImage = data;
    });
  }

  loadThankYouImage() {
    this.thankYouService.getThankYouData().subscribe(
      (thankYouData) => {
        this.thankYouImage = thankYouData.defaultImage;
        this.thankYouImageLink = thankYouData.defaultThankYouImageLink;
        const orgIds = new Set();
        const observables = [];

        this.purchase.lineItems.forEach((lineItem) => {
          observables.push(
            this.designationsService.designationData(lineItem.code.code),
          );
        });
        Observable.forkJoin(...observables).subscribe(
          (data) => {
            data.forEach((dataItem) => {
              if (
                dataItem.organizationId &&
                dataItem.organizationId !== this.STAFF_ORG_ID
              ) {
                orgIds.add(dataItem.organizationId);
              }
            });
            if (orgIds.size === 1) {
              const orgId = orgIds.values().next().value;
              this.thankYouService
                .getOrgIdThankYouData(orgId)
                .subscribe((orgIdData) => {
                  this.thankYouImage =
                    orgIdData.thankYouImage || thankYouData.defaultImage;
                  if (this.thankYouImage === orgIdData.thankYouImage) {
                    this.thankYouImageLink = orgIdData.thankYouImageLink;
                  } else {
                    this.thankYouImageLink =
                      thankYouData.defaultThankYouImageLink;
                  }
                });
            }
          },
          (err) => {
            this.$log.error('Error loading image', err);
            this.thankYouImage = thankYouData.defaultImage;
            this.thankYouImageLink = thankYouData.defaultThankYouImageLink;
          },
        );
      },
      (err) => {
        this.$log.error('Error loading image', err);
      },
    );
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
    thankYouService.name,
    analyticsFactory.name,
  ])
  .component(componentName, {
    controller: ThankYouSummaryController,
    templateUrl: template,
    bindings: {
      onPurchaseLoaded: '&',
      isBrandedCheckout: '<',
    },
  });

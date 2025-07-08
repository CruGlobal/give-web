import angular from 'angular';
import keyBy from 'lodash/keyBy';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import RecurringGiftModel from 'common/models/recurringGift.model';
import desigSrc from 'common/directives/desigSrc.directive';
import donationsService from 'common/services/api/donations.service';
import profileService from 'common/services/api/profile.service';
import recipientDetail from './recipientDetail/recipientDetail.component';
import productModalService from 'common/services/productModal.service';
import analyticsFactory from 'app/analytics/analytics.factory';
import template from './recipientGift.tpl.html';
import uibTooltip from 'angular-ui-bootstrap/src/tooltip';

const componentName = 'recipientGift';

class RecipientGift {
  /* @ngInject */
  constructor(
    $log,
    donationsService,
    profileService,
    productModalService,
    analyticsFactory,
  ) {
    this.$log = $log;
    this.donationsService = donationsService;
    this.profileService = profileService;
    this.productModalService = productModalService;
    this.analyticsFactory = analyticsFactory;
    this.showDetails = false;
    this.detailsLoaded = false;
    this.currentDate = new Date();
  }

  toggleDetails() {
    this.loadingDetailsError = false;
    this.showDetails = !this.showDetails;
    // Load details if we haven't already
    if (this.showDetails && !this.detailsLoaded) {
      this.isLoading = true;

      const paymentMethodRequests = [];
      const paymentMethodUris = [];
      angular.forEach(this.recipient.donations, (donation) => {
        const uri =
          donation['payment-instrument-link'] &&
          donation['payment-instrument-link'].uri;
        if (uri && paymentMethodUris.indexOf(uri) < 0) {
          paymentMethodUris.push(uri);
          paymentMethodRequests.push(
            this.profileService.getPaymentMethod(uri, true),
          );
        }
      });

      if (paymentMethodRequests.length) {
        Observable.forkJoin(paymentMethodRequests).subscribe(
          (paymentMethods) => {
            paymentMethods = keyBy(paymentMethods, (paymentMethod) => {
              return paymentMethod.self.uri;
            });

            angular.forEach(this.recipient.donations, (donation) => {
              const uri =
                donation['payment-instrument-link'] &&
                donation['payment-instrument-link'].uri;
              donation.paymentmethod = paymentMethods[uri];
            });

            this.isLoading = false;
            this.detailsLoaded = true;
          },
          (error) => {
            this.showDetails = false;
            this.isLoading = false;
            this.loadingDetailsError = true;
            this.$log.error('Error loading recipient details', error);
          },
        );
      } else {
        this.isLoading = false;
        this.detailsLoaded = true;
      }
    }
  }

  giveNewGift() {
    this.productModalService.configureProduct(
      this.recipient['designation-number'],
    );
  }

  recurringGift(recurring) {
    return new RecurringGiftModel(recurring['donation-lines'][0], recurring);
  }
}

export default angular
  .module(componentName, [
    desigSrc.name,
    profileService.name,
    donationsService.name,
    productModalService.name,
    recipientDetail.name,
    analyticsFactory.name,
    uibTooltip,
  ])
  .component(componentName, {
    controller: RecipientGift,
    templateUrl: template,
    bindings: {
      recipient: '<',
    },
  });

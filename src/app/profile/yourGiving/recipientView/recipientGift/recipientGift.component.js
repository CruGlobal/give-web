import angular from 'angular';
import find from 'lodash/find';

import RecurringGiftModel from 'common/models/recurringGift.model';
import desigSrc from 'common/directives/desigSrc.directive';
import donationsService from 'common/services/api/donations.service';
import profileService from 'common/services/api/profile.service';
import recipientDetail from './recipientDetail/recipientDetail.component';
import productModalService from 'common/services/productModal.service';
import template from './recipientGift.tpl';

let componentName = 'recipientGift';

class RecipientGift {

  /* @ngInject */
  constructor( $log, donationsService, profileService, productModalService ) {
    this.$log = $log;
    this.donationsService = donationsService;
    this.profileService = profileService;
    this.productModalService = productModalService;
    this.showDetails = false;
    this.detailsLoaded = false;
    this.currentDate = new Date();
  }

  toggleDetails() {
    this.loadingDetailsError = false;
    this.showDetails = !this.showDetails;
    //Load details if we haven't already
    if ( this.showDetails && !this.detailsLoaded ) {
      this.isLoading = true;

      //get payment methods
      this.profileService.getPaymentMethods( true )
        .subscribe( ( paymentMethods ) => {
          angular.forEach(this.recipient.donations, (donation) => {
            let paymentMethodId = donation['historical-donation-line']['payment-method-id'];
            donation['paymentmethod'] = find(paymentMethods, {id: paymentMethodId});
          });

          this.isLoading = false;
          this.detailsLoaded = true;
        }, error => {
          this.showDetails = false;
          this.isLoading = false;
          this.loadingDetailsError = true;
          this.$log.error('Error loading recipient details', error);
        });
    }
  }

  giveNewGift() {
    this.productModalService.configureProduct( this.recipient['designation-number'], {amount: 50} );
  }

  recurringGift(recurring) {
    return new RecurringGiftModel(recurring['donation-lines'][0], recurring);
  }
}

export default angular
  .module( componentName, [
    desigSrc.name,
    profileService.name,
    donationsService.name,
    productModalService.name,
    recipientDetail.name,
    template.name
  ] )
  .component( componentName, {
    controller:  RecipientGift,
    templateUrl: template.name,
    bindings:    {
      recipient: '<'
    }
  } );

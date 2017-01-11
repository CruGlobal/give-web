import angular from 'angular';
import desigSrc from 'common/directives/desigSrc.directive';
import donationsService from 'common/services/api/donations.service';
import recipientDetail from './recipientDetail/recipientDetail.component';
import productModalService from 'common/services/productModal.service';
import template from './recipientGift.tpl';

let componentName = 'recipientGift';

class RecipientGift {

  /* @ngInject */
  constructor( $log, donationsService, productModalService ) {
    this.$log = $log;
    this.donationsService = donationsService;
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

      //get donation payment methods
      angular.forEach(this.recipient.donations, (donation) => {
        let paymentMethodId = donation['historical-donation-line']['payment-method-id'];
        this.donationsService.getPaymentMethod( paymentMethodId )
          .subscribe( ( paymentMethod ) => {
            donation['paymentmethod'] = paymentMethod;
            this.isLoading = false;
            this.detailsLoaded = true;
          }, error => {
            this.showDetails = false;
            this.isLoading = false;
            this.loadingDetailsError = true;
            this.$log.error('Error loading recipient details', error);
          });
      });
    }
  }

  giveNewGift() {
    this.productModalService.configureProduct( this.recipient['designation-number'], {amount: 50} );
  }
}

export default angular
  .module( componentName, [
    desigSrc.name,
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

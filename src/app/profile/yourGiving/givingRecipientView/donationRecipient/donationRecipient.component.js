import angular from 'angular';
import desigSrc from 'common/directives/desigSrc.directive';
import donationsService from 'common/services/api/donations.service';
import giftDetail from './giftDetail/giftDetail.component';
import loadingComponent from 'common/components/loading/loading.component';
import productModalService from 'common/services/productModal.service';
import template from './donationRecipient.tpl';

let componentName = 'donationRecipient';

class DonationRecipient {

  /* @ngInject */
  constructor( donationsService, productModalService ) {
    this.donationsService = donationsService;
    this.productModalService = productModalService;
    this.showDetails = false;
    this.detailsLoaded = false;
    this.currentDate = new Date();
  }

  toggleDetails() {
    this.showDetails = !this.showDetails;
    //Load details if we haven't already
    if ( this.showDetails && !this.detailsLoaded ) {
      this.isLoading = true;
      this.donationsService.getRecipientDetails( this.recipient ).subscribe( ( details ) => {
        this.details = details;
        this.isLoading = false;
        this.detailsLoaded = true;
      } );
    }
  }

  giveNewGift() {
    this.productModalService.configureProduct( this.recipient['designation-number'] );
  }
}

export default angular
  .module( componentName, [
    desigSrc.name,
    donationsService.name,
    giftDetail.name,
    loadingComponent.name,
    productModalService.name,
    template.name
  ] )
  .component( componentName, {
    controller:  DonationRecipient,
    templateUrl: template.name,
    bindings:    {
      recipient: '<'
    }
  } );

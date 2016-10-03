import angular from 'angular';
import desigSrc from 'common/directives/desigSrc.directive';
import donationsService from 'common/services/api/donations.service';
import recipientDetail from './recipientDetail/recipientDetail.component';
import loadingComponent from 'common/components/loading/loading.component';
import productModalService from 'common/services/productModal.service';
import template from './recipientGift.tpl';

let componentName = 'recipientGift';

class RecipientGift {

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
    this.productModalService.configureProduct( this.recipient['designation-number'], {amount: 50} );
  }
}

export default angular
  .module( componentName, [
    desigSrc.name,
    donationsService.name,
    loadingComponent.name,
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

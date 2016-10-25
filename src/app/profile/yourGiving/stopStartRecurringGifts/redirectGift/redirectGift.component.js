import angular from 'angular';
import template from './redirectGift.tpl';

import donationsService from 'common/services/api/donations.service';
import redirectGiftStep1 from './step1/redirectGiftStep1.component';

let componentName = 'redirectGift';

class RedirectGiftController {

  /* @ngInject */
  constructor( donationsService ) {
    this.donationsService = donationsService;
  }

  $onInit() {
    this.setLoading( {loading: true} );
    this.loadRecurringGifts();
  }

  setStep( step ) {
    this.step = step;
  }

  previous() {
    switch ( this.step ) {
      case 'step-2':
        this.step = 'step-1';
        break;
      case 'step-1':
      default:
        this.changeState( {state: 'step-0'} );
    }
  }

  loadRecurringGifts() {
    this.donationsService.getRecurringGifts().subscribe( ( gifts ) => {
      this.gifts = gifts;
      this.setLoading( {loading: false} );
      this.setStep( 'step-1' );
    } );
  }

  selectGift( gift ) {
    this.selectedGift = gift;
    this.setStep( 'step-2' );
  }
}

export default angular
  .module( componentName, [
    template.name,
    donationsService.name,
    redirectGiftStep1.name
  ] )
  .component( componentName, {
      controller:  RedirectGiftController,
      templateUrl: template.name,
      bindings:    {
        changeState: '&',
        cancel:      '&',
        setLoading:  '&',
        complete:    '&'
      }
    }
  );

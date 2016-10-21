import angular from 'angular';
import template from './stopGift.tpl';

import donationsService from 'common/services/api/donations.service';

import stopGiftStep1 from './stopGiftStep1.component';

let componentName = 'stopGift';

class StopGiftController {

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

  selectGifts( selectedGifts ) {
    this.selectedGifts = selectedGifts;
    this.setStep( 'step-2' );
  }
}

export default angular
  .module( componentName, [
    template.name,
    donationsService.name,
    stopGiftStep1.name
  ] )
  .component( componentName, {
      controller:  StopGiftController,
      templateUrl: template.name,
      bindings:    {
        changeState: '&',
        cancel:      '&',
        setLoading:  '&'
      }
    }
  );

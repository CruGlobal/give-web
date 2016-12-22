import angular from 'angular';
import template from './stopGift.tpl';
import map from 'lodash/map';

import donationsService from 'common/services/api/donations.service';
import {scrollModalToTop} from 'common/services/modalState.service';

import stopGiftStep1 from './step1/stopGiftStep1.component';
import stopGiftStep2 from './step2/stopGiftStep2.component';
import retryModal from 'common/components/retryModal/retryModal.component';

let componentName = 'stopGift';

class StopGiftController {

  /* @ngInject */
  constructor( $log, donationsService ) {
    this.$log = $log;
    this.donationsService = donationsService;
    this.scrollModalToTop = scrollModalToTop;
  }

  $onInit() {
    this.setLoading( {loading: true} );
    this.loadRecurringGifts();
  }

  setStep( step ) {
    this.step = step;
    this.scrollModalToTop();
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
    this.scrollModalToTop();
  }

  loadRecurringGifts() {
    this.setLoading( {loading: true} );
    this.loadingRecurringGiftsError = false;
    this.donationsService.getRecurringGifts().subscribe( ( gifts ) => {
      this.gifts = gifts;
      this.setLoading( {loading: false} );
      this.setStep( 'step-1' );
    },
    error => {
      this.setLoading( {loading: false} );
      this.loadingRecurringGiftsError = true;
      this.$log.error('Error loading recurring gifts', error);
    });
  }

  selectGifts( selectedGifts ) {
    this.selectedGifts = selectedGifts;
    this.setStep( 'step-2' );
  }

  confirmChanges() {
    this.setLoading( {loading: true} );
    this.donationsService.updateRecurringGifts( map( this.selectedGifts, ( gift ) => {
      gift.donationLineStatus = 'Cancelled';
      return gift;
    } ) ).subscribe( () => {
      this.complete();
    } );
  }
}

export default angular
  .module( componentName, [
    template.name,
    donationsService.name,
    stopGiftStep1.name,
    stopGiftStep2.name,
    retryModal.name
  ] )
  .component( componentName, {
      controller:  StopGiftController,
      templateUrl: template.name,
      bindings:    {
        changeState: '&',
        cancel:      '&',
        setLoading:  '&',
        complete:    '&'
      }
    }
  );

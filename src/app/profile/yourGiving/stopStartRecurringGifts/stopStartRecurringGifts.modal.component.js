import angular from 'angular';
import template from './stopStartRecurringGifts.modal.tpl';

import stopStartStep0 from './step0/stopStartStep0.component';
import stopGift from './stopGift/stopGift.component';
import redirectGift from './redirectGift/redirectGift.component';
import restartGift from './restartGift/restartGift.component';

let componentName = 'stopStartRecurringGiftsModal';

class StopStartRecurringGiftsModalController {

  /* @ngInject */
  constructor($window) {
    this.$window = $window;
  }

  $onInit() {
    this.changeState( 'step-0' );
  }

  changeState( state ) {
    if( state === 'change') this.$window.location = '/payment-methods.html';
    if ( state !== 'step-0' ) this.giftAction = state;
    this.state = state;
  }

  setLoading( loading ) {
    this.isLoading = !!loading;
  }
}

export default angular
  .module( componentName, [
    template.name,
    stopStartStep0.name,
    stopGift.name,
    redirectGift.name,
    restartGift.name
  ] )
  .component( componentName, {
    controller:  StopStartRecurringGiftsModalController,
    templateUrl: template.name,
    bindings:    {
      close:   '&',
      dismiss: '&'
    }
  } );

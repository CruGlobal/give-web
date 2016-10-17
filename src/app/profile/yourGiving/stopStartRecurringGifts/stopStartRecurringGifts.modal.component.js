import angular from 'angular';
import template from './stopStartRecurringGifts.modal.tpl';

import stopStartStep0 from './step0/stopStartStep0.component';

let componentName = 'stopStartRecurringGiftsModal';

class StopStartRecurringGiftsModalController {

  /* @ngInject */
  constructor( $log ) {
    this.$log = $log;
  }

  $onInit() {
    this.next();
  }

  next( giftAction ) {
    switch ( this.state ) {
      case 'step-0':
        if ( angular.isDefined( giftAction ) ) {
          this.giftAction = giftAction;
          this.state = `${giftAction}-step-1`;
        }
        break;
      default:
        this.state = 'step-0';
    }
  }

  previous() {
    switch ( this.state ) {
      case 'restart-step-1':
      case 'change-step-1':
      case 'redirect-step-1':
      case 'stop-step-1':
        this.state = 'step-0';
        break;
    }
  }
}

export default angular
  .module( componentName, [
    template.name,
    stopStartStep0.name
  ] )
  .component( componentName, {
    controller:  StopStartRecurringGiftsModalController,
    templateUrl: template.name,
    bindings:    {
      close:   '&',
      dismiss: '&'
    }
  } );

import angular from 'angular';
import donationRecipient from './donationRecipient/donationRecipient.component';
import donationsService from 'common/services/api/donations.service';
import template from './givingRecipientView.tpl';

let componentName = 'givingRecipientView';

class GivingRecipientView {

  /* @ngInject */
  constructor( donationsService ) {
    this.donationsService = donationsService;
  }

  $onChanges( change ) {
    this.loadRecipients();
  }

  loadRecipients( year, month ) {
    this.setLoading( {loading: true} );
    if ( angular.isDefined( this.subscriber ) ) this.subscriber.unsubscribe();
    this.subscriber = this.donationsService.getRecipients( 2015 ).subscribe( ( recipients ) => {
      delete this.subscriber;
      this.recipients = recipients;
      this.setLoading( {loading: false} );
    }, () => {
      // todo: error loading recipients
      this.setLoading( {loading: false} );
    } );
  }
}
export default angular
  .module( componentName, [
    donationRecipient.name,
    donationsService.name,
    template.name
  ] )
  .component( componentName, {
    controller:  GivingRecipientView,
    templateUrl: template.name,
    bindings:    {
      filters:    '<',
      setLoading: '&'
    }
  } );

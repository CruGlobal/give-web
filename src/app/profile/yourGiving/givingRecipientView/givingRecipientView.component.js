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

  $onChanges( changes ) {
    if ( angular.isDefined( changes.filter ) ) {
      this.loadRecipients( changes.filter.currentValue == 'recent' ? undefined : changes.filter.currentValue );
    }
  }

  loadRecipients( year ) {
    this.setLoading( {loading: true} );
    this.recipients = [];
    if ( angular.isDefined( this.subscriber ) ) this.subscriber.unsubscribe();
    this.subscriber = this.donationsService.getRecipients( year ).subscribe( ( recipients ) => {
      delete this.subscriber;
      this.recipients = recipients;
      this.setLoading( {loading: false} );
    }, () => {
      // todo: error loading recipients
      delete this.subscriber;
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
      filter:     '<',
      setLoading: '&'
    }
  } );

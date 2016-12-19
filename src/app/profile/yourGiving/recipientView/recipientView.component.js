import angular from 'angular';
import donationsService from 'common/services/api/donations.service';
import recipientGift from './recipientGift/recipientGift.component';
import template from './recipientView.tpl';

let componentName = 'recipientView';

class RecipientView {

  /* @ngInject */
  constructor( $log, donationsService ) {
    this.donationsService = donationsService;
    this.$log = $log;
  }

  $onChanges( changes ) {
    if ( angular.isDefined( changes.filter ) ) {
      this.loadRecipients( changes.filter.currentValue == 'recent' ? undefined : changes.filter.currentValue );
    }
  }

  loadRecipients( year ) {
    this.loadingRecipientsError = false;
    this.setLoading( {loading: true} );
    this.recipients = [];
    if ( angular.isDefined( this.subscriber ) ) this.subscriber.unsubscribe();
    this.subscriber = this.donationsService.getRecipients( year ).subscribe( ( recipients ) => {
      delete this.subscriber;
      this.recipients = recipients;
      this.setLoading( {loading: false} );
    }, error => {
      delete this.subscriber;
      this.setLoading( {loading: false} );
      this.loadingRecipientsError = true;
      this.$log.error( 'Error loading recipients', error );
    } );
  }
}
export default angular
  .module( componentName, [
    donationsService.name,
    recipientGift.name,
    template.name
  ] )
  .component( componentName, {
    controller:  RecipientView,
    templateUrl: template.name,
    bindings:    {
      filter:     '<',
      setLoading: '&'
    }
  } );

import angular from 'angular';
import historicalGift from './historicalGift/historicalGift.component';
import donationsService from 'common/services/api/donations.service';
import template from './historicalView.tpl';

let componentName = 'historicalView';

class HistoricalView {

  /* @ngInject */
  constructor( $log, donationsService ) {
    this.$log = $log;
    this.donationsService = donationsService;
  }

  $onChanges() {
    if ( angular.isDefined( this.year ) && angular.isDefined( this.month ) ) {
      this.loadGifts( this.year, this.month.month );
    }
  }

  loadGifts( year, month ) {
    this.loadingGiftsError = false;
    this.setLoading( {loading: true} );
    this.historicalGifts = undefined;
    if ( angular.isDefined( this.subscriber ) ) this.subscriber.unsubscribe();
    this.subscriber = this.donationsService.getHistoricalGifts( year, month ).subscribe( ( historicalGifts ) => {
      delete this.subscriber;
      this.historicalGifts = historicalGifts || [];
      this.setLoading( {loading: false} );
    }, (error) => {
      delete this.subscriber;
      this.setLoading( {loading: false} );
      this.$log.error('Error loading historical gifts', error);
      this.loadingGiftsError = true;
    } );
  }
}
export default angular
  .module( componentName, [
    historicalGift.name,
    donationsService.name,
    template.name
  ] )
  .component( componentName, {
    controller:  HistoricalView,
    templateUrl: template.name,
    bindings:    {
      year:       '<',
      month:      '<',
      setLoading: '&',
      onManageGift: '&'
    }
  } );

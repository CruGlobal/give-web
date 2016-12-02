import angular from 'angular';
import template from './confirmGifts.tpl';
import isEmpty from 'lodash/isEmpty';
import concat from 'lodash/concat';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/do';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';
import giftDetailsView from 'common/components/giftViews/giftDetailsView/giftDetailsView.component';

import donationsService from 'common/services/api/donations.service';

import analyticsModule from 'app/analytics/analytics.module';
import analyticsFactory from 'app/analytics/analytics.factory';

let componentName = 'confirmGifts';

class ConfirmGiftsController {

  /* @ngInject */
  constructor( donationsService, analyticsFactory ) {
    this.donationsService = donationsService;
    this.analyticsFactory = analyticsFactory;
  }

  $onInit() {
    this.updates = [];
    this.adds = [];
    this.saved = [];
    angular.forEach( this.gifts, ( gift ) => {
      (angular.isDefined( gift.parentDonation['donation-status'] ) ? this.updates : this.adds).push( gift );
    } );
  }

  processRestarts() {
    let requests = [];
    this.setLoading( {loading: true} );
    if ( !isEmpty( this.adds ) ) {
      requests.push( this.donationsService.addRecurringGifts( this.adds ).do( () => {
        this.saved = concat( this.saved, this.adds );
        this.adds.length = 0;
      } ) );
    }
    if ( !isEmpty( this.updates ) ) {
      requests.push( this.donationsService.updateRecurringGifts( this.updates ).do( () => {
        this.saved = concat( this.saved, this.updates );
        this.updates.length = 0;
      } ) );
    }
    Observable.forkJoin( requests )
      .subscribe( () => {
          this.next();
          this.analyticsFactory.editRecurringDonation(this.gifts);
          this.analyticsFactory.setEvent('recurring donation restarted');
        },
        () => {
          this.setLoading( {loading: false} );
          this.error = 'error';
        } );
  }
}

export default angular
  .module( componentName, [
    template.name,
    donationsService.name,
    giftListItem.name,
    giftDetailsView.name,
    analyticsFactory.name
  ] )
  .component( componentName, {
    controller:  ConfirmGiftsController,
    templateUrl: template.name,
    bindings:    {
      gifts:      '<',
      cancel:     '&',
      previous:   '&',
      next:       '&',
      setLoading: '&'
    }
  } );

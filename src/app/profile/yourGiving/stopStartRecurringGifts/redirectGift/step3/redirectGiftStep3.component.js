import angular from 'angular';
import template from './redirectGiftStep3.tpl';
import commonService from 'common/services/api/common.service';
import donationsService from 'common/services/api/donations.service';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';
import giftDetailsView from 'common/components/giftViews/giftDetailsView/giftDetailsView.component';
import giftUpdateView from 'common/components/giftViews/giftUpdateView/giftUpdateView.component';

let componentName = 'redirectGiftStep3';

class RedirectGiftStep3Controller {

  /* @ngInject */
  constructor( commonService, donationsService ) {
    this.commonService = commonService;
    this.donationsService = donationsService;
    this.state = 'update';
  }

  submitGift() {
    this.hasError = false;
    this.setLoading( {loading: true} );
    this.donationsService.updateRecurringGifts( this.gift ).subscribe( () => {
      this.onComplete();
    }, () => {
      this.hasError = true;
      this.setLoading( {loading: false} );
    } );
  }

  previous() {
    this.hasError = false;
    if ( this.state == 'confirm' ) {
      this.state = 'update';
    } else {
      this.onPrevious();
    }
  }
}

export default angular
  .module( componentName, [
    template.name,
    commonService.name,
    donationsService.name,
    giftListItem.name,
    giftDetailsView.name,
    giftUpdateView.name
  ] )
  .component( componentName, {
      controller:  RedirectGiftStep3Controller,
      templateUrl: template.name,
      bindings:    {
        stopGift:   '<',
        gift:       '<',
        onComplete: '&',
        onCancel:   '&',
        onPrevious: '&',
        setLoading: '&'
      }
    }
  );

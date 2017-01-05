import angular from 'angular';
import filter from 'lodash/filter';
import isEmpty from 'lodash/isEmpty';
import concat from 'lodash/concat';
import map from 'lodash/map';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/do';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';
import giftDetailsView from 'common/components/giftViews/giftDetailsView/giftDetailsView.component';

import donationsService from 'common/services/api/donations.service';

import template from './confirmRecurringGifts.tpl';

import analyticsFactory from 'app/analytics/analytics.factory';

let componentName = 'step4Confirm';

class ConfirmRecurringGiftsController {

  /* @ngInject */
  constructor($log, donationsService, analyticsFactory) {
    this.$log = $log;
    this.donationsService = donationsService;
    this.savedGifts = [];
    this.analyticsFactory = analyticsFactory;
  }

  $onInit(){
    this.recurringGiftChanges = filter(this.recurringGifts, gift => gift.hasChanges());
    this.hasChanges = !isEmpty(this.recurringGiftChanges) || !isEmpty(this.additions);
  }

  saveChanges(){
    this.saving = true;
    this.savingError = '';
    let requests = [];
    if(!isEmpty(this.recurringGiftChanges)){
      requests.push(this.donationsService.updateRecurringGifts(this.recurringGiftChanges)
        .do(() => {
          this.savedGifts = concat(this.savedGifts, this.recurringGiftChanges);
          this.analyticsFactory.setEvent('recurring donation changed');
          this.analyticsFactory.editRecurringDonation(this.recurringGiftChanges);
          this.recurringGiftChanges.length = 0; // Clear array but keep the same reference
        }));
    }
    if(!isEmpty(this.additions)){
      requests.push(this.donationsService.addRecurringGifts(this.additions)
        .do(() => {
          map(this.additions, addition => {
            addition._selectedGift = false; // Unselect succussfully saved gifts
            return addition;
          });
          this.savedGifts = concat(this.savedGifts, this.additions);
          this.additions.length = 0; // Clear array but keep the same reference
        }));
    }
    Observable.forkJoin(requests)
      .subscribe(() => {
          this.next();
        },
        error => {
          this.saving = false;
          this.savingError = error.data || 'unknown';
          this.$log.error('Error updating/adding recurring gifts', error);
        });
  }
}

export default angular
  .module(componentName, [
    template.name,
    giftListItem.name,
    giftDetailsView.name,
    donationsService.name,
    analyticsFactory.name
  ])
  .component(componentName, {
    controller: ConfirmRecurringGiftsController,
    templateUrl: template.name,
    bindings: {
      recurringGifts: '<',
      additions: '<',
      dismiss: '&',
      previous: '&',
      next: '&'
    }
  });

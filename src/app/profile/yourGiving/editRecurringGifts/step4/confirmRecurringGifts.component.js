import angular from 'angular';
import filter from 'lodash/filter';
import isEmpty from 'lodash/isEmpty';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/empty';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';
import giftDetailsView from 'common/components/giftViews/giftDetailsView/giftDetailsView.component';
import loading from 'common/components/loading/loading.component';

import donationsService from 'common/services/api/donations.service';

import template from './confirmRecurringGifts.tpl';

let componentName = 'step4Confirm';

class ConfirmRecurringGiftsController {

  /* @ngInject */
  constructor($log, donationsService) {
    this.$log = $log;
    this.donationsService = donationsService;
  }

  $onInit(){
    this.recurringGiftChanges = filter(this.recurringGifts, gift => gift.hasChanges());
    this.hasChanges = !isEmpty(this.recurringGiftChanges) || !isEmpty(this.additions);
  }

  saveChanges(){
    this.saving = true;
    this.savingError = '';
    let requests = [];
    !isEmpty(this.recurringGiftChanges) && requests.push(this.donationsService.updateRecurringGifts(this.recurringGiftChanges));
    !isEmpty(this.additions) && requests.push(this.donationsService.addRecurringGifts(this.additions));
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
    loading.name,
    donationsService.name
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

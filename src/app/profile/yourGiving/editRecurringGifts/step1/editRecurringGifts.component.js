import angular from 'angular';
import filter from 'lodash/filter';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';
import giftUpdate from 'common/components/giftViews/giftUpdate/giftUpdate.component';
import loading from 'common/components/loading/loading.component';

import donationsService from 'common/services/api/donations.service';
import commonService from 'common/services/api/common.service';

import template from './editRecurringGifts.tpl';

let componentName = 'step1EditRecurringGifts';

class EditRecurringGiftsController {

  /* @ngInject */
  constructor($log, donationsService, commonService) {
    this.$log = $log;
    this.donationsService = donationsService;
    this.commonService = commonService;
  }

  $onInit(){
    this.loadGifts();
  }

  loadGifts(){
    this.loading = true;
    this.loadingError = false;
    Observable.forkJoin(this.donationsService.getRecurringGifts(), this.commonService.getNextDrawDate())
      .subscribe(([gifts, nextDrawDate]) => {
          this.recurringGifts = gifts;
          this.nextDrawDate = nextDrawDate;
          this.loading = false;
        },
        (error) => {
          this.$log.error('Error loading recurring gifts or nextDrawDate', error);
          this.loading = false;
          this.loadingError = true;
        });
  }

  processChanges() {
    let recurringGiftChanges = filter(this.recurringGifts, gift => {
      return gift['updated-amount'] !== '' ||
        gift['updated-payment-method-id'] !== '' ||
        gift['updated-rate']['recurrence']['interval'] !== '' ||
        gift['updated-recurring-day-of-month'] !== '' ||
        gift['updated-start-month'] !== '' ||
        gift['updated-start-year'] !== '';
    });
    this.next({ recurringGiftChanges: recurringGiftChanges });
  }
}

export default angular
  .module(componentName, [
    template.name,
    giftListItem.name,
    giftUpdate.name,
    loading.name,
    donationsService.name,
    commonService.name
  ])
  .component(componentName, {
    controller: EditRecurringGiftsController,
    templateUrl: template.name,
    bindings: {
      paymentMethods: '<',
      dismiss: '&',
      next: '&'
    }
  });

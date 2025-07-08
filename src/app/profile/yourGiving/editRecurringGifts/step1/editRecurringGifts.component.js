import angular from 'angular';
import every from 'lodash/every';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';
import giftUpdateView from 'common/components/giftViews/giftUpdateView/giftUpdateView.component';

import donationsService from 'common/services/api/donations.service';

import template from './editRecurringGifts.tpl.html';

const componentName = 'step1EditRecurringGifts';

class EditRecurringGiftsController {
  /* @ngInject */
  constructor($log, donationsService) {
    this.$log = $log;
    this.donationsService = donationsService;
  }

  $onInit() {
    this.loadGifts();
  }

  loadGifts() {
    if (!this.recurringGifts) {
      this.loading = true;
      this.loadingError = false;
      this.donationsService.getRecurringGifts(undefined, true).subscribe(
        (gifts) => {
          this.recurringGifts = gifts;
          this.loading = false;
        },
        (error) => {
          this.$log.error('Error loading recurring gifts', error);
          this.loading = false;
          this.loadingError = true;
        },
      );
    }
  }

  allPaymentMethodsValid() {
    return every(this.recurringGifts, (gift) => gift.paymentMethod);
  }
}

export default angular
  .module(componentName, [
    giftListItem.name,
    giftUpdateView.name,
    donationsService.name,
  ])
  .component(componentName, {
    controller: EditRecurringGiftsController,
    templateUrl: template,
    bindings: {
      recurringGifts: '<',
      dismiss: '&',
      next: '&',
    },
  });

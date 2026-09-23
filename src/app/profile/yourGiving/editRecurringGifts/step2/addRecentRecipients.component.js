import angular from 'angular';
import filter from 'lodash/filter';
import some from 'lodash/some';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';

import template from './addRecentRecipients.tpl.html';

const componentName = 'step2AddRecentRecipients';

class AddRecentRecipientsController {
  /* @ngInject */
  constructor() /* eslint-disable-line no-useless-constructor */ {}

  $onInit() {
    if (this.loadedNoRecentRecipients()) {
      this.next();
    }
  }

  loadedNoRecentRecipients() {
    return !this.loadingRecentRecipients && !this.hasRecentRecipients;
  }

  gatherSelections() {
    this.next({
      additions: filter(this.recentRecipients, { _selectedGift: true }),
    });
  }

  // The backend is authoritative for duplicate handling; this is only a non-blocking warning
  isExistingRecurringGift(gift) {
    return some(
      this.recurringGifts,
      (recurringGift) =>
        recurringGift.designationNumber === gift.designationNumber,
    );
  }
}

export default angular
  .module(componentName, [giftListItem.name])
  .component(componentName, {
    controller: AddRecentRecipientsController,
    templateUrl: template,
    bindings: {
      recentRecipients: '<',
      recurringGifts: '<',
      hasRecentRecipients: '<',
      loadingRecentRecipients: '<',
      hasRecurringGiftChanges: '<',
      dismiss: '&',
      previous: '&',
      next: '&',
    },
  });

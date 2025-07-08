import angular from 'angular';
import map from 'lodash/map';

import giftSearchView from 'common/components/giftViews/giftSearchView/giftSearchView.component';

import RecurringGiftModel from 'common/models/recurringGift.model';

import template from './searchRecipients.tpl.html';

const componentName = 'step1SearchRecipients';

class SelectRecentRecipientsController {
  /* @ngInject */
  constructor() /* eslint-disable-line no-useless-constructor */ {}

  onChange(selectedRecipients) {
    this.additionalRecipients = selectedRecipients;
  }

  gatherSelections() {
    this.next({
      additionalRecipients: map(this.additionalRecipients, (gift) => {
        const newGift = new RecurringGiftModel({
          'designation-name': gift.designationName,
          'designation-number': gift.designationNumber,
        }).setDefaultsSingleGift();
        newGift._selectedGift = true;
        return newGift;
      }),
    });
  }
}

export default angular
  .module(componentName, [giftSearchView.name])
  .component(componentName, {
    controller: SelectRecentRecipientsController,
    templateUrl: template,
    bindings: {
      recentRecipients: '<',
      dismiss: '&',
      previous: '&',
      next: '&',
    },
  });

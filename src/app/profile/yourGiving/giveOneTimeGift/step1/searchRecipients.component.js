import angular from 'angular';
import map from 'lodash/map';

import giftSearchView from 'common/components/giftViews/giftSearchView/giftSearchView.component';

import RecurringGiftModel from 'common/models/recurringGift.model';

import template from './searchRecipients.tpl';

let componentName = 'step1SearchRecipients';

class SelectRecentRecipientsController {

  /* @ngInject */
  constructor() {

  }

  onChange(selectedRecipients){
    this.additionalRecipients = selectedRecipients;
  }

  gatherSelections(){
    this.next({
      additionalRecipients: map(this.additionalRecipients, gift => {
        return (new RecurringGiftModel({ 'designation-name': gift.designationName, 'designation-number': gift.designationNumber })).setDefaultsSingleGift();
      })
    });
  }
}

export default angular
  .module(componentName, [
    template.name,
    giftSearchView.name
  ])
  .component(componentName, {
    controller: SelectRecentRecipientsController,
    templateUrl: template.name,
    bindings: {
      recentRecipients: '<',
      dismiss: '&',
      previous: '&',
      next: '&'
    }
  });

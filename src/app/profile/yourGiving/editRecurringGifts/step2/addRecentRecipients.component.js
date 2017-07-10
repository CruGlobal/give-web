import angular from 'angular';
import filter from 'lodash/filter';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';

import template from './addRecentRecipients.tpl.html';

let componentName = 'step2AddRecentRecipients';

class AddRecentRecipientsController {

  /* @ngInject */
  constructor() {

  }

  $onInit(){
    if(this.loadedNoRecentRecipients()){
      this.next();
    }
  }

  loadedNoRecentRecipients(){
    return !this.loadingRecentRecipients && !this.hasRecentRecipients;
  }

  gatherSelections(){
    this.next({ additions: filter(this.recentRecipients, {_selectedGift: true}) });
  }
}

export default angular
  .module(componentName, [
    giftListItem.name
  ])
  .component(componentName, {
    controller: AddRecentRecipientsController,
    template: template,
    bindings: {
      recentRecipients: '<',
      hasRecentRecipients: '<',
      loadingRecentRecipients: '<',
      hasRecurringGiftChanges: '<',
      dismiss: '&',
      previous: '&',
      next: '&'
    }
  });

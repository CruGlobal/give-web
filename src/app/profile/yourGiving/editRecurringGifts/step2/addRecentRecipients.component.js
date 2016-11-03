import angular from 'angular';
import filter from 'lodash/filter';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';

import template from './addRecentRecipients.tpl';

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
    return !this.loadingRecentRecipients && (!this.recentRecipients || this.recentRecipients.length === 0);
  }

  gatherSelections(){
    this.next({ additions: filter(this.recentRecipients, {_selectedGift: true}) });
  }
}

export default angular
  .module(componentName, [
    template.name,
    giftListItem.name
  ])
  .component(componentName, {
    controller: AddRecentRecipientsController,
    templateUrl: template.name,
    bindings: {
      recentRecipients: '<',
      loadingRecentRecipients: '<',
      dismiss: '&',
      previous: '&',
      next: '&'
    }
  });

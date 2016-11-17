import angular from 'angular';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';
import giftUpdateView from 'common/components/giftViews/giftUpdateView/giftUpdateView.component';

import template from './enterAmounts.tpl';

let componentName = 'step2EnterAmounts';

class EnterAmountsController {

  /* @ngInject */
  constructor() {
  }

  $onInit(){
    this.hasSelectedRecipients = this.selectedRecipients && this.selectedRecipients.length > 0;
  }
}

export default angular
  .module(componentName, [
    template.name,
    giftListItem.name,
    giftUpdateView.name
  ])
  .component(componentName, {
    controller: EnterAmountsController,
    templateUrl: template.name,
    bindings: {
      selectedRecipients: '<',
      dismiss: '&',
      previous: '&',
      next: '&'
    }
  });

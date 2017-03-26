import angular from 'angular';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';
import giftUpdateView from 'common/components/giftViews/giftUpdateView/giftUpdateView.component';

import template from './enterAmounts.tpl.html';

let componentName = 'step2EnterAmounts';

class EnterAmountsController {

  /* @ngInject */
  constructor() {
    this.addingToCart = false;
  }

  $onInit(){
    this.hasSelectedRecipients = this.selectedRecipients && this.selectedRecipients.length > 0;
  }

  $onChanges(changes) {
    if (changes.submitted && changes.submitted.currentValue === true) {
      this.addingToCart = false;
    }
  }

  addToCart(){
    this.addingToCart = true;
    this.next({ selectedRecipients: this.selectedRecipients });
  }
}

export default angular
  .module(componentName, [
    giftListItem.name,
    giftUpdateView.name
  ])
  .component(componentName, {
    controller: EnterAmountsController,
    templateUrl: template,
    bindings: {
      selectedRecipients: '<',
      submitted: '<',
      errors: '<',
      dismiss: '&',
      previous: '&',
      next: '&'
    }
  });

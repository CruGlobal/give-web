import angular from 'angular';
import template from './suggestedRecipients.tpl.html';
import filter from 'lodash/filter';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';

const componentName = 'suggestedRecipients';

class SuggestedRecipientsController {
  /* @ngInject */
  constructor() /* eslint-disable-line no-useless-constructor */ {}

  selectRecipients() {
    this.next({ selected: filter(this.gifts, { _selectedGift: true }) });
  }
}

export default angular
  .module(componentName, [giftListItem.name])
  .component(componentName, {
    controller: SuggestedRecipientsController,
    templateUrl: template,
    bindings: {
      gifts: '<',
      cancel: '&',
      previous: '&',
      next: '&',
    },
  });

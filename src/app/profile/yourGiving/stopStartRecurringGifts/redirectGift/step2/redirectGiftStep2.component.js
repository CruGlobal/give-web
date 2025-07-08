import angular from 'angular';
import template from './redirectGiftStep2.tpl.html';

import giftSearchView from 'common/components/giftViews/giftSearchView/giftSearchView.component';

const componentName = 'redirectGiftStep2';

class RedirectGiftStep2Controller {
  /* @ngInject */
  constructor() /* eslint-disable-line no-useless-constructor */ {}

  onSelection(selectedRecipient) {
    this.selected = selectedRecipient;
  }
}

export default angular
  .module(componentName, [giftSearchView.name])
  .component(componentName, {
    controller: RedirectGiftStep2Controller,
    templateUrl: template,
    bindings: {
      onSelectResult: '&',
      cancel: '&',
      previous: '&',
    },
  });

import angular from 'angular';
import template from './redirectGiftStep2.tpl';

import giftSearchView from 'common/components/giftViews/giftSearchView/giftSearchView.component';

let componentName = 'redirectGiftStep2';

class RedirectGiftStep2Controller {

  /* @ngInject */
  constructor() {

  }

  onSelection(selectedRecipient) {
    this.selected = selectedRecipient;
  }
}

export default angular
  .module( componentName, [
    template.name,
    giftSearchView.name
  ] )
  .component( componentName, {
      controller:  RedirectGiftStep2Controller,
      templateUrl: template.name,
      bindings:    {
        onSelectResult: '&',
        cancel:         '&',
        previous:       '&'
      }
    }
  );

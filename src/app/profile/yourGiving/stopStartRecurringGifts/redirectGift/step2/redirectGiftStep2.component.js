import angular from 'angular';
import template from './redirectGiftStep2.tpl.html';

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
    giftSearchView.name
  ] )
  .component( componentName, {
      controller:  RedirectGiftStep2Controller,
      template: template,
      bindings:    {
        onSelectResult: '&',
        cancel:         '&',
        previous:       '&'
      }
    }
  );

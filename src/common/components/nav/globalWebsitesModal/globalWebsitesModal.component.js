import angular from 'angular';

import template from './globalWebsitesModal.tpl';

let componentName = 'globalWebsitesModal';

class GlobalWebsitesModalController {

  /* @ngInject */
  constructor() {

  }
}

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: GlobalWebsitesModalController,
    templateUrl: template.name,
    bindings: {
      close: '&',
      dismiss: '&'
    }
  });

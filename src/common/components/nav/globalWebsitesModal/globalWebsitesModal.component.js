import angular from 'angular';
import 'angular-scroll';

import template from './globalWebsitesModal.tpl';

let componentName = 'globalWebsitesModal';

class GlobalWebsitesModalController {
  $onInit() {
    // eslint-disable-next-line angular/document-service
    this.container = angular.element(document.getElementById('globalWebsites-modal'));
  }

  scrollTo(id) {
    // eslint-disable-next-line angular/document-service
    let element = angular.element(document.getElementById(id));
    this.container.scrollTo(element, 0, 300);
  }

  getContinentId(id) {
    return `globalWebsites-continent--${id.replace('/', '')}`;
  }
}

export default angular
  .module(componentName, [
    template.name,
    'duScroll'
  ])
  .component(componentName, {
    controller: GlobalWebsitesModalController,
    templateUrl: template.name,
    bindings: {
      dismiss: '&',
      resolve: '<'
    }
  });

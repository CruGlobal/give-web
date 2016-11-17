import angular from 'angular';

import template from './globalWebsitesModal.tpl';

let componentName = 'globalWebsitesModal';

class GlobalWebsitesModalController {

  /* @ngInject */
  constructor($anchorScroll, $location) {
    this.$anchorScroll = $anchorScroll;
    this.$location = $location;
    this.country = 'africa';
  }

  scrollTo(id) {
    this.country = id;
    this.$location.hash(this.getContinentId(id));
    this.$anchorScroll();
  }

  getContinentId(id) {
    return id.replace('/','');
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
      dismiss: '&',
      resolve: '<'
    }
  });

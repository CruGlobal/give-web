import angular from 'angular';

const controllerName = 'websiteCtrl';

class ModalInstanceCtrl {
  /* @ngInject */
  constructor(initialWebsite) {
    this.website = initialWebsite;
  }
}

export default angular
  .module(controllerName, [])
  .controller(controllerName, ModalInstanceCtrl);

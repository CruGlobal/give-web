import angular from 'angular';

import template from './loadingOverlay.tpl';

let componentName = 'loadingOverlay';

class LoadingOverlayComponent {

  /* @ngInject */
  constructor() {
  }
}

export default angular
  .module( componentName, [
    template.name,
  ] )
  .component( componentName, {
    controller:  LoadingOverlayComponent,
    templateUrl: template.name
  } );

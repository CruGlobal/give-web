import angular from 'angular';

import template from './local-dev-nav.tpl';

let componentName = 'localDevNav';

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    templateUrl: template.name
  });

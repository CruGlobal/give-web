import 'babel/external-helpers';
import angular from 'angular';

import template from './help.tpl';

let componentName = 'help';

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    templateUrl: template.name
  });

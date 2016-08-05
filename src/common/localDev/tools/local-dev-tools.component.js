import angular from 'angular';
import 'angular-bootstrap';

import productConfigComponent from 'app/productConfig/productConfig.component';

import template from './local-dev-tools.tpl';

let componentName = 'localDevTools';

export default angular
  .module(componentName, [
    productConfigComponent.name,
    template.name,
    'ui.bootstrap'
  ])
  .component(componentName, {
    templateUrl: template.name
  });

import angular from 'angular';
import 'angular-ui-router';

import mainTemplate from './main.tpl';

/* @ngInject */
function ConfigureModule(){
}

export default angular
  .module('main', [
    mainTemplate.name
  ])
  .config(ConfigureModule);

import angular from 'angular';

import primaryNavComponent from './nav/primary/primary-nav.component';
import subNavComponent from './nav/sub/sub-nav.component';

import template from './main.tpl';
import './main.css!';

class MainController{

  /* @ngInject */
  constructor(){
    this.test = 5;
  }

}

export default angular
  .module('main', [
    template.name,
    primaryNavComponent.name,
    subNavComponent.name
  ])
  .component('main', {
    controller: MainController,
    templateUrl: template.name
  });

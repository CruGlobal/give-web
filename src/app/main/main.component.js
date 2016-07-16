import angular from 'angular';

import primaryNavComponent from './nav/primary/primary-nav.component';
import subNavComponent from './nav/sub/sub-nav.component';

import mainTemplate from './main.tpl';
import './main.css!';

class MainController{

  /* @ngInject */
  constructor($log){
    this.test = 5;
    $log.info('Loaded main controller');
  }

}

export default angular
  .module('main', [
    mainTemplate.name,
    primaryNavComponent.name,
    subNavComponent.name
  ])
  .component('main', {
    controller: MainController,
    templateUrl: mainTemplate.name
  });

import angular from 'angular';

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
  .module('main')
  .component('main', {
    controller: MainController,
    templateUrl: mainTemplate.name
  });

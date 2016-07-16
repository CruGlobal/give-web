import angular from 'angular';

import subNavTemplate from './sub-nav.tpl';
//import './sub-nav.css!';

class SubNavController{

  /* @ngInject */
  constructor($log){
    this.test = 5;
    $log.info('Loaded subNav controller');
  }

}

export default angular
  .module('subNav', [
    subNavTemplate.name
  ])
  .component('subNav', {
    controller: SubNavController,
    templateUrl: subNavTemplate.name
  });

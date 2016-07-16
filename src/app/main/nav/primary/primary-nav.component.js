import angular from 'angular';

import primaryNavTemplate from './primary-nav.tpl';
//import './primary-nav.css!';

class PrimaryNavController{

  /* @ngInject */
  constructor($log){
    this.test = 5;
    $log.info('Loaded primaryNav controller');
  }

}

export default angular
  .module('primaryNav', [
    primaryNavTemplate.name
  ])
  .component('primaryNav', {
    controller: PrimaryNavController,
    templateUrl: primaryNavTemplate.name
  });

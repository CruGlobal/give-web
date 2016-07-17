import angular from 'angular';

import template from './primary-nav.tpl';
//import './primary-nav.css!';

class PrimaryNavController{

  /* @ngInject */
  constructor(){

  }

}

export default angular
  .module('primaryNav', [
    template.name
  ])
  .component('primaryNav', {
    controller: PrimaryNavController,
    templateUrl: template.name
  });

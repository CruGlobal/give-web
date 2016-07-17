import angular from 'angular';

import template from './sub-nav.tpl';
//import './sub-nav.css!';

class SubNavController{

  /* @ngInject */
  constructor(){

  }

}

export default angular
  .module('subNav', [
    template.name
  ])
  .component('subNav', {
    controller: SubNavController,
    templateUrl: template.name
  });

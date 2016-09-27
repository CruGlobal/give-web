import angular from 'angular';
import commonModule from 'common/common.module';

import template from './designationEditor.tpl';

let componentName = 'designationEditor';

class DesignationEditorController {

  /* @ngInject */
  constructor( ) {
    this.phone = '(123) 456-7890';
  }

}

export default angular
  .module( componentName, [
    commonModule.name,
    template.name
  ] )
  .component( componentName, {
    controller:  DesignationEditorController,
    template: '<ng-transclude></ng-transclude>',
    transclude: true
  } );

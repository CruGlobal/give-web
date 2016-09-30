import angular from 'angular';
import commonModule from 'common/common.module';

import template from './designationEditor.tpl';

let componentName = 'designationEditor';

class DesignationEditorController {

  /* @ngInject */
  constructor( envService ) {
    this.imgDomain = envService.read('imgDomain');
  }

}

export default angular
  .module( componentName, [
    'environment',
    commonModule.name,
    template.name
  ] )
  .component( componentName, {
    controller:  DesignationEditorController,
    templateUrl: template.name
  } );

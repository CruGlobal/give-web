import angular from 'angular';
import commonModule from 'common/common.module';

import template from './designationEditor.tpl';

let componentName = 'designationEditor';

class DesignationEditorController {

  /* @ngInject */
  constructor( $http, envService ) {
    this.imgDomain = envService.read('imgDomain');
    this.designationSecurityEndpoint = '/bin/crugive/designation-security.html';

    $http.get(this.designationSecurityEndpoint, {
      params: {
        designationNumber: ''
      },
      withCredentials: true
    });
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

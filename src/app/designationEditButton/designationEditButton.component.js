import angular from 'angular';
import sessionService from 'common/services/session/session.service';
import designationEditorService from 'common/services/api/designationEditor.service';

import template from './designationEditButton.tpl';

let componentName = 'designationEditButton';

class DesignationEditButtonController {

  /* @ngInject */
  constructor( sessionService, designationEditorService ) {
    this.sessionService = sessionService;
    this.designationEditorService = designationEditorService;
  }

  $onInit() {
    if(this.designationNumber && this.sessionService.getRole() === 'REGISTERED'){
      this.designationEditorService.getContent(this.designationNumber).then(() => {
        this.showEditButton = true;
      });
    }
  }
}

export default angular
  .module( componentName, [
    template.name,
    sessionService.name,
    designationEditorService.name
  ] )
  .component( componentName, {
    controller:  DesignationEditButtonController,
    templateUrl: template.name,
    bindings:    {
      designationNumber: '@'
    }
  } );

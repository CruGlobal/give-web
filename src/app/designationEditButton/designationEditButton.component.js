import angular from 'angular';
import includes from 'lodash/includes';
import sessionService, {Roles} from 'common/services/session/session.service';
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
    if(this.designationNumber && includes([Roles.identified, Roles.registered], this.sessionService.getRole())){
      this.designationEditorService.getContent(this.designationNumber, this.campaignPage).then(() => {
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
      designationNumber: '@',
      campaignPage: '@'
    }
  } );

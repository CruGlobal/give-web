import angular from 'angular';
import includes from 'lodash/includes';
import sessionService, { Roles } from 'common/services/session/session.service';
import designationEditorService from 'common/services/api/designationEditor.service';

import template from './designationEditButton.tpl.html';

const componentName = 'designationEditButton';

class DesignationEditButtonController {
  /* @ngInject */
  constructor(
    sessionService,
    designationEditorService,
    $window,
    $httpParamSerializer,
  ) {
    this.sessionService = sessionService;
    this.designationEditorService = designationEditorService;

    this.$window = $window;
    this.$httpParamSerializer = $httpParamSerializer;
  }

  $onInit() {
    if (
      this.designationNumber &&
      includes(
        [Roles.identified, Roles.registered],
        this.sessionService.getRole(),
      )
    ) {
      this.designationEditorService
        .checkPermission(this.designationNumber, this.campaignPage)
        .then(
          () => {
            this.showEditButton = true;
          },
          () => {
            this.showEditButton = false;
          },
        );
    }
  }

  editPage() {
    this.$window.location =
      '/designation-editor.html?' +
      this.$httpParamSerializer({
        d: this.designationNumber,
        campaign: this.campaignPage,
      });
  }
}

export default angular
  .module(componentName, [sessionService.name, designationEditorService.name])
  .component(componentName, {
    controller: DesignationEditButtonController,
    templateUrl: template,
    bindings: {
      designationNumber: '@',
      campaignPage: '@',
    },
  });

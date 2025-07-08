import angular from 'angular';
import uibModal from 'angular-ui-bootstrap/src/modal';
import template from './newsletterSubscription.tpl.html';
import commonModule from 'common/common.module';

import newsletterModalController from './newsletterModal/newsletter.modal';
import newsletterModalTemplate from './newsletterModal/newsletterModal.tpl.html';

const componentName = 'newsletterSubscription';

class NewsletterSubscriptionController {
  /* @ngInject */
  constructor($uibModal) {
    this.$uibModal = $uibModal;
  }

  openNewsletterModal() {
    this.$uibModal.open({
      templateUrl: newsletterModalTemplate,
      controller: newsletterModalController.name,
      controllerAs: '$ctrl',
      resolve: {
        designationNumber: () => this.designationNumber,
        displayName: () => this.displayName,
      },
    });
  }
}

export default angular
  .module(componentName, [
    commonModule.name,
    newsletterModalController.name,
    uibModal,
  ])
  .component(componentName, {
    controller: NewsletterSubscriptionController,
    templateUrl: template,
    bindings: {
      designationNumber: '@',
      displayName: '@',
    },
  });

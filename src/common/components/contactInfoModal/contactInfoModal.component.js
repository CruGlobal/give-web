import angular from 'angular';
import 'angular-gettext';

import contactInfoComponent from 'common/components/contactInfo/contactInfo.component';

import sessionService from 'common/services/session/session.service';
import analyticsFactory from 'app/analytics/analytics.factory';

import template from './contactInfoModal.tpl.html';

const componentName = 'contactInfoModal';

class contactInfoModalController {
  /* @ngInject */
  constructor(gettext, sessionService, analyticsFactory) {
    this.gettext = gettext;
    this.sessionService = sessionService;
    this.analyticsFactory = analyticsFactory;
  }

  $onInit() {
    this.modalTitle = this.gettext('Your Contact Information');
    this.analyticsFactory.track('ga-registration-contact-information');
  }

  onSubmit(success) {
    if (success) {
      this.onSuccess();
    } else {
      this.submitted = false;
    }
  }
}

export default angular
  .module(componentName, [
    'gettext',
    contactInfoComponent.name,
    sessionService.name,
    analyticsFactory.name,
  ])
  .component(componentName, {
    controller: contactInfoModalController,
    templateUrl: template,
    bindings: {
      modalTitle: '=',
      signUpDonorDetails: '<?',
      onStateChange: '&',
      onSuccess: '&',
      onCancel: '&',
    },
  });

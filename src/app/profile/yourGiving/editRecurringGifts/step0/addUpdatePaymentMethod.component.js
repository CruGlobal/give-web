import angular from 'angular';

import paymentMethodForm from 'common/components/paymentMethods/paymentMethodForm/paymentMethodForm.component';

import profileService from 'common/services/api/profile.service';

import template from './addUpdatePaymentMethod.tpl.html';

const componentName = 'step0AddUpdatePaymentMethod';

class AddUpdatePaymentMethodsController {
  /* @ngInject */
  constructor($log, profileService) {
    this.$log = $log;
    this.profileService = profileService;
  }

  $onInit() {
    this.loadDonorDetails();
  }

  loadDonorDetails() {
    this.profileService.getDonorDetails().subscribe(
      (data) => {
        this.mailingAddress = data.mailingAddress;
      },
      (error) => {
        this.$log.error('Error loading donorDetails', error);
      },
    );
  }

  onPaymentFormStateChange($event) {
    this.paymentFormState = $event.state;
    if ($event.state === 'loading') {
      const request = this.paymentMethod
        ? this.profileService.updatePaymentMethod(
            this.paymentMethod,
            $event.payload,
          )
        : this.profileService.addPaymentMethod($event.payload);
      request.subscribe(
        () => {
          this.next();
        },
        (error) => {
          if (error.status !== 409) {
            this.$log.error('Error adding/updating payment method', error);
          }
          this.paymentFormState = 'error';
          this.paymentFormError = error.data;
        },
      );
    }
  }
}

export default angular
  .module(componentName, [paymentMethodForm.name, profileService.name])
  .component(componentName, {
    controller: AddUpdatePaymentMethodsController,
    templateUrl: template,
    bindings: {
      paymentMethod: '<',
      canGoBack: '<',
      dismiss: '&',
      previous: '&',
      next: '&',
    },
  });

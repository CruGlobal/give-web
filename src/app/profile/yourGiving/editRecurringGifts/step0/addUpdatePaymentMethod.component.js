import angular from 'angular';

import addNewPaymentMethod from 'common/components/paymentMethods/addNewPaymentMethod/addNewPaymentMethod.component';

import profileService from 'common/services/api/profile.service';

import template from './addUpdatePaymentMethod.tpl';

let componentName = 'step0AddUpdatePaymentMethod';

class AddUpdatePaymentMethodsController {

  /* @ngInject */
  constructor($log, profileService) {
    this.$log = $log;
    this.profileService = profileService;

    this.submissionError = {error: ''};
  }

  $onInit(){

  }

  onSubmit(success, data) {
    this.submissionError.error = '';

    if (success && data) {
      this.profileService.addPaymentMethod(data)
        .subscribe((data) => {
            this.next({ paymentMethod: data});
          },
          (error) => {
            this.$log.error('Error saving payment method', error);
            this.submitted = false;
            this.submissionError.error = error.data;
          });
    }else{
      this.submitted = false;
    }
  }
}

export default angular
  .module(componentName, [
    template.name,
    addNewPaymentMethod.name,
    profileService.name
  ])
  .component(componentName, {
    controller: AddUpdatePaymentMethodsController,
    templateUrl: template.name,
    bindings: {
      paymentMethod: '<',
      canGoBack: '<',
      dismiss: '&',
      previous: '&',
      next: '&'
    }
  });

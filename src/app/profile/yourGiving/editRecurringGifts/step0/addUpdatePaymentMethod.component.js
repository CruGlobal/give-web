import angular from 'angular';

import paymentMethodForm from 'common/components/paymentMethods/paymentMethodForm/paymentMethodForm.component';

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
    this.loadDonorDetails();
  }

  loadDonorDetails(){
    this.profileService.getDonorDetails()
      .subscribe((data) => {
        this.mailingAddress = data.mailingAddress;
      });
  }


  onSubmit(success, data) {
    this.submissionError.error = '';

    if (success && data) {
      if(this.paymentMethod){
        this.profileService.updatePaymentMethod(this.paymentMethod, data)
          .subscribe(() => {
              this.next();
            },
            (error) => {
              this.$log.error('Error updating payment method', error);
              this.submitted = false;
              this.submissionError.error = error.data;
            });
      }else {
        this.profileService.addPaymentMethod(data)
          .subscribe(() => {
              this.next();
            },
            (error) => {
              this.$log.error('Error saving new payment method', error);
              this.submitted = false;
              this.submissionError.error = error.data;
            });
      }
    }else{
      this.submitted = false;
    }
  }
}

export default angular
  .module(componentName, [
    template.name,
    paymentMethodForm.name,
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

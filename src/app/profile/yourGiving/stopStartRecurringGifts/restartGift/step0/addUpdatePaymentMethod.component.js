import angular from 'angular';
import template from './addUpdatePaymentMethod.tpl';

import paymentMethodForm from 'common/components/paymentMethods/paymentMethodForm/paymentMethodForm.component';
import profileService from 'common/services/api/profile.service';

let componentName = 'addUpdatePaymentMethod';

class addPaymentMethodController {

  /* @ngInject */
  constructor(profileService, $log) {
    this.profileService = profileService;
    this.$log = $log;
    this.submissionError = {
      loading: false
    };
  }

  $onInit(){
    this.loadDonorDetails();
  }

  loadDonorDetails() {
    this.profileService.getDonorDetails()
      .subscribe((data) => {
        this.mailingAddress = data.mailingAddress;
      },
      error => {
        this.$log.error('Error loading donorDetails', error);
      });
  }

  onSubmit(success, data) {
    if(success && data) {
      if(this.paymentMethod) {
        this.setLoading({loading: true});
        this.profileService.updatePaymentMethod(this.paymentMethod, data)
          .subscribe(
            () => {
              this.setLoading({loading: true});
              this.next();
            },
            error => {
              this.submissionError.error = 'Failed updating payment method';
              this.$log.error(this.submissionError.error, error.data);
            }
          );
      } else {
        this.setLoading({loading: true});
        this.profileService.addPaymentMethod(data)
          .subscribe(
            data => {
              this.setLoading({loading: false});
              this.paymentMethods.push(data);
              this.next();
            },
            error => {
              this.setLoading({loading: false});
              this.$log.error('Failed adding payment method.', error.data);
              this.submissionError.error = error.data;
            }
          );
      }
    } else {
      this.submissionError.loading = false;
    }
  }

}

export default angular
  .module( componentName, [
    template.name,
    paymentMethodForm.name,
    profileService.name
  ] )
  .component( componentName, {
    controller:  addPaymentMethodController,
    templateUrl: template.name,
    bindings:    {
      next: '&',
      previous: '&',
      setLoading: '&',
      paymentMethods: '<',
      paymentMethod: '<'
    }
  } );

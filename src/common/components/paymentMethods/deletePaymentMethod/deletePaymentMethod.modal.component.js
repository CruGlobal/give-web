import angular from 'angular';

import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component.js';
import profileService from 'common/services/api/profile.service.js';

import template from './deletePaymentMethod.modal.tpl';

let componentName = 'deletePaymentMethodModal';

class deletePaymentMethodModalController {

  /* @ngInject */
  constructor(profileService) {
    this.profileService = profileService;
    this.loading = false;
  }

  $onInit() {
    this.getPaymentMethods();
  }

  getPaymentMethods(){
    this.loading = true;
    this.profileService.getPaymentMethods()
      .subscribe((data) => {
        console.log(data);
        this.loading = false;
        this.paymentMethods = data;
      },(error) => {
        this.loading = false;
        this.log.error(error.data, error);
      })
  }

  onSubmit(){
    this.loading = true;
    this.profileService.deletePaymentMethod(this.resolve.uri)
      .subscribe(() => {
        this.loading = false;
        this.close();
      });
  }
}

export default angular
  .module(componentName, [
    template.name,
    loadingOverlay.name
  ])
  .component(componentName, {
    controller: deletePaymentMethodModalController,
    templateUrl: template.name,
    bindings: {
      resolve: '<',
      dismiss: '&',
      close: '&'
    }
  });

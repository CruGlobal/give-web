import angular from 'angular';
import template from './bank-account.tpl';
import displayAddressComponent from 'common/components/display-address/display-address.component';
import editPaymentMethodModal from 'common/components/paymentMethods/editPaymentMethod/editPaymentMethod.modal.component';

class BankAccountController{

  /* @ngInject */
  constructor(envService, $uibModal){
    this.isCollapsed = true;
    this.$uibModal = $uibModal;
    this.imgDomain = envService.read('imgDomain');
  }

  getExpiration(){
    return `${this.model['expiry-month']}/${this.model['expiry-year']}`;
  }

  editPaymentMethod() {
    this.editPaymentMethodModal = this.$uibModal.open({
      component: 'editPaymentMethodModal',
      backdrop: 'static', // Disables closing on click
      resolve: {
        model: () => this.model,
        paymentType: () => 'bankAccount',
        onSubmit: () => this.onSubmit,
        submissionError: () => {error: ''}
      }
    });
  }

}

let componentName = 'bankAccount';

export default angular
  .module(componentName, [
    template.name,
    displayAddressComponent.name,
    editPaymentMethodModal.name,
  ])
  .component(componentName, {
    controller: BankAccountController,
    templateUrl: template.name,
    bindings: {
      model: '<'
    }
  });

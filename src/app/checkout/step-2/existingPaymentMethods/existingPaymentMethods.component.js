import angular from 'angular';
import find from 'lodash/find';
import 'angular-ui-bootstrap';

import paymentMethodDisplay from 'common/components/paymentMethods/paymentMethodDisplay.component';
import addNewPaymentMethodModal from 'common/components/paymentMethods/addNewPaymentMethod/addNewPaymentMethod.modal.component';

import orderService, {existingPaymentMethodFlag} from 'common/services/api/order.service';

import template from './existingPaymentMethods.tpl';

let componentName = 'checkoutExistingPaymentMethods';

class ExistingPaymentMethodsController {

  /* @ngInject */
  constructor($log, orderService, $uibModal) {
    this.$log = $log;
    this.orderService = orderService;
    this.$uibModal = $uibModal;
  }

  $onInit(){
    this.loadPaymentMethods();
  }

  $onChanges(changes) {
    if (changes.submitted && changes.submitted.currentValue === true) {
      this.selectPayment();
    }
    if (changes.submitSuccess && changes.submitSuccess.currentValue === true) {
      this.loadPaymentMethods();
    }
  }

  loadPaymentMethods(){
    this.orderService.getExistingPaymentMethods()
      .subscribe((data) => {
        if (data.length > 0) {
          this.paymentMethods = data;
          this.selectDefaultPaymentMethod();
          this.onLoad({success: true, hasExistingPaymentMethods: true});
        }else{
          this.onLoad({success: true, hasExistingPaymentMethods: false});
        }
        this.addNewPaymentMethodModal && this.addNewPaymentMethodModal.close();
      }, (error) => {
        this.onLoad({success: false, error: error});
        this.addNewPaymentMethodModal && this.addNewPaymentMethodModal.close();
      });
  }

  selectDefaultPaymentMethod(){
    let chosenPaymentMethod = find(this.paymentMethods, {chosen: true});
    if(chosenPaymentMethod){
      // Select the payment method previously chosen for the order
      this.selectedPaymentMethod = chosenPaymentMethod.selectAction;
    }else{
      // Select the first payment method
      this.selectedPaymentMethod = this.paymentMethods[0].selectAction;
    }
  }

  openAddNewPaymentMethodModal(){
    this.addNewPaymentMethodModal = this.$uibModal.open({
      component: 'addNewPaymentMethodModal',
      size: 'large new-payment-method-modal',
      backdrop: 'static', // Disables closing on click
      resolve: {
        submissionError: this.submissionError,
        onSubmit: () => (params) => {
          params.stayOnStep = true;
          this.onSubmit(params);
        }
      }
    });
    this.addNewPaymentMethodModal.result.then(null, () => {
      this.onSubmit({success: false, error: ''}); // To clear the submissionErrors object in step 2
    });
  }

  selectPayment(){
    this.orderService.selectPaymentMethod(this.selectedPaymentMethod)
      .subscribe(() => {
          this.orderService.storeCardSecurityCode(existingPaymentMethodFlag);
          this.onSubmit({success: true});
        },
        (error) => {
          this.$log.error('Error selecting payment method', error);
          this.onSubmit({success: false, error: error});
        });
  }
}

export default angular
  .module(componentName, [
    template.name,
    'ui.bootstrap',
    paymentMethodDisplay.name,
    addNewPaymentMethodModal.name,
    orderService.name
  ])
  .component(componentName, {
    controller: ExistingPaymentMethodsController,
    templateUrl: template.name,
    bindings: {
      submitted: '<',
      submissionError: '<',
      submitSuccess: '<',
      onSubmit: '&',
      onLoad: '&'
    }
  });

import angular from 'angular';
import find from 'lodash/find';
import 'angular-ui-bootstrap';

import paymentMethodDisplay from 'common/components/paymentMethods/paymentMethodDisplay.component';
import paymentMethodFormModal from 'common/components/paymentMethods/paymentMethodForm/paymentMethodForm.modal.component';

import orderService from 'common/services/api/order.service';
import {validPaymentMethod} from 'common/services/paymentHelpers/validPaymentMethods';
import giveModalWindowTemplate from 'common/templates/giveModalWindow.tpl.html';

import template from './existingPaymentMethods.tpl.html';

let componentName = 'checkoutExistingPaymentMethods';

class ExistingPaymentMethodsController {

  /* @ngInject */
  constructor($log, orderService, $uibModal) {
    this.$log = $log;
    this.orderService = orderService;
    this.$uibModal = $uibModal;
    this.paymentFormResolve = {};
    this.validPaymentMethod = validPaymentMethod;
  }

  $onInit(){
    this.loadPaymentMethods();
  }

  $onChanges(changes) {
    if(changes.paymentFormState){
      const state = changes.paymentFormState.currentValue;
      this.paymentFormResolve.state = state;
      if(state === 'submitted' && !this.paymentMethodFormModal){
        this.selectPayment();
      }
      if(state === 'success'){
        this.loadPaymentMethods();
      }
    }
    if(changes.paymentFormError){
      this.paymentFormResolve.error = changes.paymentFormError.currentValue;
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
        this.paymentMethodFormModal && this.paymentMethodFormModal.close();
      }, (error) => {
        this.$log.error('Error loading paymentMethods', error);
        this.onLoad({success: false, error: error});
        this.paymentMethodFormModal && this.paymentMethodFormModal.close();
      });
  }

  selectDefaultPaymentMethod(){
    let chosenPaymentMethod = find(this.paymentMethods, {chosen: true});
    if(chosenPaymentMethod){
      // Select the payment method previously chosen for the order
      this.selectedPaymentMethod = chosenPaymentMethod;
    }else{
      // Select the first payment method
      this.selectedPaymentMethod = this.paymentMethods[0];
    }
  }

  openPaymentMethodFormModal(existingPaymentMethod){
    this.paymentMethodFormModal = this.$uibModal.open({
      component: 'paymentMethodFormModal',
      backdrop: 'static', // Disables closing on click
      windowTemplateUrl: giveModalWindowTemplate,
      resolve: {
        paymentForm: this.paymentFormResolve,
        paymentMethod: existingPaymentMethod,
        disableCardNumber: !!existingPaymentMethod,
        mailingAddress: this.mailingAddress,
        onPaymentFormStateChange: () => param => {
          param.$event.stayOnStep = true;
          param.$event.update = !!existingPaymentMethod;
          param.$event.paymentMethodToUpdate = existingPaymentMethod;
          this.onPaymentFormStateChange(param);
        }
      }
    });

    const resetForm = () => {
      this.onPaymentFormStateChange({
        $event: {
          state: 'unsubmitted'
        }
      });
      delete this.paymentMethodFormModal;
    };
    this.paymentMethodFormModal.result.then(resetForm, resetForm);
  }

  selectPayment(){
    if(this.selectedPaymentMethod.chosen){
      this.onPaymentFormStateChange({ $event: { state: 'loading' } });
    }else{
      this.orderService.selectPaymentMethod(this.selectedPaymentMethod.selectAction)
        .subscribe(() => {
            this.orderService.storeCardSecurityCode(null, this.selectedPaymentMethod.self.uri); // Unset the CVV unless the user has provided a CVV for the selected payment method this order
            this.onPaymentFormStateChange({ $event: { state: 'loading' } });
          },
          (error) => {
            this.$log.error('Error selecting payment method', error);
            this.onPaymentFormStateChange({ $event: { state: 'error', error: error } });
          });
    }
  }
}

export default angular
  .module(componentName, [
    'ui.bootstrap',
    paymentMethodDisplay.name,
    paymentMethodFormModal.name,
    orderService.name
  ])
  .component(componentName, {
    controller: ExistingPaymentMethodsController,
    templateUrl: template,
    bindings: {
      paymentFormState: '<',
      paymentFormError: '<',
      mailingAddress: '<',
      onPaymentFormStateChange: '&',
      onLoad: '&'
    }
  });

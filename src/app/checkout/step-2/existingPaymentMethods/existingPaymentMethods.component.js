import angular from 'angular';
import find from 'lodash/find';

import paymentMethodDisplay from 'common/components/paymentMethods/paymentMethodDisplay.component';

import orderService from 'common/services/api/order.service';
import sessionService from 'common/services/session/session.service';

import template from './existingPaymentMethods.tpl';

let componentName = 'checkoutExistingPaymentMethods';

class ExistingPaymentMethodsController {

  /* @ngInject */
  constructor($log, orderService, sessionService) {
    this.$log = $log;
    this.orderService = orderService;
    this.sessionService = sessionService;
  }

  $onInit(){
    this.loadPaymentMethods();
  }

  loadPaymentMethods(){
    if(this.sessionService.getRole() === 'REGISTERED') {
      this.orderService.getExistingPaymentMethods()
        .subscribe((data) => {
          if (data.length > 0) {
            this.paymentMethods = data;
            this.selectDefaultPaymentMethod();
            this.onLoad({success: true, hasExistingPaymentMethods: true});
          }else{
            this.onLoad({success: true, hasExistingPaymentMethods: false});
          }
        }, (error) => {
          this.onLoad({success: false, error: error});
        });
    }else{
      this.onLoad({success: true, hasExistingPaymentMethods: false});
    }
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

  $onChanges(changes) {
    if (changes.submitted.currentValue === true) {
      this.selectPayment();
    }
  }

  selectPayment(){
    this.orderService.selectPaymentMethod(this.selectedPaymentMethod)
      .subscribe(() => {
          this.onSave({success: true});
        },
        (error) => {
          this.$log.error('Error selecting payment method', error);
          this.onSave({success: false});
        });
  }
}

export default angular
  .module(componentName, [
    template.name,
    paymentMethodDisplay.name,
    orderService.name,
    sessionService.name
  ])
  .component(componentName, {
    controller: ExistingPaymentMethodsController,
    templateUrl: template.name,
    bindings: {
      paymentMethods: '<',
      submitted: '<',
      onSave: '&',
      onLoad: '&'
    }
  });

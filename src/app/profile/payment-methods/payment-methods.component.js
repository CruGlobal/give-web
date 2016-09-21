import angular from 'angular';
import template from './payment-methods.tpl';
import recurringGiftsComponent from './recurring-gifts/recurring-gifts.component';
import creditCard from './credit-card/credit-card.component';
import bankAccount from './bank-account/bank-account.component';
import profileService from 'common/services/api/profile.service';
import SessionModalWindowTemplate from 'common/services/session/sessionModalWindow.tpl';
import addNewPaymentMethodModal from 'common/components/paymentMethods/addNewPaymentMethod/addNewPaymentMethod.modal.component';
import orderService from 'common/services/api/order.service';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';

class PaymentMethodsController {

  /* @ngInject */
  constructor($uibModal, profileService, $log, orderService) {
    this.log = $log;
    this.orderService = orderService;
    this.$uibModal = $uibModal;
    this.paymentMethod = 'bankAccount';
    this.profileService = profileService;
    this.loading = false;
  }

  $onDestroy(){
    this.addNewPaymentMethodModal.close();
  }

  $onInit(){
    this.loading = true;
    this.profileService.getPaymentMethods()
      .subscribe(
        data => {
          this.paymentMethods = data;
          this.loading = false;
        },
        error => {
          this.log.error('Failed retrieving payment methods', error);
          this.loading = false;
        }
      );
  }
  addPaymentMethod() {
    this.addNewPaymentMethodModal = this.$uibModal.open({
      component: 'addNewPaymentMethodModal',
      size: 'large new-payment-method-modal',
      backdrop: 'static', // Disables closing on click
      resolve: {
        onSubmit: () => this.onSubmit,
        orderService: () => this.orderService
      }
    });
  }

  onSubmit(e) {
    console.log(e);
    if(e.data) {
      this.submitted = true;
      this.orderService.addPaymentMethod(e.data)
        .subscribe(
          () => {
            this.submitted = false;
            console.log('success');
          },
          (error) => {
            this.$log.error('Error adding payment method', error);
          });
    }
  }


  isCard(paymentMethod) {
    return paymentMethod['card-number'] ? true : false;
  }
}

let componentName = 'paymentMethods';

export default angular
  .module(componentName, [
    template.name,
    recurringGiftsComponent.name,
    addNewPaymentMethodModal.name,
    bankAccount.name,
    creditCard.name,
    loadingOverlay.name
  ])
  .component(componentName, {
    controller: PaymentMethodsController,
    templateUrl: template.name
  });

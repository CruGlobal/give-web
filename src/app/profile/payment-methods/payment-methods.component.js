import angular from 'angular';
import template from './payment-methods.tpl';
import recurringGiftsComponent from './recurring-gifts/recurring-gifts.component';
import creditCard from './credit-card/credit-card.component';
import bankAccount from './bank-account/bank-account.component';
import profileService from 'common/services/api/profile.service';
import addNewPaymentMethodModal from 'common/components/paymentMethods/addNewPaymentMethod/addNewPaymentMethod.modal.component';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';

class PaymentMethodsController {

  /* @ngInject */
  constructor($uibModal, profileService, $log) {
    this.log = $log;
    this.profileService = profileService;
    this.$uibModal = $uibModal;
    this.paymentMethod = 'bankAccount';
    this.profileService = profileService;
    this.loading = false;
    this.submissionError = {error: ''};
  }

  $onDestroy(){
    this.addNewPaymentMethodModal.close();
    this.editNewPaymentMethodModal.close();
  }

  $onInit(){
    this.loading = true;
    this.loadPaymentMethods();
  }

  loadPaymentMethods() {
    this.profileService.getPaymentMethodsWithDonations()
      .subscribe(
        data => {
          this.loading = false;
          this.paymentMethods = data;
        },
        error => {
          this.loading = false;
          this.error = 'Failed retrieving payment methods';
          this.log.error(this.error, error);
        }
      );
  }

  addPaymentMethod() {
    this.addNewPaymentMethodModal = this.$uibModal.open({
      component: 'addNewPaymentMethodModal',
      size: 'large new-payment-method-modal',
      backdrop: 'static',
      resolve: {
        onSubmit: () => this.onSubmit,
        profileService: () => this.profileService,
        submitted: false,
        submissionError: this.submissionError,
        log: this.log,
        parent: this
      }
    });
    this.addNewPaymentMethodModal.result.then(() => {
      this.loading = true;
      this.loadPaymentMethods();
    });
  }

  onSubmit(e) {
    if(e.data) {
      this.profileService.addPaymentMethod(e.data)
        .subscribe((data) => {
          this.submitted = false;
          this.parent.addNewPaymentMethodModal.close();
        },
          (error) => {
            this.submitted = false;
            this.submissionError.error = error.data;
            this.log.error('error.data',error)
          });
    } else if(!e.success) {
      this.submitted = false;
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

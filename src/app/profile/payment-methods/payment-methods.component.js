import angular from 'angular';
import template from './payment-methods.tpl';
import recurringGiftsComponent from './recurring-gifts/recurring-gifts.component';
import profileService from 'common/services/api/profile.service.js';
import paymentMethod from './payment-method/payment-method.component';
import addNewPaymentMethodModal from 'common/components/paymentMethods/addNewPaymentMethod/addNewPaymentMethod.modal.component';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';
import giveModalWindowTemplate from 'common/templates/giveModalWindow.tpl';
import paymentMethodDisplay from 'common/components/paymentMethods/paymentMethodDisplay.component';

class PaymentMethodsController {

  /* @ngInject */
  constructor($uibModal, profileService, $log, $timeout) {
    this.log = $log;
    this.$uibModal = $uibModal;
    this.paymentMethod = 'bankAccount';
    this.profileService = profileService;
    this.loading = false;
    this.submissionError = {error: ''};
    this.successMessage = { show: false };
    this.$timeout = $timeout;
  }

  $onDestroy(){
    if(this.addNewPaymentMethodModal) {
      this.addNewPaymentMethodModal.close();
    }
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
      backdrop: 'static',
      size: 'new-payment-method-modal',
      windowTemplateUrl: giveModalWindowTemplate.name,
      resolve: {
        onSubmit: () => this.onSubmit,
        profileService: this.profileService,
        submitted: false,
        submissionError: this.submissionError,
        log: this.log,
        parentComponent: this
      }
    });
    this.addNewPaymentMethodModal.result.then((data) => {
      this.successMessage = {
        show: true,
        type: 'paymentMethodAdded'
      };
      this.paymentMethods.push(data);
      this.$timeout(()=>{
        this.successMessage.show = false;
      },60000);
    });
  }

  onSubmit(e) {
    if(e.data) {
      this.profileService.addPaymentMethod(e.data)
        .subscribe((data) => {
          this.submitted = false;
          this.parentComponent.addNewPaymentMethodModal.close(data);
        },
        (error) => {
          this.submitted = false;
          this.submissionError.error = error.data;
          this.log.error('error.data',error);
        });
    } else if(!e.success) {
      this.submitted = false;
    }
  }

  onDelete(){
    this.successMessage.show = true;
    this.successMessage.type = 'paymentMethodDeleted';
    this.$timeout(()=>{
      this.successMessage.show = false;
    },60000);
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
    giveModalWindowTemplate.name,
    paymentMethod.name,
    loadingOverlay.name,
    profileService.name,
    paymentMethodDisplay.name
  ])
  .component(componentName, {
    controller: PaymentMethodsController,
    templateUrl: template.name
  });

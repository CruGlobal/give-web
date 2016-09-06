import angular from 'angular';
import creditCard from 'app/checkout/step-2/credit-card/credit-card.component';
import bankAccount from 'app/checkout/step-2/bank-account/bank-account.component';
import loadingOverlay from 'src/common/components/loadingOverlay/loadingOverlay.component';

let controllerName = 'modal';

class ModalController{

  /* @ngInject */
  constructor($uibModalInstance){
    this.submitted = false;
    this.error = false;
    this.paymentType = 'bankAccount';
    this.$uibModalInstance = $uibModalInstance;
  }

  switchPaymentType(type){
    this.paymentType = type;
  }

  onSave(success,error) {
    this.submitted = false;
    this.error = false;
    if(success) {
      this.$uibModalInstance.close('Success');
    } else {
      this.error = error;
    }
  }

  save() {
    this.submitted = true;
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }
}

export default angular
  .module(controllerName,[
    creditCard.name,
    bankAccount.name,
    loadingOverlay.name
  ])
  .controller(controllerName, ModalController);

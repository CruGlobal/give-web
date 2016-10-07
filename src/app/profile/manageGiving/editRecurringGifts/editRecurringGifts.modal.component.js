import angular from 'angular';
import some from 'lodash/some';

import loadingComponent from 'common/components/loading/loading.component';
import step0AddUpdatePaymentMethod from './step0/addUpdatePaymentMethod.component';

import profileService from 'common/services/api/profile.service';

import template from './editRecurringGifts.modal.tpl';

let componentName = 'editRecurringGiftsModal';

class EditRecurringGiftsModalController {

  /* @ngInject */
  constructor($log, profileService) {
    this.$log = $log;
    this.profileService = profileService;
  }

  $onInit(){
    this.loadPaymentMethods();
  }

  loadPaymentMethods(){
    this.state = 'loading';
    this.profileService.getPaymentMethods()
      .subscribe((data) => {
        this.paymentMethods = data;
        this.hasPaymentMethods = this.paymentMethods && this.paymentMethods.length > 0;
        this.hasValidPaymentMethods = some(this.paymentMethods, (paymentMethod) => {
          return paymentMethod.self.type === 'elasticpath.bankaccounts.bank-account' || paymentMethod.status === 'Active';
        });
        this.next();
      }, (error) => {
        this.state = 'error';
        this.$log.error('Error loading payment methods', error);
      });
  }

  next(paymentMethod, recurringGiftChanges, additions){
    switch(this.state){
      case 'loading':
        if(this.hasValidPaymentMethods){
          this.state = 'step1EditRecurringGifts';
        }else if(this.paymentMethods && this.paymentMethods.length > 0){
          this.state = 'step0PaymentMethodList';
        }else{
          this.state = 'step0AddUpdatePaymentMethod';
        }
        break;
      case 'error':
        this.state = 'step0AddUpdatePaymentMethod';
        break;
      case 'step0PaymentMethodList':
        this.paymentMethod = paymentMethod;
        this.state = 'step0AddUpdatePaymentMethod';
        break;
      case 'step0AddUpdatePaymentMethod':
        this.paymentMethod = paymentMethod;
        this.state = 'step1EditRecurringGifts';
        break;
      case 'step1EditRecurringGifts':
        this.recurringGiftChanges = recurringGiftChanges;
        if(this.hasRecentRecipients){
          this.state = 'step2AddRecentRecipients';
        }else{
          this.state = 'step4Confirm';
        }
        break;
      case 'step2AddRecentRecipients':
        this.additions = additions;
        if(this.additions && this.additions.length > 0) {
          this.state = 'step3ConfigureRecentRecipients';
        }else{
          this.state = 'step4Confirm';
        }
        break;
      case 'step3ConfigureRecentRecipients':
        this.additions = additions;
        this.state = 'step4Confirm';
        break;
      case 'step4Confirm':
        this.close();
        break;
    }
  }

  previous(){
    switch(this.state){
      case 'step4Confirm':
        if(this.additions && this.additions.length > 0){
          this.state = 'step3ConfigureRecentRecipients';
        }else{
          this.state = 'step1EditRecurringGifts';
        }
        break;
      case 'step3ConfigureRecentRecipients':
        this.state = 'step2AddRecentRecipients';
        break;
      case 'step2AddRecentRecipients':
        this.state = 'step1EditRecurringGifts';
        break;
    }
  }

}

export default angular
  .module(componentName, [
    template.name,
    loadingComponent.name,
    step0AddUpdatePaymentMethod.name,
    profileService.name
  ])
  .component(componentName, {
    controller: EditRecurringGiftsModalController,
    templateUrl: template.name,
    bindings: {
      close: '&',
      dismiss: '&'
    }
  });

import angular from 'angular';
import template from './payment-method.tpl';
import displayAddressComponent from 'common/components/display-address/display-address.component';
import recurringGiftsComponent from '../recurring-gifts/recurring-gifts.component';
import paymentMethodFormModal from 'common/components/paymentMethods/paymentMethodForm/paymentMethodForm.modal.component';
import deletePaymentMethodModal from 'common/components/paymentMethods/deletePaymentMethod/deletePaymentMethod.modal.component.js';
import giveModalWindowTemplate from 'common/templates/giveModalWindow.tpl';
import profileService from 'common/services/api/profile.service';
import formatAddressForTemplate from 'common/services/addressHelpers/formatAddressForTemplate';

import analyticsFactory from 'app/analytics/analytics.factory';

let componentName = 'paymentMethod';

class PaymentMethodController{

  /* @ngInject */
  constructor($log, envService, $uibModal, profileService, analyticsFactory){
    this.$log = $log;
    this.isCollapsed = true;
    this.$uibModal = $uibModal;
    this.profileService = profileService;
    this.imgDomain = envService.read('imgDomain');
    this.paymentFormResolve = {};
    this.analyticsFactory = analyticsFactory;
  }

  getExpiration(){
    return `${this.model['expiry-month']}/${this.model['expiry-year']}`;
  }

  isCard(){
    return !!this.model['card-number'];
  }

  editPaymentMethod() {
    this.successMessage.show = false;
    this.editPaymentMethodModal = this.$uibModal.open({
      component: 'paymentMethodFormModal',
      windowTemplateUrl: giveModalWindowTemplate.name,
      resolve: {
        paymentForm: this.paymentFormResolve,
        paymentMethod: this.model,
        mailingAddress: this.mailingAddress,
        onPaymentFormStateChange: () => params => this.onPaymentFormStateChange(params.$event)
      }
    });
  }

  onPaymentFormStateChange($event){
    this.paymentFormResolve.state = $event.state;
    if($event.state === 'loading' && $event.payload){
      this.profileService.updatePaymentMethod(this.model, $event.payload)
        .subscribe(() => {
            let editedData = {};
            if($event.payload.creditCard) {
              editedData = $event.payload.creditCard;
              editedData['card-number'] = $event.payload.paymentMethodNumber ? $event.payload.paymentMethodNumber : editedData['card-number'];
              editedData.address = formatAddressForTemplate(editedData.address);
            } else {
              editedData = $event.payload.bankAccount;
              editedData['display-account-number'] = $event.payload.paymentMethodNumber ? $event.payload.paymentMethodNumber : editedData['display-account-number'];
            }
            for(let key in editedData){
              this.model[key] = editedData[key];
            }
            this.successMessage = {
              show: true,
              type: 'paymentMethodUpdated'
            };
            this.paymentFormResolve.state = 'unsubmitted';
            this.editPaymentMethodModal.close();
            this.analyticsFactory.setEvent('add payment method');
          },
          error => {
            this.$log.error('Error updating payment method', error);
            this.paymentFormResolve.state = 'error';
            this.paymentFormResolve.error = error.data;
          }
        );
    }
  }

  deletePaymentMethod(){
    this.successMessage.show = false;
    this.deletePaymentMethodModal = this.$uibModal.open({
      component: 'deletePaymentMethodModal',
      backdrop: 'static',
      windowTemplateUrl: giveModalWindowTemplate.name,
      resolve: {
        paymentMethod: () => this.model,
        mailingAddress: () => this.mailingAddress,
        paymentMethodsList: () => this.paymentMethodsList
      }
    });
    this.deletePaymentMethodModal.result.then(() => {
      this.onDelete();
      this.analyticsFactory.setEvent('delete payment method');
    }, angular.noop);
  }

  $onDestroy(){
    if(this.deletePaymentMethodModal) {
      this.deletePaymentMethodModal.dismiss();
    }
    if(this.editPaymentMethodModal){
      this.editPaymentMethodModal.dismiss();
    }
  }

}

export default angular
  .module(componentName, [
    template.name,
    displayAddressComponent.name,
    recurringGiftsComponent.name,
    paymentMethodFormModal.name,
    deletePaymentMethodModal.name,
    giveModalWindowTemplate.name,
    profileService.name,
    analyticsFactory.name
  ])
  .component(componentName, {
    controller: PaymentMethodController,
    templateUrl: template.name,
    bindings: {
      model: '<',
      successMessage: '=',
      paymentMethodsList: '<',
      mailingAddress: '<',
      onDelete: '&'
    }
  });

import angular from 'angular';
import template from './payment-methods.tpl';
import recurringGiftsComponent from './recurring-gifts/recurring-gifts.component';
import profileService from 'common/services/api/profile.service.js';
import paymentMethod from './payment-method/payment-method.component';
import paymentMethodFormModal from 'common/components/paymentMethods/paymentMethodForm/paymentMethodForm.modal.component';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';
import giveModalWindowTemplate from 'common/templates/giveModalWindow.tpl';
import paymentMethodDisplay from 'common/components/paymentMethods/paymentMethodDisplay.component';
import sessionEnforcerService, {EnforcerCallbacks, EnforcerModes} from 'common/services/session/sessionEnforcer.service';
import {Roles} from 'common/services/session/session.service';
import commonModule from 'common/common.module';

class PaymentMethodsController {

  /* @ngInject */
  constructor($uibModal, profileService, sessionEnforcerService, $log, $timeout, $window, $location) {
    this.log = $log;
    this.$uibModal = $uibModal;
    this.paymentMethod = 'bankAccount';
    this.profileService = profileService;
    this.loading = false;
    this.submissionError = {error: ''};
    this.successMessage = { show: false };
    this.$timeout = $timeout;
    this.$window = $window;
    this.$location = $location;
    this.sessionEnforcerService = sessionEnforcerService;
  }

  $onDestroy(){
    if(this.paymentMethodFormModal) {
      this.paymentMethodFormModal.close();
    }
  }

  $onInit(){
    this.enforcerId = this.sessionEnforcerService([Roles.registered], {
      [EnforcerCallbacks.signIn]: () => {
        this.loading = true;
        this.loadPaymentMethods();
        this.loadDonorDetails();
      },
      [EnforcerCallbacks.cancel]: () => {
        this.$window.location = '/';
      }
    }, EnforcerModes.donor);
    this.loading = true;
    this.loadPaymentMethods();
    this.loadDonorDetails();
  }

  loadDonorDetails() {
    this.profileService.getDonorDetails()
      .subscribe((data) => {
        this.mailingAddress = data.mailingAddress;
      });
  }

  loadPaymentMethods() {
    this.profileService.getPaymentMethodsWithDonations()
      .subscribe(
        data => {
          this.submissionError.error = '';
          this.loading = false;
          this.paymentMethods = data;
        },
        error => {
          this.loading = false;
          this.submissionError.error = 'Failed retrieving payment methods.';
          this.log.error(this.submissionError.error, error);
        }
      );
  }

  addPaymentMethod() {
    this.paymentMethodFormModal = this.$uibModal.open({
      component: 'paymentMethodFormModal',
      backdrop: 'static',
      windowTemplateUrl: giveModalWindowTemplate.name,
      resolve: {
        mailingAddress: this.mailingAddress,
        submissionError: this.submissionError,
        onSubmit: () => params => this.onSubmit(params)
      }
    });
    this.paymentMethodFormModal.result.then((data) => {
      this.successMessage = {
        show: true,
        type: 'paymentMethodAdded'
      };
      data['_recurringgifts'] = [{donations: []}];
      this.paymentMethods.push(data);
      this.$timeout(()=>{
        this.successMessage.show = false;
      },60000);
    });
  }

  onSubmit(e) {
    if(e.success && e.data) {
      this.profileService.addPaymentMethod(e.data)
        .subscribe((data) => {
            this.submissionError.loading = false;
            this.paymentMethodFormModal.close(data);
          },
          (error) => {
            this.submissionError.loading = false;
            this.submissionError.error = error.data;
            this.log.error('error.data',error);
          });
    } else {
      this.submissionError.loading = false;
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
    commonModule.name,
    recurringGiftsComponent.name,
    paymentMethodFormModal.name,
    giveModalWindowTemplate.name,
    paymentMethod.name,
    loadingOverlay.name,
    profileService.name,
    paymentMethodDisplay.name,
    sessionEnforcerService.name
  ])
  .component(componentName, {
    controller: PaymentMethodsController,
    templateUrl: template.name
  });

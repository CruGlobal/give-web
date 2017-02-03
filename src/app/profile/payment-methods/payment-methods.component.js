import angular from 'angular';
import template from './payment-methods.tpl';
import recurringGiftsComponent from './recurring-gifts/recurring-gifts.component';
import profileService from 'common/services/api/profile.service.js';
import paymentMethod from './payment-method/payment-method.component';
import paymentMethodFormModal from 'common/components/paymentMethods/paymentMethodForm/paymentMethodForm.modal.component';
import giveModalWindowTemplate from 'common/templates/giveModalWindow.tpl';
import paymentMethodDisplay from 'common/components/paymentMethods/paymentMethodDisplay.component';
import sessionEnforcerService, {EnforcerCallbacks, EnforcerModes} from 'common/services/session/sessionEnforcer.service';
import {Roles, SignOutEvent} from 'common/services/session/session.service';
import commonModule from 'common/common.module';
import formatAddressForTemplate from 'common/services/addressHelpers/formatAddressForTemplate';

class PaymentMethodsController {

  /* @ngInject */
  constructor($rootScope, $uibModal, profileService, sessionEnforcerService, $log, $timeout, $window, $location) {
    this.$log = $log;
    this.$rootScope = $rootScope;
    this.$uibModal = $uibModal;
    this.paymentMethod = 'bankAccount';
    this.profileService = profileService;
    this.paymentFormResolve = {};
    this.successMessage = { show: false };
    this.$timeout = $timeout;
    this.$window = $window;
    this.paymentMethods = [];
    this.$location = $location;
    this.sessionEnforcerService = sessionEnforcerService;
  }

  $onDestroy(){
    // Destroy enforcer
    this.sessionEnforcerService.cancel( this.enforcerId );

    if(this.paymentMethodFormModal) {
      this.paymentMethodFormModal.close();
    }
  }

  $onInit(){
    this.enforcerId = this.sessionEnforcerService([Roles.registered], {
      [EnforcerCallbacks.signIn]: () => {
        this.loadPaymentMethods();
        this.loadDonorDetails();
      },
      [EnforcerCallbacks.cancel]: () => {
        this.$window.location = '/';
      }
    }, EnforcerModes.donor);

    this.$rootScope.$on( SignOutEvent, ( event ) => this.signedOut( event ) );

    this.loading = true;
  }

  loadDonorDetails() {
    this.profileService.getDonorDetails()
      .subscribe(data => {
        this.mailingAddress = data.mailingAddress;
      }, error => {
        this.$log.error('Error loading mailing address for use in profile payment method add payment method modals', error);
      });
  }

  loadPaymentMethods() {
    this.loading = true;
    this.loadingError = false;
    this.profileService.getPaymentMethodsWithDonations()
      .subscribe(
        data => {
          this.loading = false;
          this.paymentMethods = data;
        },
        error => {
          this.loading = false;
          this.loadingError = true;
          this.$log.error('Error loading payment methods', error);
        }
      );
  }

  addPaymentMethod() {
    this.paymentMethodFormModal = this.$uibModal.open({
      component: 'paymentMethodFormModal',
      backdrop: 'static',
      windowTemplateUrl: giveModalWindowTemplate.name,
      resolve: {
        paymentForm: this.paymentFormResolve,
        mailingAddress: this.mailingAddress,
        onPaymentFormStateChange: () => param => this.onPaymentFormStateChange(param.$event)
      }
    });
    this.paymentMethodFormModal.result.then(data => {
      this.successMessage = {
        show: true,
        type: 'paymentMethodAdded'
      };
      data['_recurringgifts'] = [{donations: []}];
      this.paymentMethods.push(data);
      this.$timeout(()=>{
        this.successMessage.show = false;
      }, 60000);
    }, angular.noop);
  }

  onPaymentFormStateChange($event) {
    this.paymentFormResolve.state = $event.state;
    if($event.state === 'loading' && $event.payload){
      this.profileService.addPaymentMethod($event.payload)
        .subscribe(data => {
            data.address = data.address && formatAddressForTemplate(data.address);
            this.paymentMethodFormModal.close(data);
          },
          error => {
            this.$log.error('Error adding payment method',error);
            this.paymentFormResolve.state = 'error';
            this.paymentFormResolve.error = error.data;
          });
    }
  }

  onDelete(){
    this.successMessage.show = true;
    this.successMessage.type = 'paymentMethodDeleted';
    this.$timeout(() => {
      this.successMessage.show = false;
    }, 60000);
  }

  isCard(paymentMethod) {
    return !!paymentMethod['card-number'];
  }

  signedOut( event ) {
    if ( !event.defaultPrevented ) {
      event.preventDefault();
      this.$window.location = '/';
    }
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
    profileService.name,
    paymentMethodDisplay.name,
    sessionEnforcerService.name
  ])
  .component(componentName, {
    controller: PaymentMethodsController,
    templateUrl: template.name
  });

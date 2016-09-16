import angular from 'angular';
import 'angular-messages';
import toString from 'lodash/toString';
import find from 'lodash/find';
import range from 'lodash/range';
import 'rxjs/add/operator/combineLatest';

import displayAddressComponent from 'common/components/display-address/display-address.component';
import loadingComponent from 'common/components/loading/loading.component';

import showErrors from 'common/filters/showErrors.filter';

import paymentValidationService from 'common/services/paymentHelpers/paymentValidation.service';
import geographiesService from 'common/services/api/geographies.service';
import orderService from 'common/services/api/order.service';
import ccpService from 'common/services/paymentHelpers/ccp.service';

import template from './creditCardForm.tpl';

let componentName = 'creditCardForm';

class CreditCardController {

  /* @ngInject */
  constructor($scope, $log, paymentValidationService, geographiesService, orderService, ccpService) {
    this.$scope = $scope;
    this.$log = $log;
    this.paymentValidationService = paymentValidationService;
    this.geographiesService = geographiesService;
    this.orderService = orderService;
    this.ccpService = ccpService;

    this.creditCardPayment = {};
    this.billingAddress = {
      isMailingAddress: true,
      country: 'US'
    };
  }

  $onInit(){
    this.loadCcp();
    this.waitForFormInitialization();
    this.loadDonorDetails();
    this.loadCountries();
    this.initializeExpirationDateOptions();
  }

  $onChanges(changes) {
    if (changes.submitted.currentValue === true) {
      this.savePayment();
    }
  }

  loadCcp(){
    this.ccpService.get()
      .subscribe((ccp) => {
        this.ccp = ccp;
      });
  }

  waitForFormInitialization() {
    let unregister = this.$scope.$watch('$ctrl.creditCardPaymentForm', () => {
      unregister();
      this.addCustomValidators();
    });
  }

  addCustomValidators() {
    this.creditCardPaymentForm.cardNumber.$parsers.push(this.paymentValidationService.stripNonDigits);
    this.creditCardPaymentForm.cardNumber.$validators.minlength = number => toString(number).length >= 13;
    this.creditCardPaymentForm.cardNumber.$validators.maxlength = number => toString(number).length <= 16;
    this.creditCardPaymentForm.cardNumber.$validators.cardNumber = this.paymentValidationService.validateCardNumber();

    this.creditCardPaymentForm.expiryMonth.$validators.expired = expiryMonth => {
      let currentDate = new Date();
      let chosenYear = parseInt(this.creditCardPayment.expiryYear);
      let chosenMonth = parseInt(expiryMonth);
      return !this.creditCardPayment.expiryYear ||
        chosenYear > currentDate.getFullYear() ||
        chosenYear === currentDate.getFullYear() && chosenMonth >= currentDate.getMonth() + 1;
    };
    this.creditCardPaymentForm.expiryYear.$viewChangeListeners.push(() => {
      // Revalidate expiryMonth after expiryYear changes
      this.creditCardPaymentForm.expiryMonth.$validate();
    });

    this.creditCardPaymentForm.securityCode.$parsers.push(this.paymentValidationService.stripNonDigits);
    this.creditCardPaymentForm.securityCode.$validators.minlength = number => toString(number).length >= 3;
    this.creditCardPaymentForm.securityCode.$validators.maxlength = number => toString(number).length <= 4;
  }

  loadCountries(){
    this.geographiesService.getCountries()
      .subscribe((data) => {
        this.countries = data;
        this.refreshRegions(this.billingAddress.country);
      });
  }

  refreshRegions(countryCode){
    let country = find(this.countries, {name: countryCode});
    if(!country){ return; }

    this.geographiesService.getRegions(country)
      .subscribe((data) => {
        this.regions = data;
      });
  }

  loadDonorDetails(){
    this.orderService.getDonorDetails()
      .subscribe((data) => {
        this.donorDetails = data;
      });
  }

  initializeExpirationDateOptions(){
    let currentYear = (new Date()).getFullYear();
    this.expirationDateYears = range(currentYear, currentYear + 20);
  }

  savePayment(){
    this.creditCardPaymentForm.$setSubmitted();
    if(this.creditCardPaymentForm.$valid){
      let ccpCreditCardNumber = new (this.paymentValidationService.ccp.CardNumber)(this.creditCardPayment.cardNumber);
      let ccpSecurityCode = new (this.paymentValidationService.ccp.CardSecurityCode)(this.creditCardPayment.securityCode);
      let billingAddress = {
        address: this.billingAddress.isMailingAddress ? this.donorDetails.mailingAddress : this.billingAddress,
        name: { //TODO: do we need to ask for and send the billing addressee? It seems to be required
          'family-name': 'none',
          'given-name': 'none'
        }
      };
      this.onSubmit({
        success: true,
        data: {
          creditCard: {
            'card-number': ccpCreditCardNumber.encrypt(),
            'cardholder-name': this.creditCardPayment.cardholderName,
            'expiry-month': this.creditCardPayment.expiryMonth,
            'expiry-year': this.creditCardPayment.expiryYear,
            ccv: ccpSecurityCode.encrypt()
          },
          billingAddress: billingAddress
        }
      });
    }else{
      this.onSubmit({success: false});
    }
  }
}

export default angular
  .module(componentName, [
    template.name,
    'ngMessages',
    displayAddressComponent.name,
    loadingComponent.name,
    showErrors.name,
    paymentValidationService.name,
    geographiesService.name,
    orderService.name,
    ccpService.name
  ])
  .component(componentName, {
    controller: CreditCardController,
    templateUrl: template.name,
    bindings: {
      submitted: '<',
      onSubmit: '&'
    }
  });

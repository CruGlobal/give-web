import angular from 'angular';
import 'angular-messages';
import toString from 'lodash/toString';
import find from 'lodash/find';
import 'rxjs/add/operator/combineLatest';

import displayAddressComponent from 'common/components/display-address/display-address.component';

import showErrors from 'common/filters/showErrors.filter';

import paymentValidationService from 'common/services/paymentValidation.service';
import orderService from 'common/services/api/order.service';
import geographiesService from 'common/services/api/geographies.service';

import template from './credit-card.tpl';

let componentName = 'checkoutCreditCard';

class CreditCardController {

  /* @ngInject */
  constructor($scope, $log, paymentValidationService, orderService, geographiesService) {
    this.$scope = $scope;
    this.$log = $log;
    this.paymentValidationService = paymentValidationService;
    this.orderService = orderService;
    this.geographiesService = geographiesService;

    this.creditCardPayment = {};
    this.billingAddress = {
      isMailingAddress: true,
      country: 'US'
    };
  }

  $onInit(){
    this.waitForFormInitialization();
    this.loadDonorDetails();
    this.loadCountries();
  }

  $onChanges(changes) {
    if (changes.submitted.currentValue === true) {
      this.savePayment();
    }
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

    this.creditCardPaymentForm.expiryYear.$validators.length = number => toString(number).length === 2 || toString(number).length === 4;

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

      this.orderService.addCreditCardPayment({
          'card-number': ccpCreditCardNumber.encrypt(),
          'cardholder-name': this.creditCardPayment.cardholderName,
          'expiry-month': this.creditCardPayment.expiryMonth,
          'expiry-year': this.creditCardPayment.expiryYear
        })
        .combineLatest(this.orderService.addBillingAddress(billingAddress))
        .subscribe((data) => {
            this.$log.info('added credit card and billing address', data);
            this.orderService.storeCardSecurityCode(ccpSecurityCode.encrypt());
            this.onSave({success: true});
          },
          (error) => {
            this.$log.error('Error saving credit card or billing address info', error);
            this.onSave({success: false});
          });
    }else{
      this.onSave({success: false});
    }
  }
}

export default angular
  .module(componentName, [
    template.name,
    'ngMessages',
    displayAddressComponent.name,
    showErrors.name,
    paymentValidationService.name,
    orderService.name,
    geographiesService.name
  ])
  .component(componentName, {
    controller: CreditCardController,
    templateUrl: template.name,
    bindings: {
      submitted: '<',
      onSave: '&'
    }
  });

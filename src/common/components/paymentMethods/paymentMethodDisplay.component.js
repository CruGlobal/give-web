import angular from 'angular'
import appConfig from 'common/app.config'
import get from 'lodash/get'
import template from './paymentMethodDisplay.tpl.html'
import creditCardForm from './creditCardForm/creditCardForm.component'
import tsys from 'common/services/api/tsys.service'
import { Observable } from 'rxjs/Observable'
import * as cruPayments from '@cruglobal/cru-payments/dist/cru-payments'
import { scrollModalToTop } from 'common/services/modalState.service'
import analyticsFactory from 'app/analytics/analytics.factory'
import showErrors from 'common/filters/showErrors.filter'
import creditCardNumberDirective from '../../directives/creditCardNumber.directive'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/combineLatest'
import 'rxjs/add/operator/mergeMap'
const componentName = 'paymentMethodDisplay'

class PaymentMethodDisplayController {
  /* @ngInject */
  constructor ($scope, $log, analyticsFactory, envService, tsysService) {
    this.imgDomain = envService.read('imgDomain');
    this.tsysService = tsysService
    this.$log = $log
    this.envService = envService
    this.analyticsFactory = analyticsFactory
    this.$scope = $scope;
  }

  $onInit () {
    this.addCustomValidators()
  }

  addCustomValidators () {
    this.$scope.$watch('$ctrl.creditCardPaymentForm.securityCode', (value) => {
      console.log('value', value)
      this.creditCardPaymentForm.securityCode.$validators.minLength = cruPayments.creditCard.cvv.validate.minLength
      this.creditCardPaymentForm.securityCode.$validators.maxLength = cruPayments.creditCard.cvv.validate.maxLength
      this.creditCardPaymentForm.securityCode.$validate()
    })
  }

  savePayment () {
    this.creditCardPaymentForm.$setSubmitted()
    if (this.creditCardPaymentForm.$valid) {

      this.onPaymentFormStateChange({
        $event: {
          state: 'encrypting'
        }
      })
      const tokenObservable = this.paymentMethod
        ? Observable.of({
            tsepToken: this.paymentMethod['last-four-digits'],
            maskedCardNumber: this.paymentMethod['last-four-digits']
          }) // Send masked card number when card number is not updated
        : this.tsysService.getManifest()
          .mergeMap(data => {
            const productionEnvironments = ['production', 'prodcloud', 'preprod']
            const actualEnvironment = this.envService.get()
            const ccpEnvironment = productionEnvironments.includes(actualEnvironment) ? 'production' : actualEnvironment

            cruPayments.creditCard.init(ccpEnvironment, data.deviceId, data.manifest)
            return cruPayments.creditCard.encrypt(this.paymentMethod['card-number'], this.creditCardPayment.securityCode, this.paymentMethod['expiry-month'], this.paymentMethod['expiry-year'])
          })
      tokenObservable.subscribe(tokenObj => {
        console.log('loading')
        this.onPaymentFormStateChange({
          $event: {
            state: 'loading',
            payload: {
              creditCard: {
                address: this.paymentMethod['address'],
                'card-number': tokenObj.tsepToken,
                'card-type': this.paymentMethod['card-type'], /* eslint-disable-line no-mixed-operators */
                'cardholder-name': this.paymentMethod['cardholder-name'],
                'expiry-month': this.paymentMethod['expiry-month'],
                'expiry-year': this.paymentMethod['expiry-year'],
                'last-four-digits': tokenObj.maskedCardNumber,
                transactionId: tokenObj.transactionID,
                cvv: this.creditCardPayment.securityCode
              }
            }
          }
        })
      }, error => {
        this.$log.error('Error tokenizing credit card', error)
        this.analyticsFactory.checkoutFieldError('tokenizeCard', 'failed')
        this.onPaymentFormStateChange({
          $event: {
            state: 'error',
            error: error
          }
        })
        scrollModalToTop()
      })
    } else {
      this.analyticsFactory.handleCheckoutFormErrors(this.creditCardPaymentForm)
      this.onPaymentFormStateChange({
        $event: {
          state: 'unsubmitted'
        }
      })
    }
  }
}

export default angular
  .module(componentName, [
    'ngMessages',
    showErrors.name,
    analyticsFactory.name,
    tsys.name,
    creditCardNumberDirective.name
  ])
  .component(componentName, {
    controller: PaymentMethodDisplayController,
    templateUrl: template,
    bindings: {
      paymentFormState: '<',
      paymentMethod: '<',
      expired: '<',
      onPaymentFormStateChange: '&'
    }
  })

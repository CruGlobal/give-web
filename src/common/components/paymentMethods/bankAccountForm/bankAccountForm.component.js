import angular from 'angular'
import commonModule from 'common/common.module'
import get from 'lodash/get'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'

import showErrors from 'common/filters/showErrors.filter'
import { scrollModalToTop } from 'common/services/modalState.service'
import analyticsFactory from 'app/analytics/analytics.factory'

import * as cruPayments from '@cruglobal/cru-payments/dist/cru-payments'
import { ccpKey, ccpStagingKey } from 'common/app.constants'

import template from './bankAccountForm.tpl.html'

const componentName = 'bankAccountForm'

class BankAccountController {
  /* @ngInject */
  constructor ($scope, $log, analyticsFactory, envService) {
    this.$scope = $scope
    this.$log = $log
    this.analyticsFactory = analyticsFactory
    this.envService = envService

    this.imgDomain = this.envService.read('imgDomain')
    this.bankPayment = {
      accountType: 'Checking'
    }
    this.hideAgreement = true
  }

  $onInit () {
    this.initExistingPaymentMethod()
    this.waitForFormInitialization()
  }

  $onChanges (changes) {
    if (get(changes, 'paymentFormState.currentValue') === 'submitted') {
      this.savePayment()
    }
  }

  initExistingPaymentMethod () {
    if (this.paymentMethod) {
      this.bankPayment = {
        accountType: this.paymentMethod['account-type'],
        bankName: this.paymentMethod['bank-name'],
        accountNumberPlaceholder: this.paymentMethod['display-account-number'],
        routingNumber: this.paymentMethod['routing-number']
      }
    }
  }

  waitForFormInitialization () {
    const unregister = this.$scope.$watch('$ctrl.bankPaymentForm', () => {
      unregister()
      this.addCustomValidators()
    })
  }

  addCustomValidators () {
    function stripNonDigits (number) {
      return number.replace(/\D/g, '')
    }

    this.bankPaymentForm.routingNumber.$parsers.push(stripNonDigits)
    this.bankPaymentForm.routingNumber.$validators.length = cruPayments.bankAccount.routingNumber.validate.length
    this.bankPaymentForm.routingNumber.$validators.checksum = cruPayments.bankAccount.routingNumber.validate.checksum

    this.bankPaymentForm.accountNumber.$parsers.push(stripNonDigits)
    this.bankPaymentForm.accountNumber.$validators.minLength = number => this.paymentMethod && !number || cruPayments.bankAccount.accountNumber.validate.minLength(number) /* eslint-disable-line no-mixed-operators */
    this.bankPaymentForm.accountNumber.$validators.maxLength = cruPayments.bankAccount.accountNumber.validate.maxLength
    this.bankPaymentForm.accountNumber.$viewChangeListeners.push(() => {
      // Revalidate verifyAccountNumber after accountNumber changes
      this.bankPaymentForm.verifyAccountNumber.$validate()
    })

    this.bankPaymentForm.verifyAccountNumber.$parsers.push(stripNonDigits)
    this.bankPaymentForm.verifyAccountNumber.$validators.verifyAccountNumber = (verifyAccountNumber) => {
      return this.bankPayment.accountNumber === verifyAccountNumber
    }
  }

  savePayment () {
    this.bankPaymentForm.$setSubmitted()
    if (this.bankPaymentForm.$valid) {
      this.onPaymentFormStateChange({
        $event: {
          state: 'encrypting'
        }
      })
      const productionEnvironments = ['production', 'prodcloud', 'preprod']
      const actualEnvironment = this.envService.get()
      const ccpEnvironment = productionEnvironments.includes(actualEnvironment) ? 'production' : actualEnvironment
      cruPayments.bankAccount.init(ccpEnvironment, ccpEnvironment === 'production' ? ccpKey : ccpStagingKey)
      const encryptObservable = this.paymentMethod && !this.bankPayment.accountNumber
        ? Observable.of('')
        : cruPayments.bankAccount.encrypt(this.bankPayment.accountNumber)
      encryptObservable.subscribe(encryptedAccountNumber => {
        this.onPaymentFormStateChange({
          $event: {
            state: 'loading',
            payload: {
              bankAccount: {
                'account-type': this.bankPayment.accountType,
                'bank-name': this.bankPayment.bankName,
                'encrypted-account-number': encryptedAccountNumber,
                'display-account-number': this.bankPayment.accountNumber ? this.bankPayment.accountNumber.slice(-4) : this.paymentMethod['display-account-number'],
                'routing-number': this.bankPayment.routingNumber
              }
            }
          }
        })
      }, error => {
        this.analyticsFactory.checkoutFieldError('encryptAccount', 'failed')
        this.$log.error('Error encrypting bank account number', error)
        this.onPaymentFormStateChange({
          $event: {
            state: 'error',
            error: error
          }
        })
        scrollModalToTop()
      })
    } else {
      this.analyticsFactory.handleCheckoutFormErrors(this.bankPaymentForm)
      this.onPaymentFormStateChange({
        $event: {
          state: 'unsubmitted'
        }
      })
    }
  }

  toggleAgreement ($event) {
    if ($event) {
      $event.stopPropagation()
    }
    this.hideAgreement = !this.hideAgreement
  }
}

export default angular
  .module(componentName, [
    commonModule.name,
    showErrors.name,
    analyticsFactory.name
  ])
  .component(componentName, {
    controller: BankAccountController,
    templateUrl: template,
    bindings: {
      paymentFormState: '<',
      paymentMethod: '<',
      onPaymentFormStateChange: '&'
    }
  })

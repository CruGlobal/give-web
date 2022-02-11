import angular from 'angular'
import template from './payment-method.tpl.html'
import displayAddressComponent from 'common/components/display-address/display-address.component'
import recurringGiftsComponent from '../recurring-gifts/recurring-gifts.component'
import paymentMethodFormModal from 'common/components/paymentMethods/paymentMethodForm/paymentMethodForm.modal.component'
import deletePaymentMethodModal from 'common/components/paymentMethods/deletePaymentMethod/deletePaymentMethod.modal.component.js'
import giveModalWindowTemplate from 'common/templates/giveModalWindow.tpl.html'
import profileService from 'common/services/api/profile.service'
import orderService from 'common/services/api/order.service'
import formatAddressForTemplate from 'common/services/addressHelpers/formatAddressForTemplate'
import { validPaymentMethod } from 'common/services/paymentHelpers/validPaymentMethods'
import { scrollModalToTop } from 'common/services/modalState.service'
import uibCollapse from 'angular-ui-bootstrap/src/collapse'
import uibModal from 'angular-ui-bootstrap/src/modal'

import analyticsFactory from 'app/analytics/analytics.factory'

const componentName = 'paymentMethod'

class PaymentMethodController {
  /* @ngInject */
  constructor ($log, envService, $uibModal, profileService, orderService, analyticsFactory) {
    this.$log = $log
    this.isCollapsed = true
    this.$uibModal = $uibModal
    this.profileService = profileService
    this.orderService = orderService
    this.imgDomain = envService.read('imgDomain')
    this.paymentFormResolve = {}
    this.analyticsFactory = analyticsFactory
    this.validPaymentMethod = validPaymentMethod
  }

  getExpiration () {
    return `${this.model['expiry-month']}/${this.model['expiry-year']}`
  }

  isCard () {
    return !!this.model['card-type']
  }

  editPaymentMethod () {
    this.successMessage.show = false
    this.editPaymentMethodModal = this.$uibModal.open({
      component: 'paymentMethodFormModal',
      windowTemplateUrl: giveModalWindowTemplate,
      resolve: {
        paymentForm: this.paymentFormResolve,
        paymentMethod: this.model,
        hideCvv: true,
        mailingAddress: this.mailingAddress,
        onPaymentFormStateChange: () => params => this.onPaymentFormStateChange(params.$event)
      }
    })
  }

  onPaymentFormStateChange ($event) {
    this.paymentFormResolve.state = $event.state
    if ($event.state === 'loading' && $event.payload) {
      this.profileService.updatePaymentMethod(this.model, $event.payload)
        .subscribe(() => {
          this.handleStateChangeSuccess($event)
        }, error => this.handleStateChangeError(error))
    }
  }

  handleStateChangeSuccess ($event) {
    let editedData = {}
    if ($event.payload.creditCard) {
      editedData = $event.payload.creditCard
      // I'm not sure why this self assign was done. We could test without it...
      // eslint-disable-next-line no-self-assign
      editedData['last-four-digits'] = editedData['last-four-digits']
      editedData.address = formatAddressForTemplate(editedData.address)
    } else {
      editedData = $event.payload.bankAccount
    }
    for (const key in editedData) {
      this.model[key] = editedData[key]
    }
    this.successMessage = {
      show: true,
      type: 'paymentMethodUpdated'
    }
    this.paymentFormResolve.state = 'unsubmitted'
    this.editPaymentMethodModal.close()
    this.analyticsFactory.setEvent('add payment method')
  }

  handleStateChangeError (error, $log) {
    this.$log.error('Error updating payment method', error)
    this.paymentFormResolve.state = 'error'
    this.paymentFormResolve.error = error.data
    scrollModalToTop()
  }

  deletePaymentMethod () {
    this.successMessage.show = false
    this.deletePaymentMethodModal = this.$uibModal.open({
      component: 'deletePaymentMethodModal',
      backdrop: 'static',
      windowTemplateUrl: giveModalWindowTemplate,
      resolve: {
        paymentMethod: () => this.model,
        mailingAddress: () => this.mailingAddress,
        paymentMethodsList: () => this.paymentMethodsList
      }
    })
    this.deletePaymentMethodModal.result.then(() => {
      this.onDelete()
      this.analyticsFactory.setEvent('delete payment method')
    }, angular.noop)
  }

  $onDestroy () {
    if (this.deletePaymentMethodModal) {
      this.deletePaymentMethodModal.dismiss()
    }
    if (this.editPaymentMethodModal) {
      this.editPaymentMethodModal.dismiss()
    }
  }
}

export default angular
  .module(componentName, [
    displayAddressComponent.name,
    recurringGiftsComponent.name,
    paymentMethodFormModal.name,
    deletePaymentMethodModal.name,
    profileService.name,
    orderService.name,
    analyticsFactory.name,
    uibCollapse,
    uibModal
  ])
  .component(componentName, {
    controller: PaymentMethodController,
    templateUrl: template,
    bindings: {
      model: '<',
      successMessage: '=',
      paymentMethodsList: '<',
      mailingAddress: '<',
      onDelete: '&'
    }
  })

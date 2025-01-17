import angular from 'angular'
import template from './payment-methods.tpl.html'
import recurringGiftsComponent from './recurring-gifts/recurring-gifts.component'
import profileService from 'common/services/api/profile.service.js'
import paymentMethod from './payment-method/payment-method.component'
import paymentMethodFormModal from 'common/components/paymentMethods/paymentMethodForm/paymentMethodForm.modal.component'
import giveModalWindowTemplate from 'common/templates/giveModalWindow.tpl.html'
import paymentMethodDisplay from 'common/components/paymentMethods/paymentMethodDisplay.component'
import sessionEnforcerService, { EnforcerCallbacks, EnforcerModes } from 'common/services/session/sessionEnforcer.service'
import { Roles, SignOutEvent } from 'common/services/session/session.service'
import commonModule from 'common/common.module'
import extractPaymentAttributes from 'common/services/paymentHelpers/extractPaymentAttributes'
import formatAddressForTemplate from 'common/services/addressHelpers/formatAddressForTemplate'
import { scrollModalToTop } from 'common/services/modalState.service'
import uibModal from 'angular-ui-bootstrap/src/modal'

class PaymentMethodsController {
  /* @ngInject */
  constructor ($rootScope, $uibModal, $log, $timeout, $window, $location, profileService, sessionEnforcerService, analyticsFactory) {
    this.$log = $log
    this.$rootScope = $rootScope
    this.$uibModal = $uibModal
    this.paymentMethod = 'bankAccount'
    this.profileService = profileService
    this.paymentFormResolve = {}
    this.successMessage = { show: false }
    this.$timeout = $timeout
    this.$window = $window
    this.paymentMethods = []
    this.$location = $location
    this.sessionEnforcerService = sessionEnforcerService
    this.analyticsFactory = analyticsFactory
  }

  $onDestroy () {
    // Destroy enforcer
    this.sessionEnforcerService.cancel(this.enforcerId)

    if (this.paymentMethodFormModal) {
      this.paymentMethodFormModal.close()
    }
  }

  $onInit () {
    this.enforcerId = this.sessionEnforcerService([Roles.registered], {
      [EnforcerCallbacks.signIn]: () => {
        this.loadPaymentMethods()
        this.loadDonorDetails()
      },
      [EnforcerCallbacks.cancel]: () => {
        this.$window.location = '/'
      }
    }, EnforcerModes.donor)

    this.$rootScope.$on(SignOutEvent, (event) => this.signedOut(event))

    this.loading = true

    this.analyticsFactory.pageLoaded()
  }

  loadDonorDetails () {
    this.profileService.getDonorDetails()
      .subscribe(data => {
        this.mailingAddress = data.mailingAddress
      }, error => {
        this.$log.error('Error loading mailing address for use in profile payment method add payment method modals', error)
      })
  }

  loadPaymentMethods () {
    this.loading = true
    this.loadingError = false
    this.profileService.getPaymentMethodsWithDonations()
      .subscribe(
        data => {
          this.loading = false
          this.paymentMethods = data
        },
        error => {
          this.loading = false
          if (error.status === 500) {
            this.loadingError = 'authentication'
          } else {
            this.loadingError = true
          }
          this.$log.error('Error loading payment methods', error)
        }
      )
  }

  addPaymentMethod () {
    this.paymentMethodFormModal = this.$uibModal.open({
      component: 'paymentMethodFormModal',
      backdrop: 'static',
      windowTemplateUrl: giveModalWindowTemplate,
      resolve: {
        paymentForm: this.paymentFormResolve,
        hideCvv: true,
        mailingAddress: this.mailingAddress,
        onPaymentFormStateChange: () => param => this.onPaymentFormStateChange(param.$event)
      }
    })
    this.paymentMethodFormModal.result.then(data => {
      this.successMessage = {
        show: true,
        type: 'paymentMethodAdded'
      }
      data._recurringgifts = [{ donations: [] }]
      this.paymentMethods.push(extractPaymentAttributes(data))
      this.$timeout(() => {
        this.successMessage.show = false
      }, 60000)
    }, angular.noop)
  }

  onPaymentFormStateChange ($event) {
    this.paymentFormResolve.state = $event.state
    if ($event.state === 'loading' && $event.payload) {
      this.profileService.addPaymentMethod($event.payload)
        .subscribe(data => {
          if (data.address) {
            data.address = formatAddressForTemplate(data.address)
          } else if (data['payment-instrument-identification-attributes']['street-address']) {
            data.address = formatAddressForTemplate(data['payment-instrument-identification-attributes'])
          }
          this.paymentMethodFormModal.close(data)
          this.paymentFormResolve.state = 'unsubmitted'
        },
        error => {
          if (error.status !== 409) {
            this.$log.error('Error adding payment method', error)
          }
          this.paymentFormResolve.state = 'error'
          this.paymentFormResolve.error = error.data
          scrollModalToTop()
        })
    }
  }

  onDelete () {
    this.loadPaymentMethods()
    this.successMessage.show = true
    this.successMessage.type = 'paymentMethodDeleted'
    this.$timeout(() => {
      this.successMessage.show = false
    }, 60000)
  }

  isCard (paymentMethod) {
    return !!paymentMethod['card-type']
  }

  signedOut (event) {
    if (!event.defaultPrevented) {
      event.preventDefault()
      this.$window.location = '/'
    }
  }
}

const componentName = 'paymentMethods'

export default angular
  .module(componentName, [
    commonModule.name,
    recurringGiftsComponent.name,
    paymentMethodFormModal.name,
    paymentMethod.name,
    profileService.name,
    paymentMethodDisplay.name,
    sessionEnforcerService.name,
    uibModal
  ])
  .component(componentName, {
    controller: PaymentMethodsController,
    templateUrl: template
  })

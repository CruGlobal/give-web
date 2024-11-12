import angular from 'angular'
import includes from 'lodash/includes'
import sessionService, { Roles, createAccountDataCookieName } from 'common/services/session/session.service'
import orderService from 'common/services/api/order.service'
import template from './signUpActivationModal.tpl.html'
import cartService from 'common/services/api/cart.service'

const componentName = 'signUpActivationModal'

class signUpActivationModalController {
  /* @ngInject */
  constructor ($log, $scope, $cookies, $window, sessionService, orderService, cartService, envService) {
    this.$log = $log
    this.$scope = $scope
    this.$cookies = $cookies
    this.$window = $window
    this.sessionService = sessionService
    this.orderService = orderService
    this.cartService = cartService
    this.imgDomain = envService.read('imgDomain')
    this.publicCru = envService.read('publicCru')
  }

  $onInit () {
    if (includes([Roles.identified, Roles.registered], this.sessionService.getRole())) {
      this.onStateChange({ state: 'sign-in' })
    }
    if (!this.isInsideAnotherModal) {
      this.cartCount = 0
      this.getTotalQuantitySubscription = this.cartService.getTotalQuantity().subscribe(count => {
        this.cartCount = count
      }, () => {
        this.cartCount = 0
      })
    }
    this.loadingAccountErrorCount = 0
    this.initialLoading = true
    this.getUnverifiedAccount(false)
    this.getUnverifiedAccountTimoutId = this.$window.setInterval(() => {
      this.getUnverifiedAccount()
    }, 10000)

    // Allow time for the server to populate the data
    // Otherwise error will show that email isn't registered.
    setTimeout(() => { this.initialLoading = false }, 10000)
  }

  $onDestroy () {
    clearInterval(this.getUnverifiedAccountTimoutId)
  }

  async getUnverifiedAccount (subtle = true) {
    if (!subtle) {
      this.loadingAccount = true
    }
    this.loadingAccountError = false

    const createAccountDataStringified = this.$cookies.get(createAccountDataCookieName)
    const createAccountData = createAccountDataStringified ? JSON.parse(createAccountDataStringified) : null
    if (createAccountData) {
      this.sessionService.checkCreateAccountStatus(createAccountData?.email).then((response) => {
        if (response.status === 'error') {
          this.loadingAccountError = response.data
          this.loadingAccountErrorCount++
          if (!subtle) {
            this.loadingAccount = false
          }
          this.$scope.$apply()
        } else {
          let status = ''
          switch (response.data.status) {
            case 'STAGED':
              status = 'Sending Activation Email'
              break
            case 'ACTIVE':
              status = 'Active'
              break
            case 'PROVISIONED':
              status = 'Pending Verification'
              break
          }

          this.unverifiedAccount = {
            ...createAccountData,
            ...response.data,
            status
          }
          this.loadingAccount = false
          this.loadingAccountErrorCount = 0

          if (this.unverifiedAccount.email) {
            this.initialLoading = false
          }

          if (response.data.status === 'ACTIVE') {
            clearInterval(this.getUnverifiedAccountTimoutId)
            this.onStateChange({ state: 'register-account' })
          }
          this.$scope.$apply()
        }
      })
    } else {
      this.loadingAccountError = 'error'
      this.loadingAccount = false
      this.loadingAccountErrorCount++
    }
  }

  onSuccessfulSignIn () {
    this.onSuccess()
  }
}

export default angular
  .module(componentName, [
    sessionService.name,
    orderService.name,
    cartService.name
  ])
  .component(componentName, {
    controller: signUpActivationModalController,
    templateUrl: template,
    bindings: {
      onStateChange: '&',
      onSuccess: '&',
      onFailure: '&',
      onCancel: '&',
      isInsideAnotherModal: '=',
      lastPurchaseId: '<'
    }
  })

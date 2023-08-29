import angular from 'angular'
import includes from 'lodash/includes'
import isEmpty from 'lodash/isEmpty'
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
  }

  $onInit () {
    if (includes([Roles.identified, Roles.registered], this.sessionService.getRole())) {
      this.identified = true;
      this.username = this.session.email;
      this.onStateChange({ state: 'sign-in' });
    }
    if (!this.isInsideAnotherModal) {
      this.cartCount = 0
      this.getTotalQuantitySubscription = this.cartService.getTotalQuantity().subscribe(count => {
        this.cartCount = count
      }, () => {
        this.cartCount = 0
      })
    }
    this.showHelp = false;
    this.loadingAccountErrorCount = 0;
    this.getUnverifiedAccount(false)
    this.getUnverifiedAccountTimoutId = this.$window.setInterval(() => {
      this.getUnverifiedAccount()
    }, 10000);
    
  }

  $onDestroy () {
    clearInterval(this.getUnverifiedAccountTimoutId) 
  }

  getUnverifiedAccount (subtle = true) {
    if (!subtle) this.loadingAccount = true
    this.loadingAccountError = false

    const createAccountDataStringified = this.$cookies.get(createAccountDataCookieName);
    const createAccountData = createAccountDataStringified ? JSON.parse(createAccountDataStringified) : null;
    console.log('createAccountData', createAccountData);
    if (createAccountData) {
      this.sessionService.checkCreateAccountStatus(createAccountData?.email).then((response) => {
        console.log('response', response)
        if (response.status === 'error') {
          this.$scope.$apply(() => {
            this.loadingAccountError = response.data
            this.loadingAccountErrorCount++;
            if (!subtle) this.loadingAccount = false
          })
        } else {
          this.$scope.$apply(() => {
            let status = ''
            switch(response.data.status) {
              case 'STAGED':
                status = 'Awaiting Admin approval'
                break;
              case 'ACTIVE':
                status = 'Active'
                break;
              case 'PROVISIONED':
                status = 'Pending Activation'
                break;
            }

            this.unverifiedAccount = { 
              ...createAccountData,
              ...response.data,
              status
            }
            this.loadingAccount = false
            this.loadingAccountErrorCount = 0;

            if (response.data.status === 'ACTIVE') {
              this.onSuccess();
            }
          })
        }
      });
    } else {
      this.loadingAccountError = 'error';
      this.loadingAccount = false
      this.loadingAccountErrorCount++;
    }
  }
}


export default angular
  .module(componentName, [
    sessionService.name,
    orderService.name,
    cartService.name,
  ])
  .component(componentName, {
    controller: signUpActivationModalController,
    templateUrl: template,
    bindings: {
      onStateChange: '&',
      onSuccess: '&',
      onFailure: '&',
      onCancel: '&',
      isInsideAnotherModal: '='
    }
  })

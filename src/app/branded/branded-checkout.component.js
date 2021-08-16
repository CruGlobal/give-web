import angular from 'angular'
import 'angular-environment'
import 'angular-translate'
import pick from 'lodash/pick'
import omit from 'lodash/omit'
import changeCaseObject from 'change-case-object'
import uibModal from 'angular-ui-bootstrap/src/modal'

import commonModule from 'common/common.module'
import step1 from './step-1/branded-checkout-step-1.component'
import step2 from './step-2/branded-checkout-step-2.component'
import thankYouSummary from 'app/thankYou/summary/thankYouSummary.component'

import sessionService from 'common/services/session/session.service'
import orderService from 'common/services/api/order.service'

import 'common/lib/fakeLocalStorage'

import template from './branded-checkout.tpl.html'

const componentName = 'brandedCheckout'

class BrandedCheckoutController {
  /* @ngInject */
  constructor ($window, analyticsFactory, tsysService, sessionService, envService, orderService, $translate) {
    this.$window = $window
    this.analyticsFactory = analyticsFactory
    this.tsysService = tsysService
    this.sessionService = sessionService
    this.envService = envService
    this.orderService = orderService
    this.$translate = $translate

    this.orderService.clearCoverFees()
  }

  $onInit () {
    this.envService.data.vars[this.envService.get()].isBrandedCheckout = true
    if (this.apiUrl) { // set custom API url
      this.envService.data.vars[this.envService.get()].apiUrl = this.apiUrl
    }
    this.code = this.designationNumber
    this.tsysService.setDevice(this.tsysDevice)
    this.analyticsFactory.pageLoaded(true)
    this.formatDonorDetails()

    this.sessionService.signOut().subscribe(() => {
      this.checkoutStep = 'giftContactPayment'
      this.fireAnalyticsEvents('contact', 'payment')
    }, angular.noop)
    this.$translate.use(this.language || 'en')

    this.itemConfig = {}
  }

  formatDonorDetails () {
    if (this.donorDetailsVariable && this.$window[this.donorDetailsVariable]) {
      this.donorDetails = this.$window[this.donorDetailsVariable]

      // change donorDetails to param-case but leave mailing address alone since this Angular app uses a different format than EP
      const mailingAddress = this.donorDetails.mailingAddress
      this.donorDetails = changeCaseObject.paramCase(omit(this.donorDetails, 'mailingAddress'))
      if (mailingAddress) {
        this.donorDetails.mailingAddress = mailingAddress
      }
    }
  }

  next () {
    switch (this.checkoutStep) {
      case 'giftContactPayment':
        this.checkoutStep = 'review'
        this.fireAnalyticsEvents('review')
        break
      case 'review':
        this.checkoutStep = 'thankYou'
        break
    }
    this.$window.document.querySelector('branded-checkout').scrollIntoView({ behavior: 'smooth' })
  }

  previous () {
    switch (this.checkoutStep) {
      case 'review':
        this.fireAnalyticsEvents('contact', 'payment')
        this.checkoutStep = 'giftContactPayment'
        break
    }
    this.$window.document.querySelector('branded-checkout').scrollIntoView({ behavior: 'smooth' })
  }

  onThankYouPurchaseLoaded (purchase) {
    this.onOrderCompleted({ $event: { $window: this.$window, purchase: changeCaseObject.camelCase(pick(purchase, ['donorDetails', 'lineItems'])) } })
  }

  onPaymentFailed (donorDetails) {
    this.onOrderFailed({ $event: { $window: this.$window, donorDetails: changeCaseObject.camelCase(donorDetails) } })
  }

  fireAnalyticsEvents (...checkoutSteps) {
    checkoutSteps.forEach(checkoutStep => {
      this.analyticsFactory.setEvent('checkout step ' + checkoutStep)
    })
  }
}

export default angular
  .module(componentName, [
    commonModule.name,
    step1.name,
    step2.name,
    thankYouSummary.name,
    sessionService.name,
    orderService.name,
    uibModal,
    'environment',
    'pascalprecht.translate'
  ]).config(($uibModalProvider, $windowProvider) => {
    const $document = angular.element($windowProvider.$get().document)
    $uibModalProvider.options.appendTo = $document.find('branded-checkout').eq(0)
    if (!$uibModalProvider.options.appendTo.length) { $uibModalProvider.options.appendTo = $document.find('body').eq(0) }
  })
  .component(componentName, {
    controller: BrandedCheckoutController,
    templateUrl: template,
    bindings: {
      designationNumber: '@',
      tsysDevice: '@',
      campaignCode: '@',
      campaignPage: '@',
      amount: '@',
      frequency: '@',
      day: '@',
      apiUrl: '@',
      premiumCode: '@',
      premiumName: '@',
      premiumImageUrl: '@',
      radioStationApiUrl: '@',
      radioStationRadius: '@',
      donorDetailsVariable: '@donorDetails',
      defaultPaymentType: '@',
      hidePaymentTypeOptions: '@',
      onOrderCompleted: '&',
      onOrderFailed: '&',
      language: '@',
      showCoverFees: '@'
    }
  })

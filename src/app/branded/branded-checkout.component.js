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
import brandedAnalyticsFactory from './analytics/branded-analytics.factory'

import 'common/lib/fakeLocalStorage'

import template from './branded-checkout.tpl.html'

const componentName = 'brandedCheckout'

class BrandedCheckoutController {
  /* @ngInject */
  constructor ($element, $window, analyticsFactory, brandedAnalyticsFactory, tsysService, sessionService, envService, orderService, $translate) {
    this.$element = $element[0] // extract the DOM element from the jqLite wrapper
    this.$window = $window
    this.analyticsFactory = analyticsFactory
    this.brandedAnalyticsFactory = brandedAnalyticsFactory
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
      // Remove initialLoadComplete session storage. Used on src/common/components/contactInfo/contactInfo.component.js
      // To prevent users who complete a gift and give again.
      this.$window.sessionStorage.removeItem('initialLoadComplete')
    }, (err) => {
      console.error(err)
    })
    this.$translate.use(this.language || 'en')
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
    this.$element.scrollIntoView({ behavior: 'smooth' })
  }

  previous (newStep) {
    let scrollElement

    if (this.checkoutStep === 'review') {
      this.fireAnalyticsEvents('contact', 'payment')
      this.checkoutStep = 'giftContactPayment'

      switch (newStep) {
        case 'contact':
          scrollElement = 'contact-info'
          break
        case 'cart':
          scrollElement = 'product-config-form'
          break
        case 'payment':
          scrollElement = 'checkout-step-2'
          break
      }
    }

    if (scrollElement && this.$window.MutationObserver) {
      // Watch for changes until the element we are scrolling to exists and everything has loaded
      // because there will be layout shift every time a new component finishes loading
      const observer = new this.$window.MutationObserver(() => {
        // TODO: When support for :has() is high enough, this query could be changed to `.panel :has(${scrollElement})`
        // instead of having to find the scrollElement and manually navigate up to the grandparent element
        // https://caniuse.com/css-has
        const element = this.$element.querySelector(scrollElement)
        if (element && this.$element.querySelector('loading') === null) {
          // Traverse up to the .panel grandparent
          const panel = element.parentElement.parentElement
          // Scroll 100px past the top of the element
          this.$window.scrollTo({ top: panel.getBoundingClientRect().top + this.$window.scrollY - 100, behavior: 'smooth' })
          observer.disconnect()
        }
      })
      observer.observe(this.$element, { childList: true, subtree: true })
    } else {
      this.$element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  onThankYouPurchaseLoaded (purchase) {
    this.onOrderCompleted({ $event: { $window: this.$window, purchase: changeCaseObject.camelCase(pick(purchase, ['donorDetails', 'lineItems'])) } })
    this.brandedAnalyticsFactory.savePurchase(purchase)
    this.brandedAnalyticsFactory.purchase()
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
    brandedAnalyticsFactory.name,
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
      radioStationApiUrl: '@',
      donorDetailsVariable: '@donorDetails',
      defaultPaymentType: '@',
      hidePaymentTypeOptions: '@',
      onOrderCompleted: '&',
      onOrderFailed: '&',
      language: '@',
      showCoverFees: '@'
    }
  })

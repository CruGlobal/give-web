import angular from 'angular'
import 'rxjs/add/operator/finally'

import commonModule from 'common/common.module'

import step1 from './step-1/step-1.component'
import step2 from './step-2/step-2.component'
import step3 from './step-3/step-3.component'
import cartSummary from './cart-summary/cart-summary.component'
import help from './help/help.component'

import showErrors from 'common/filters/showErrors.filter'

import cartService from 'common/services/api/cart.service'
import orderService from 'common/services/api/order.service'
import designationsService from 'common/services/api/designations.service'
import * as checkoutService from 'common/services/checkoutHelpers/checkout.service'

import sessionEnforcerService, { EnforcerCallbacks } from 'common/services/session/sessionEnforcer.service'
import { Roles, SignOutEvent } from 'common/services/session/session.service'

import analyticsFactory from 'app/analytics/analytics.factory'
import 'common/lib/fakeLocalStorage'

import template from './checkout.tpl.html'

const componentName = 'checkout'

class CheckoutController {
  /* @ngInject */
  constructor ($window, $location, $rootScope, $log, cartService, envService, orderService, designationsService, sessionEnforcerService, analyticsFactory) {
    this.$log = $log
    this.$window = $window
    this.$location = $location
    this.$rootScope = $rootScope
    this.cartService = cartService
    this.envService = envService
    this.orderService = orderService
    this.designationsService = designationsService
    this.sessionEnforcerService = sessionEnforcerService
    this.loadingCartData = true
    this.analyticsFactory = analyticsFactory
    this.selfReference = this
    this.checkoutService = checkoutService
  }

  $onInit () {
    this.envService.data.vars[this.envService.get()].isCheckout = true
    this.enforcerId = this.sessionEnforcerService([Roles.public, Roles.registered], {
      [EnforcerCallbacks.signIn]: () => {
        this.loadCart()
      },
      [EnforcerCallbacks.cancel]: () => {
        this.$window.location = '/cart.html'
      }
    })
    this.$rootScope.$on(SignOutEvent, (event) => this.signedOut(event))
    this.initStepParam(true)
    this.listenForLocationChange()
    this.analyticsFactory.pageLoaded(true)

    this.checkoutService.initializeRecaptcha.call(this)
  }

  $onDestroy () {
    this.sessionEnforcerService.cancel(this.enforcerId)
    this.$locationChangeSuccessListener && this.$locationChangeSuccessListener()
  }

  initStepParam (replace) {
    this.changeStep(this.$location.search().step || 'contact', replace)
  }

  listenForLocationChange () {
    this.$locationChangeSuccessListener = this.$rootScope.$on('$locationChangeSuccess', () => {
      this.initStepParam(this.$location.search().step || 'contact')
      this.analyticsFactory.setEvent('checkout step ' + this.checkoutStep)
      this.cartService.get().subscribe((cartData) => {
        this.analyticsFactory.checkoutStepEvent(this.$location.search().step, cartData)
      })
    })
  }

  signedOut (event) {
    if (!event.defaultPrevented) {
      event.preventDefault()
      this.$window.location = '/cart.html'
    }
  }

  changeStep (newStep, replace) {
    switch (newStep) {
      case 'cart':
        this.$window.location.href = `/cart.html${this.buildQueryStringWithoutStep()}`
        break
      case 'thankYou':
        this.$location.search('step', null)
        this.$window.location.href = `/thank-you.html${this.buildQueryStringWithoutStep()}`
        break
      default:
        this.$window.scrollTo(0, 0)
        this.checkoutStep = newStep
        this.$location.search('step', this.checkoutStep)
        replace && this.$location.replace()
        break
    }
  }

  buildQueryStringWithoutStep () {
    let queryString = ''
    let index = 0
    this.$location.search('step', null)
    Object.entries(this.$location.search()).forEach(([key, value]) => {
      if (index === 0) {
        queryString += `?${key}=${value}`
      } else {
        queryString += `&${key}=${value}`
      }
      index++
    })
    return queryString
  }

  loadCart () {
    this.cartService.get()
      .finally(() => {
        this.loadingCartData = false
      })
      .subscribe((data) => {
        this.cartData = data
        this.analyticsFactory.buildProductVar(data)
      },
      (error) => {
        this.$log.error('Error loading cart', error)
      })
  }
}

export default angular
  .module(componentName, [
    'environment',
    commonModule.name,
    step1.name,
    step2.name,
    step3.name,
    help.name,
    cartSummary.name,
    cartService.name,
    orderService.name,
    designationsService.name,
    sessionEnforcerService.name,
    showErrors.name,
    analyticsFactory.name
  ])
  .component(componentName, {
    controller: CheckoutController,
    templateUrl: template
  })

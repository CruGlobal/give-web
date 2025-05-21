import angular from 'angular'
import isEmpty from 'lodash/isEmpty'

import sessionService from 'common/services/session/session.service'
import cartService from 'common/services/api/cart.service'
import orderService from 'common/services/api/order.service'
import analyticsFactory from 'app/analytics/analytics.factory'

import template from './navCart.tpl.html'
import { giftAddedEvent, cartUpdatedEvent } from 'common/lib/cartEvents'

const componentName = 'navCart'

class NavCartController {
  /* @ngInject */
  constructor ($rootScope, $window, $log, cartService, orderService, sessionService, envService, analyticsFactory) {
    this.$rootScope = $rootScope
    this.$window = $window
    this.$log = $log
    this.cartService = cartService
    this.orderService = orderService
    this.sessionService = sessionService
    this.envService = envService
    this.analyticsFactory = analyticsFactory
    this.firstLoad = true
    this.imgDomain = envService.read('imgDomain')
  }

  $onInit () {
    this.mobile = !!this.mobile
    this.$rootScope.$on(giftAddedEvent, () => this.loadCart(true))
    this.$rootScope.$on(cartUpdatedEvent, () => this.loadCart())
    this.sessionService.sessionSubject.subscribe(() => !this.firstLoad && this.loadCart()) // Ignore session events until another event loads cart
  }

  loadCart (setAnalyticsEvent) {
    this.firstLoad = false
    this.loading = true
    this.error = false
    this.cartService.get()
      .subscribe(data => {
        this.cartData = data
        this.setLoadCartVars(setAnalyticsEvent)
      },
      error => {
        this.$log.error('Error loading nav cart items', error)
        this.error = true
        this.loading = false
        this.hasItems = false
      })
  }

  setLoadCartVars (setAnalyticsEvent) {
    this.loading = false
    this.hasItems = !isEmpty(this.cartData.items)
    this.analyticsFactory.buildProductVar(this.cartData)
    if (setAnalyticsEvent && this.cartData.items.length === 1) {
      this.analyticsFactory.setEvent('cart open')
    }
  }

  checkout () {
    this.$window.location = this.envService.read('publicGive') +
      (this.sessionService.getRole() === 'REGISTERED' ? `/checkout.html${window.location.search}` : `/sign-in.html${window.location.search}`)
  }

  buildCartUrl () {
    return `${this.envService.read('publicGive')}/${this.cartService.buildCartUrl()}`
  }
}

export default angular
  .module(componentName, [
    cartService.name,
    orderService.name,
    sessionService.name,
    analyticsFactory.name
  ])
  .component(componentName, {
    controller: NavCartController,
    templateUrl: template,
    bindings: {
      mobile: '@',
      isOpen: '='
    }
  })

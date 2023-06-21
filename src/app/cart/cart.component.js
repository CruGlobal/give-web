import angular from 'angular'
import commonModule from 'common/common.module'
import pull from 'lodash/pull'
import includes from 'lodash/includes'

import cartService from 'common/services/api/cart.service'
import orderService from 'common/services/api/order.service'
import sessionService from 'common/services/session/session.service'
import productModalService from 'common/services/productModal.service'
import desigSrcDirective from 'common/directives/desigSrc.directive'

import displayRateTotals from 'common/components/displayRateTotals/displayRateTotals.component'
import { cartUpdatedEvent } from 'common/components/nav/navCart/navCart.component'

import analyticsFactory from 'app/analytics/analytics.factory'

import template from './cart.tpl.html'

const componentName = 'cart'

class CartController {
  /* @ngInject */
  constructor ($scope, $window, $log, $document, analyticsFactory, cartService, orderService, sessionService, productModalService, envService) {
    this.$scope = $scope
    this.$window = $window
    this.$log = $log
    this.$document = $document
    this.productModalService = productModalService
    this.cartService = cartService
    this.orderService = orderService
    this.sessionService = sessionService
    this.analyticsFactory = analyticsFactory
    this.envService = envService
  }

  $onInit () {
    this.loadCart()
    this.setContinueBrowsingUrl()
    this.analyticsFactory.cartView()
  }

  loadCart (reload) {
    delete this.error
    if (reload) {
      this.updating = true
    } else {
      this.loading = true
    }
    this.cartService.get()
      .subscribe(data => {
        this.cartData = data
        this.setLoadCartVars(reload)
      },
      error => {
        this.$log.error('Error loading cart', error)
        this.loading = false
        this.updating = false
        this.error = {
          loading: !reload,
          updating: !!reload
        }
      })

    this.donorCoveredFees = !!this.orderService.retrieveCoverFeeDecision()
  }

  setLoadCartVars (reload) {
    this.loading = false
    this.updating = false

    if (!reload) {
      this.analyticsFactory.pageLoaded()
    }
    this.analyticsFactory.buildProductVar(this.cartData)
  }

  removeItem (item) {
    delete item.removingError
    item.removing = true
    this.cartService.deleteItem(item.uri)
      .subscribe(() => {
        this.analyticsFactory.cartRemove(item)
        pull(this.cartData.items, item)

        this.loadCart(true)
        this.$scope.$emit(cartUpdatedEvent)
      },
      error => {
        this.$log.error('Error deleting item from cart', error)
        item.removingError = true
        delete item.removing
      })
  }

  editItem (item) {
    const modal = this.productModalService
      .configureProduct(item.code, item.config, true, item.uri)
    modal && modal.result
      .then(() => {
        pull(this.cartData.items, item)
        this.loadCart(true)
      }, angular.noop)
  }

  checkout () {
    this.$window.location = this.sessionService.getRole() === 'REGISTERED' ? `/checkout.html${window.location.search}` : `/sign-in.html${window.location.search}`
  }

  setContinueBrowsingUrl () {
    let url = this.$document[0].referrer
    if (!url) { return }

    // verify page is on give site
    if (!includes(url, this.envService.read('publicGive'))) { return }

    // remove modal params
    if (includes(url, 'modal=give-gift')) {
      url = url.split('?')[0]
    }

    this.continueBrowsingUrl = url
  }
}

export default angular
  .module(componentName, [
    'environment',
    commonModule.name,
    displayRateTotals.name,
    cartService.name,
    orderService.name,
    productModalService.name,
    sessionService.name,
    desigSrcDirective.name,
    analyticsFactory.name
  ])
  .component(componentName, {
    controller: CartController,
    templateUrl: template
  })

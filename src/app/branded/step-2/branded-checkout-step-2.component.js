import angular from 'angular'

import checkoutStep3 from 'app/checkout/step-3/step-3.component'
import cartService from 'common/services/api/cart.service'
import orderService from '../../../common/services/api/order.service'
import brandedAnalyticsFactory from '../analytics/branded-analytics.factory'

import template from './branded-checkout-step-2.tpl.html'

const componentName = 'brandedCheckoutStep2'

class BrandedCheckoutStep2Controller {
  /* @ngInject */
  constructor ($log, brandedAnalyticsFactory, cartService, orderService) {
    this.$log = $log
    this.brandedAnalyticsFactory = brandedAnalyticsFactory
    this.cartService = cartService
    this.orderService = orderService
  }

  $onInit () {
    this.loadCart()
    this.loadRadioStation()
    this.brandedAnalyticsFactory.reviewOrder()
  }

  loadCart () {
    this.errorLoadingCart = false
    this.cartService.get()
      .subscribe(
        data => {
          this.cartData = data
          this.brandedAnalyticsFactory.addPaymentInfo(this.cartData.items[0])
        },
        error => {
          this.errorLoadingCart = true
          this.$log.error('Error loading cart data for branded checkout step 2', error)
        }
      )
  }

  loadRadioStation () {
    this.radioStationName = this.orderService.retrieveRadioStationName()
  }

  changeStep (newStep) {
    if (newStep === 'thankYou') {
      this.next()
      this.brandedAnalyticsFactory.purchase(this.cartData.items[0])
    } else {
      this.previous()
      this.brandedAnalyticsFactory.checkoutChange(newStep)
    }
  }
}

export default angular
  .module(componentName, [
    checkoutStep3.name,
    cartService.name,
    orderService.name,
    brandedAnalyticsFactory.name
  ])
  .component(componentName, {
    controller: BrandedCheckoutStep2Controller,
    templateUrl: template,
    bindings: {
      previous: '&',
      next: '&'
    }
  })

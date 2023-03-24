import '../../analytics/analytics.module'
import angular from 'angular'

const factoryName = 'brandedAnalyticsFactory'

let brandedDonorType, brandedPaymentType

// Generate a datalayer ecommerce object from an itemConfig
function ecommerceFromItemConfig (itemConfig) {
  const amountPaid = (itemConfig.coverFees ? itemConfig.amountWithFees : itemConfig.amount).toFixed(2)

  return {
    payment_type: brandedPaymentType,
    currency: 'USD',
    donator_type: brandedDonorType,
    pays_processing: itemConfig.coverFees ? 'yes' : 'no',
    value: amountPaid,
    processing_fee: (itemConfig.amountWithFees - itemConfig.amount).toFixed(2),
    items: [{
      item_id: itemConfig.designationNumber,
      item_name: itemConfig.displayName,
      item_brand: itemConfig.orgId,
      item_category: itemConfig.designationType,
      item_variant: itemConfig.frequency.toLowerCase(),
      currency: 'USD',
      price: amountPaid,
      quantity: '1',
      recurring_date: itemConfig.giftStartDate ? itemConfig.giftStartDate.format('MMMM D, YYYY') : undefined
    }]
  }
}

function suppressErrors (func) {
  return function wrapper (...args) {
    try {
      return func.apply(this, args)
    } catch {}
  }
}

const brandedAnalyticsFactory = /* @ngInject */ function ($window) {
  return {
    saveDonorDetails: suppressErrors(function (donorDetails) {
      brandedDonorType = donorDetails['donor-type']
    }),

    savePaymentType: suppressErrors(function (paymentType) {
      brandedPaymentType = paymentType
    }),

    beginCheckout: suppressErrors(function (productData) {
      $window.dataLayer = $window.dataLayer || []
      $window.dataLayer.push({ ecommerce: null })
      $window.dataLayer.push({
        event: 'begin_checkout',
        ecommerce: {
          items: [{
            item_id: productData.designationNumber,
            item_name: productData.displayName,
            item_brand: productData.orgId,
            item_category: productData.designationType,
            currency: 'USD',
            price: undefined,
            quantity: '1'
          }]
        }
      })
    }),

    // saveDonorDetails and savePaymentType should have been called before this
    addPaymentInfo: suppressErrors(function (itemConfig) {
      $window.dataLayer = $window.dataLayer || []
      $window.dataLayer.push({ ecommerce: null })
      $window.dataLayer.push({
        event: 'add_payment_info',
        ecommerce: ecommerceFromItemConfig(itemConfig)
      })
    }),

    reviewOrder: suppressErrors(function () {
      $window.dataLayer = $window.dataLayer || []
      $window.dataLayer.push({ ecommerce: null })
      $window.dataLayer.push({
        event: 'review_order'
      })
    }),

    // saveDonorDetails and savePaymentType should have been called before this
    purchase: suppressErrors(function (itemConfig) {
      $window.dataLayer = $window.dataLayer || []
      $window.dataLayer.push({ ecommerce: null })
      $window.dataLayer.push({
        event: 'purchase',
        ecommerce: ecommerceFromItemConfig(itemConfig)
      })
    }),

    checkoutChange: suppressErrors(function (newStep) {
      let optionChanged
      switch (newStep) {
        case 'contact':
          optionChanged = 'contact info'
          break
        case 'cart':
          optionChanged = 'gift'
          break
        case 'payment':
          optionChanged = 'payment method'
          break
      }

      $window.dataLayer = $window.dataLayer || []
      $window.dataLayer.push({
        event: 'checkout_change_option',
        checkout_option_changed: optionChanged
      })
    })
  }
}

export default angular
  .module('analytics')
  .factory(factoryName, brandedAnalyticsFactory)

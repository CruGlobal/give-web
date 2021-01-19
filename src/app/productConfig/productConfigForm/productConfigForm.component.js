import angular from 'angular'
import 'angular-ordinal'
import 'angular-sanitize'

import indexOf from 'lodash/indexOf'
import find from 'lodash/find'
import omit from 'lodash/omit'
import map from 'lodash/map'
import includes from 'lodash/includes'
import isEmpty from 'lodash/isEmpty'
import padStart from 'lodash/padStart'
import inRange from 'lodash/inRange'

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/merge'
import 'rxjs/add/operator/do'

import designationsService from 'common/services/api/designations.service'
import cartService from 'common/services/api/cart.service'
import orderService from 'common/services/api/order.service'
import {
  possibleTransactionDays,
  possibleTransactionMonths,
  startDate,
  startMonth
} from 'common/services/giftHelpers/giftDates.service'
import desigSrcDirective from 'common/directives/desigSrc.directive'
import showErrors from 'common/filters/showErrors.filter'
import { giftAddedEvent, cartUpdatedEvent } from 'common/components/nav/navCart/navCart.component'
import { giveGiftParams } from '../giveGiftParams'
import loading from 'common/components/loading/loading.component'
import analyticsFactory from 'app/analytics/analytics.factory'

import { brandedCheckoutAmountUpdatedEvent } from 'common/components/paymentMethods/coverFees/coverFees.component'

import template from './productConfigForm.tpl.html'

export const brandedCoverFeeCheckedEvent = 'brandedCoverFeeCheckedEvent'

const componentName = 'productConfigForm'

class ProductConfigFormController {
  /* @ngInject */
  constructor ($rootScope, $scope, $log, $filter, $window, designationsService, cartService, orderService, commonService, analyticsFactory, envService) {
    this.$rootScope = $rootScope
    this.$scope = $scope
    this.$log = $log
    this.$filter = $filter
    this.$window = $window
    this.designationsService = designationsService
    this.cartService = cartService
    this.orderService = orderService
    this.commonService = commonService
    this.possibleTransactionDays = possibleTransactionDays
    this.possibleTransactionMonths = possibleTransactionMonths
    this.startDate = startDate
    this.startMonth = startMonth
    this.analyticsFactory = analyticsFactory
    this.envService = envService
    this.amountChanged = false

    this.selectableAmounts = [50, 100, 250, 500, 1000, 5000]
  }

  $onInit () {
    this.initItemConfig()
    this.loadData()
    this.waitForFormInitialization()

    this.$rootScope.$on(brandedCoverFeeCheckedEvent, () => {
      this.initItemConfig()
      if (this.selectableAmounts.includes(this.itemConfig.amount)) {
        this.changeAmount(this.itemConfig.amount, true)
      } else {
        this.changeCustomAmount(this.itemConfig.amount, true)
      }
    })
  }

  $onChanges (changes) {
    if (changes.submitted && changes.submitted.currentValue === true) {
      this.saveGiftToCart()
    }
  }

  initItemConfig () {
    this.itemConfig = this.itemConfig || {}

    const amount = parseFloat(this.itemConfig.amount)
    if (isNaN(amount)) {
      delete this.itemConfig.amount
    } else {
      this.itemConfig.amount = amount
    }

    if (inRange(parseInt(this.itemConfig['recurring-day-of-month'], 10), 1, 29)) {
      this.itemConfig['recurring-day-of-month'] = padStart(this.itemConfig['recurring-day-of-month'], 2, '0')
    } else {
      delete this.itemConfig['recurring-day-of-month']
    }

    if (inRange(parseInt(this.itemConfig['recurring-start-month'], 10), 1, 13)) {
      this.itemConfig['recurring-start-month'] = padStart(this.itemConfig['recurring-start-month'], 2, '0')
    } else {
      delete this.itemConfig['recurring-start-month']
    }
  }

  loadData () {
    this.loading = true
    this.errorLoading = false

    this.showRecipientComments = !!this.itemConfig['recipient-comments']
    this.showDSComments = !!this.itemConfig['donation-services-comments']

    const productLookupObservable = this.designationsService.productLookup(this.code)
      .do(productData => {
        this.productData = productData
        this.setDefaultAmount()
        this.setDefaultFrequency()
      })

    const nextDrawDateObservable = this.commonService.getNextDrawDate()
      .do(nextDrawDate => {
        this.nextDrawDate = nextDrawDate
        if (!this.itemConfig['recurring-day-of-month'] && this.nextDrawDate) {
          this.itemConfig['recurring-day-of-month'] = startDate(null, this.nextDrawDate).format('DD')
        }
        if (!this.itemConfig['recurring-start-month'] && this.nextDrawDate) {
          this.itemConfig['recurring-start-month'] = startDate(null, this.nextDrawDate).format('MM')
        }
      })

    const suggestedAmountsObservable = this.designationsService.suggestedAmounts(this.code, this.itemConfig)
      .do(suggestedAmounts => {
        this.suggestedAmounts = suggestedAmounts
        this.useSuggestedAmounts = !isEmpty(this.suggestedAmounts)
      })

    const givingLinksObservable = this.designationsService
      .givingLinks(this.code, this.itemConfig['campaign-page'])
      .do(givingLinks => {
        this.givingLinks = givingLinks || []
      })

    Observable.merge(productLookupObservable, nextDrawDateObservable, suggestedAmountsObservable, givingLinksObservable)
      .subscribe(null,
        error => {
          this.errorLoading = true
          this.onStateChange({ state: 'errorLoading' })
          this.$log.error('Error loading data for product config form', error)
          this.loading = false
        },
        () => {
          this.analyticsFactory.giveGiftModal(this.productData)
          this.loading = false
          // Show givingLinks if they exist and it isn't an edit
          if (this.givingLinks.length > 0 && !this.isEdit) {
            this.showGivingLinks = true
            this.onStateChange({ state: 'givingLinks' })
          } else {
            this.onStateChange({ state: 'unsubmitted' })
          }
        })
  }

  setDefaultAmount () {
    const amountOptions = isEmpty(this.suggestedAmounts)
      ? this.selectableAmounts
      : map(this.suggestedAmounts, 'amount')

    if (this.itemConfig.amount) {
      if (amountOptions.indexOf(this.itemConfig.amount) === -1) {
        this.changeCustomAmount(this.itemConfig.amount)
      }
    } else {
      this.itemConfig.amount = amountOptions[0]
    }
  }

  setDefaultFrequency () {
    if (this.defaultFrequency) {
      const frequency = find(this.productData.frequencies, ['name', this.defaultFrequency])
      if (frequency && frequency.selectAction) {
        this.changeFrequency(frequency)
      }
    }
  }

  waitForFormInitialization () {
    const unregister = this.$scope.$watch('$ctrl.itemConfigForm.amount', () => {
      if (this.itemConfigForm && this.itemConfigForm.amount) {
        unregister()
        this.addCustomValidators()
      }
    })
  }

  addCustomValidators () {
    this.itemConfigForm.amount.$parsers.push(value => value.replace('$', '').replace(',', '')) // Ignore a dollar sign and comma if included by the user
    this.itemConfigForm.amount.$validators.minimum = value => {
      return !this.customInputActive || value * 1.0 >= 1
    }
    this.itemConfigForm.amount.$validators.maximum = value => {
      return !this.customInputActive || value * 1.0 < 10000000
    }
    this.itemConfigForm.amount.$validators.pattern = value => {
      const regex = /^([0-9]*)(\.[0-9]{1,2})?$/
      return !this.customInputActive || regex.test(value)
    }
  }

  frequencyOrder (f) {
    const order = ['NA', 'MON', 'QUARTERLY', 'ANNUAL']
    return indexOf(order, f.name)
  }

  changeFrequency (product) {
    if (product.name === this.productData.frequency) {
      // Do nothing if same frequency is selected
      return
    }

    this.errorAlreadyInCart = false
    this.errorChangingFrequency = false
    const lastFrequency = this.productData.frequency
    this.productData.frequency = product.name

    if (this.envService.read('isBrandedCheckout')) {
      this.itemConfig.frequency = product.display
    }

    this.updateQueryParam({ key: giveGiftParams.frequency, value: product.name })
    if (product.selectAction) {
      this.changingFrequency = true
      this.onStateChange({ state: 'changingFrequency' })
      this.designationsService.productLookup(product.selectAction, true)
        .subscribe(data => {
          this.itemConfigForm.$setDirty()
          this.productData = data
          this.changingFrequency = false
          this.onStateChange({ state: 'unsubmitted' })
        },
        error => {
          this.$log.error('Error loading new product when changing frequency', error)
          this.errorChangingFrequency = true
          this.productData.frequency = lastFrequency
          this.updateQueryParam({ key: giveGiftParams.frequency, value: lastFrequency })
          this.changingFrequency = false
          this.onStateChange({ state: 'unsubmitted' })
        })
    }
  }

  changeAmount (amount, retainCoverFees) {
    this.itemConfigForm.$setDirty()
    this.checkAmountChanged(amount)
    this.itemConfig.amount = amount
    this.customAmount = ''
    this.customInputActive = false
    if (!retainCoverFees && this.amountChanged) {
      this.orderService.clearCoverFees()
      this.itemConfig.coverFees = false
      this.$scope.$emit(brandedCheckoutAmountUpdatedEvent)
    }
    this.updateQueryParam({ key: giveGiftParams.amount, value: amount })
  }

  changeCustomAmount (amount, retainCoverFees) {
    this.checkAmountChanged(amount)
    this.itemConfig.amount = amount
    this.customAmount = amount
    this.customInputActive = true
    if (!retainCoverFees && this.amountChanged) {
      this.orderService.clearCoverFees()
      this.itemConfig.coverFees = false
      this.$scope.$emit(brandedCheckoutAmountUpdatedEvent)
    }
    this.updateQueryParam({ key: giveGiftParams.amount, value: amount })
  }

  checkAmountChanged (amount) {
    if (this.itemConfig.amount && amount) {
      this.amountChanged = this.itemConfig.amount !== amount
    }
    if (!this.itemConfig.amount && amount) {
      this.amountChanged = true
    }
  }

  changeStartDay (day, month) {
    this.errorAlreadyInCart = false
    this.updateQueryParam({ key: giveGiftParams.day, value: day })
    this.updateQueryParam({ key: giveGiftParams.month, value: month })
  }

  saveGiftToCart () {
    this.itemConfigForm.$setSubmitted()
    this.submittingGift = false
    this.errorAlreadyInCart = false
    this.errorSavingGeneric = false
    if (!this.itemConfigForm.$valid) {
      return
    }
    this.submittingGift = true
    this.onStateChange({ state: 'submitting' })

    const data = this.productData.frequency === 'NA' ? omit(this.itemConfig, ['recurring-start-month', 'recurring-day-of-month']) : this.itemConfig

    const savingObservable = this.isEdit
      ? this.cartService.editItem(this.uri, this.productData.uri, data)
      : this.cartService.addItem(this.productData.uri, data, this.disableSessionRestart)

    savingObservable.subscribe(data => {
      if (this.isEdit) {
        if (this.amountChanged) {
          this.orderService.clearCoverFees()
        }
        this.$scope.$emit(cartUpdatedEvent)
      } else {
        this.$scope.$emit(giftAddedEvent)
        this.analyticsFactory.cartAdd(this.itemConfig, this.productData)
      }
      this.uri = data.self.uri
      this.submittingGift = false
      this.onStateChange({ state: 'submitted' })
    }, error => {
      if (includes(error.data, 'already in the cart')) {
        this.errorAlreadyInCart = true
        this.onStateChange({ state: 'errorAlreadyInCart' })
      } else {
        this.errorSavingGeneric = true
        this.$log.error('Error adding or updating item in cart', error)
        this.onStateChange({ state: 'errorSubmitting' })
      }
      this.submittingGift = false
    })
  }

  displayId () {
    if (!this.productData) {
      return ''
    }
    let value = `#${this.productData.designationNumber}`
    if (this.productData.displayName !== this.itemConfig['jcr-title'] && this.itemConfig['campaign-page']) {
      value += ` - ${this.productData.displayName}`
    }
    return value
  }

  suggestedAmount (amount) {
    return this.$filter('currency')(amount, '$', `${amount}`.indexOf('.') > -1 ? 2 : 0)
  }

  giveLink (url) {
    if (typeof url === 'undefined') {
      this.showGivingLinks = false
      this.onStateChange({ state: 'unsubmitted' })
    } else {
      this.$window.location = url
    }
  }
}

export default angular
  .module(componentName, [
    'ordinal',
    'ngSanitize',
    designationsService.name,
    cartService.name,
    orderService.name,
    desigSrcDirective.name,
    showErrors.name,
    loading.name,
    analyticsFactory.name
  ])
  .component(componentName, {
    controller: ProductConfigFormController,
    templateUrl: template,
    bindings: {
      code: '<',
      itemConfig: '<',
      isEdit: '<',
      uri: '<',
      defaultFrequency: '<',
      disableSessionRestart: '@',
      updateQueryParam: '&',
      submitted: '<',
      onStateChange: '&'
    }
  })

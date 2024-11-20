import angular from 'angular'
import isArray from 'lodash/isArray'

import productConfigForm from '../productConfigForm/productConfigForm.component'
import { giveGiftParams } from '../giveGiftParams'
import modalStateService from 'common/services/modalState.service'
import designationsService from 'common/services/api/designations.service'
import { mobileBreakpoint } from 'common/app.constants'

import template from './productConfig.modal.tpl.html'

const componentName = 'productConfigModal'

class ProductConfigModalController {
  /* @ngInject */
  constructor ($window, $location, modalStateService, designationsService, cartService) {
    this.$window = $window
    this.$location = $location
    this.modalStateService = modalStateService
    this.designationsService = designationsService
    this.cartService = cartService
  }

  $onInit () {
    this.initModalData()
    this.initializeParams()

    this.isMobile = this.$window.innerWidth <= mobileBreakpoint
  }

  $onDestroy () {
    // Clear the modal name and params when the modal closes
    this.modalStateService.name(null)
    angular.forEach(giveGiftParams, (value) => {
      // Remove all query params except CampaignCode
      if (value !== giveGiftParams.campaignCode) {
        this.$location.search(value, null)
      }
    })
  }

  initModalData () {
    this.code = this.resolve.code
    this.itemConfig = this.resolve.itemConfig || {}
    this.isEdit = !!this.resolve.isEdit
    this.uri = this.resolve.uri
  }

  initializeParams () {
    if (this.isEdit) {
      return
    }

    // Add query params for current modal
    this.modalStateService.name('give-gift')
    this.updateQueryParam(giveGiftParams.designation, this.code)
    if (this.itemConfig['campaign-page']) {
      this.updateQueryParam(giveGiftParams.campaignPage, this.itemConfig['campaign-page'])
    }

    // Load query params to populate itemConfig
    const params = this.$location.search()

    this.itemConfig.AMOUNT = params[giveGiftParams.amount]

    if (Object.prototype.hasOwnProperty.call(params, giveGiftParams.frequency)) {
      this.defaultFrequency = params[giveGiftParams.frequency]
    }

    if (Object.prototype.hasOwnProperty.call(params, giveGiftParams.day)) {
      this.itemConfig.RECURRING_DAY_OF_MONTH = params[giveGiftParams.day]
    }

    if (Object.prototype.hasOwnProperty.call(params, giveGiftParams.month)) {
      this.itemConfig.RECURRING_START_MONTH = params[giveGiftParams.month]
    }

    if (Object.prototype.hasOwnProperty.call(params, giveGiftParams.campaignPage) && params[giveGiftParams.campaignPage] !== '') {
      this.itemConfig['campaign-page'] = params[giveGiftParams.campaignPage]
    }

    // If CampaignCode exists in URL, use it, otherwise use default-campaign-code if set.
    if (Object.prototype.hasOwnProperty.call(params, giveGiftParams.campaignCode)) {
      this.itemConfig.CAMPAIGN_CODE = isArray(params[giveGiftParams.campaignCode])
        ? params[giveGiftParams.campaignCode][0]
        : params[giveGiftParams.campaignCode]

      // make sure campaign code is alphanumeric and less than 30 characters
      if (this.itemConfig.CAMPAIGN_CODE.match(/^[a-z0-9]+$/i) === null || this.itemConfig.CAMPAIGN_CODE.length > 30) {
        this.itemConfig.CAMPAIGN_CODE = ''
      }
    } else if (Object.prototype.hasOwnProperty.call(this.itemConfig, 'default-campaign-code')) {
      this.itemConfig.CAMPAIGN_CODE = this.itemConfig['default-campaign-code']
    } else if (this.itemConfig['campaign-page']) {
      // make sure we call the code to pull the default campaign code when going straight to the modal
      this.designationsService.suggestedAmounts(this.code, this.itemConfig)
        .subscribe(null, null, () => {
          this.itemConfig.CAMPAIGN_CODE = this.itemConfig['default-campaign-code']
        })
    }
  }

  updateQueryParam (param, value) {
    if (!this.isEdit) this.$location.search(param, value)
  }

  onStateChange (state) {
    this.state = state
    this.submitted = false
    switch (state) {
      case 'submitted':
        this.close()

        if (this.isMobile && !this.isEdit) {
          this.$window.location = `/${this.cartService.buildCartUrl()}`
        }
        break
    }
  }

  buildCartUrl () {
    return `/${this.cartService.buildCartUrl()}`
  }
}

export default angular
  .module(componentName, [
    'ordinal',
    productConfigForm.name,
    modalStateService.name,
    designationsService.name
  ])
  .component(componentName, {
    controller: ProductConfigModalController,
    templateUrl: template,
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&',
    }
  })

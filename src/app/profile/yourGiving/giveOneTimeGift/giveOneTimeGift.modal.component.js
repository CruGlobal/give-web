import angular from 'angular'
import map from 'lodash/map'
import concat from 'lodash/concat'

import step1SelectRecentRecipients from './step1/selectRecentRecipients.component'
import step1SearchRecipients from './step1/searchRecipients.component'
import step2EnterAmounts from './step2/enterAmounts.component'
import { giftAddedEvent } from 'common/lib/cartEvents'

import RecurringGiftModel from 'common/models/recurringGift.model'

import donationsService from 'common/services/api/donations.service'
import cartService from 'common/services/api/cart.service'
import analyticsFactory from 'app/analytics/analytics.factory'
import { scrollModalToTop } from 'common/services/modalState.service'

import template from './giveOneTimeGift.modal.tpl.html'

const componentName = 'giveOneTimeGiftModal'

class GiveOneTimeGiftModalController {
  /* @ngInject */
  constructor ($scope, $log, donationsService, cartService, analyticsFactory) {
    this.$scope = $scope
    this.$log = $log
    this.donationsService = donationsService
    this.cartService = cartService
    this.analyticsFactory = analyticsFactory
    this.recentRecipients = []
    this.selectedRecipients = []
    this.scrollModalToTop = scrollModalToTop
  }

  $onInit () {
    this.loadRecentRecipients()
  }

  loadRecentRecipients () {
    this.state = 'loadingRecentRecipients'
    this.donationsService.getRecentRecipients()
      .subscribe(recentRecipients => {
        this.recentRecipients = map(recentRecipients, gift => (new RecurringGiftModel(gift)).setDefaultsSingleGift())
        this.hasRecentRecipients = this.recentRecipients && this.recentRecipients.length > 0
        this.next()
      }, (error) => {
        this.state = 'errorLoadingRecentRecipients'
        this.$log.error('Error loading recent recipients', error)
      })
  }

  next (selectedRecipients, search, additionalRecipients) {
    switch (this.state) {
      case 'loadingRecentRecipients':
        if (this.hasRecentRecipients) {
          this.state = 'step1SelectRecentRecipients'
        } else {
          this.state = 'step1SearchRecipients'
        }
        break
      case 'errorLoadingRecentRecipients':
        this.state = 'step1SearchRecipients'
        break
      case 'step1SelectRecentRecipients':
        this.selectedRecipients = selectedRecipients || []
        if (!search && this.selectedRecipients && this.selectedRecipients.length > 0) {
          this.state = 'step2EnterAmounts'
        } else {
          this.state = 'step1SearchRecipients'
        }
        break
      case 'step1SearchRecipients':
        this.recentRecipients = concat(this.recentRecipients, additionalRecipients)
        this.hasRecentRecipients = this.recentRecipients && this.recentRecipients.length > 0
        this.selectedRecipients = concat(this.selectedRecipients, additionalRecipients)
        this.state = 'step2EnterAmounts'
        break
      case 'step2EnterAmounts':
        this.selectedRecipients = selectedRecipients
        this.addSelectedRecipientsToCart()
        break
    }
    this.scrollModalToTop()
  }

  previous () {
    switch (this.state) {
      case 'step2EnterAmounts':
        if (this.hasRecentRecipients) {
          this.state = 'step1SelectRecentRecipients'
        } else {
          this.state = 'step1SearchRecipients'
        }
        this.errors = {}
        break
      case 'step1SearchRecipients':
        this.state = 'step1SelectRecentRecipients'
        break
    }
    this.scrollModalToTop()
  }

  addSelectedRecipientsToCart () {
    this.submitted = false
    const succededRequests = []
    const erroredRequests = []
    this.errors = {}
    this.cartService
      .bulkAdd(this.selectedRecipients)
      .subscribe(response => {
        if (response.error) {
          erroredRequests.push(response)
          this.$log.error('Error adding a selected one time recipient to cart', response)
        } else {
          succededRequests.push(response)
        }
      },
      error => {
        this.$log.error('Error adding selected one time recipients to cart', error)
        this.errors.addToCart = true
        this.submitted = true
      },
      () => {
        if (erroredRequests.length === 0) {
          this.$scope.$emit(giftAddedEvent)
          this.close()
        } else {
          this.errors.addToCart = true
          this.selectedRecipients = map(erroredRequests, 'configuredDesignation')
          this.submitted = true
        }
      }
      )
  }
}

export default angular
  .module(componentName, [
    step1SelectRecentRecipients.name,
    step1SearchRecipients.name,
    step2EnterAmounts.name,
    donationsService.name,
    cartService.name,
    analyticsFactory.name
  ])
  .component(componentName, {
    controller: GiveOneTimeGiftModalController,
    templateUrl: template,
    bindings: {
      close: '&',
      dismiss: '&'
    }
  })

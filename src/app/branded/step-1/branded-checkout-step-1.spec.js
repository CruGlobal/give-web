import angular from 'angular'
import 'angular-mocks'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'

import module from './branded-checkout-step-1.component'

describe('branded checkout step 1', () => {
  beforeEach(angular.mock.module(module.name))
  let $ctrl

  beforeEach(inject($componentController => {
    $ctrl = $componentController(module.name, null, {
      next: jest.fn(),
      onPaymentFailed: jest.fn()
    })
  }))

  describe('$onInit', () => {
    it('should load cart', () => {
      jest.spyOn($ctrl, 'resetSubmission').mockImplementation(() => {})
      jest.spyOn($ctrl, 'initItemConfig').mockImplementation(() => {})
      jest.spyOn($ctrl, 'initCart').mockImplementation(() => {})
      $ctrl.$onInit()

      expect($ctrl.resetSubmission).toHaveBeenCalled()
      expect($ctrl.initItemConfig).toHaveBeenCalled()
      expect($ctrl.initCart).toHaveBeenCalled()
    })
  })

  describe('initItemConfig', () => {
    it('should initialize item config', () => {
      $ctrl.campaignCode = '1234'
      $ctrl.campaignPage = '135'
      $ctrl.amount = '75'
      $ctrl.day = '9'
      $ctrl.initItemConfig()

      expect($ctrl.itemConfig).toEqual({
        CAMPAIGN_CODE: '1234',
        'campaign-page': '135',
        AMOUNT: '75',
        priceWithFees: '$76.80',
        'RECURRING_DAY_OF_MONTH': '9'
      })

      expect($ctrl.defaultFrequency).toBeUndefined()
    })

    it('should initialize monthly gifts', () => {
      $ctrl.frequency = 'monthly'
      $ctrl.initItemConfig()

      expect($ctrl.defaultFrequency).toEqual('MON')
      expect($ctrl.itemConfig.frequency).toEqual('monthly')
    })

    it('should initialize quarterly gifts', () => {
      $ctrl.frequency = 'quarterly'
      $ctrl.initItemConfig()

      expect($ctrl.defaultFrequency).toEqual('QUARTERLY')
      expect($ctrl.itemConfig.frequency).toEqual('quarterly')
    })

    it('should initialize annual gifts', () => {
      $ctrl.frequency = 'annually'
      $ctrl.initItemConfig()

      expect($ctrl.defaultFrequency).toEqual('ANNUAL')
      expect($ctrl.itemConfig.frequency).toEqual('annually')
    })

    it('should validate campaignCode (too long)', () => {
      $ctrl.campaignCode = 'abcdefghijklmnopqrstuvwxyz0123456789'
      $ctrl.initItemConfig()
      expect($ctrl.itemConfig.CAMPAIGN_CODE).toEqual('')
    })

    it('should validate campaignCode (non alpha numeric)', () => {
      $ctrl.campaignCode = '😅😳'
      $ctrl.initItemConfig()
      expect($ctrl.itemConfig.CAMPAIGN_CODE).toEqual('')
    })

    it('should persist premium-code in item config', () => {
      $ctrl.itemConfig = { 'premium-code': '112233' }
      $ctrl.initItemConfig()
      expect($ctrl.itemConfig['premium-code']).toEqual('112233')
    })
  })

  describe('initCart', () => {
    beforeEach(() => {
      jest.spyOn($ctrl.cartService, 'get')
        .mockReturnValue(Observable.of({ items: [{ code: '1234567', config: {}, price: '$1.02', amount: 1.02 }] }))
      $ctrl.donorDetails = { mailingAddress: {} }
    })

    it('should get cart data and find existing item in cart', () => {
      $ctrl.campaignPage = 'campaign1'
      $ctrl.code = '1234567'
      $ctrl.initCart()

      expect($ctrl.cartService.get).toHaveBeenCalled()
      expect($ctrl.isEdit).toEqual(true)
      expect($ctrl.item.code).toEqual('1234567')
      expect($ctrl.itemConfig['campaign-page']).toEqual('campaign1')
      expect($ctrl.loadingProductConfig).toEqual(false)
    })

    it('should get cart data and not enter edit mode when cart has no items', () => {
      $ctrl.cartService.get.mockReturnValue(Observable.of({ }))
      $ctrl.initCart()

      expect($ctrl.cartService.get).toHaveBeenCalled()
      expect($ctrl.isEdit).toBeUndefined()
      expect($ctrl.item).toBeUndefined()
      expect($ctrl.loadingProductConfig).toEqual(false)
    })

    it('should handle error loading cart', () => {
      $ctrl.cartService.get.mockReturnValue(Observable.throw('some error'))
      $ctrl.initCart()

      expect($ctrl.cartService.get).toHaveBeenCalled()
      expect($ctrl.isEdit).toBeUndefined()
      expect($ctrl.item).toBeUndefined()
      expect($ctrl.loadingProductConfig).toEqual(false)
      expect($ctrl.errorLoadingProductConfig).toEqual(true)
      expect($ctrl.$log.error.logs[0]).toEqual(['Error loading cart data for branded checkout step 1', 'some error'])
    })
  })

  describe('submit', () => {
    it('should reset and start submission', () => {
      jest.spyOn($ctrl, 'resetSubmission').mockImplementation(() => {})
      $ctrl.submit()

      expect($ctrl.resetSubmission).toHaveBeenCalled()
      expect($ctrl.submitted).toEqual(true)
    })
  })

  describe('resetSubmission', () => {
    it('should set all submission values', () => {
      $ctrl.resetSubmission()

      expect($ctrl.submission).toEqual({
        giftConfig: {
          completed: false,
          error: false
        },
        contactInfo: {
          completed: false,
          error: false
        },
        payment: {
          completed: false,
          error: false
        }
      })
    })
  })

  describe('onGiftConfigStateChange', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'checkSuccessfulSubmission').mockImplementation(() => {})
      $ctrl.resetSubmission()
    })

    it('should handle a successful submission', () => {
      $ctrl.onGiftConfigStateChange('submitted')

      expect($ctrl.submission.giftConfig).toEqual({
        completed: true,
        error: false
      })

      expect($ctrl.isEdit).toEqual(true)
      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled()
    })

    it('should handle an error submitting', () => {
      $ctrl.onGiftConfigStateChange('errorSubmitting')

      expect($ctrl.submission.giftConfig).toEqual({
        completed: true,
        error: true
      })

      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled()
    })

    it('should handle an error adding duplicate items', () => {
      $ctrl.onGiftConfigStateChange('errorAlreadyInCart')

      expect($ctrl.submission.giftConfig).toEqual({
        completed: true,
        error: true
      })

      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled()
    })
  })

  describe('onContactInfoSubmit', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'checkSuccessfulSubmission').mockImplementation(() => {})
      jest.spyOn($ctrl.brandedAnalyticsFactory, 'saveDonorDetails')
      $ctrl.resetSubmission()
      $ctrl.donorDetails = {
        'donor-type': 'Household'
      }
    })

    it('should handle a successful submission', () => {
      $ctrl.onContactInfoSubmit(true)

      expect($ctrl.submission.contactInfo).toEqual({
        completed: true,
        error: false
      })

      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled()
      expect($ctrl.brandedAnalyticsFactory.saveDonorDetails).toHaveBeenCalledWith($ctrl.donorDetails)
    })

    it('should handle an error submitting', () => {
      $ctrl.onContactInfoSubmit(false)

      expect($ctrl.submission.contactInfo).toEqual({
        completed: true,
        error: true
      })

      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled()
      expect($ctrl.brandedAnalyticsFactory.saveDonorDetails).not.toHaveBeenCalled()
    })
  })

  describe('onPaymentStateChange', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'checkSuccessfulSubmission').mockImplementation(() => {})
      $ctrl.resetSubmission()
    })

    it('should handle a successful submission', () => {
      $ctrl.onPaymentStateChange('submitted')

      expect($ctrl.submission.payment).toEqual({
        completed: true,
        error: false
      })

      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled()
    })

    it('should handle an error submitting', () => {
      $ctrl.onPaymentStateChange('errorSubmitting')

      expect($ctrl.submission.payment).toEqual({
        completed: true,
        error: true
      })

      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled()
      expect($ctrl.onPaymentFailed).toHaveBeenCalled()
    })

    it('should handle an unsubmitted error', () => {
      $ctrl.onPaymentStateChange('unsubmitted')

      expect($ctrl.submission.payment).toEqual({
        completed: true,
        error: true
      })

      expect($ctrl.checkSuccessfulSubmission).toHaveBeenCalled()
      expect($ctrl.onPaymentFailed).toHaveBeenCalled()
    })
  })

  describe('onSelectPremiumOption', () => {
    beforeEach(() => {
      $ctrl.initItemConfig()
      $ctrl.premiumCode = '112233'
    })

    it('premium selected', () => {
      $ctrl.premiumSelected = true

      $ctrl.onSelectPremiumOption()

      expect($ctrl.itemConfig['premium-code']).toEqual($ctrl.premiumCode)
    })

    it('premium deselected', () => {
      $ctrl.premiumSelected = false

      $ctrl.onSelectPremiumOption()

      expect($ctrl.itemConfig['premium-code']).toEqual(undefined)
    })
  })

  describe('checkSuccessfulSubmission', () => {
    beforeEach(() => {
      $ctrl.resetSubmission()
      $ctrl.submitted = true
    })

    it('should do nothing if all submissions aren\'t completed', () => {
      $ctrl.checkSuccessfulSubmission()

      expect($ctrl.next).not.toHaveBeenCalled()
      expect($ctrl.submitted).toEqual(true)
    })

    it('should do nothing if some submissions aren\'t completed', () => {
      $ctrl.submission.giftConfig.completed = true
      $ctrl.submission.contactInfo.completed = true
      $ctrl.checkSuccessfulSubmission()

      expect($ctrl.next).not.toHaveBeenCalled()
      expect($ctrl.submitted).toEqual(true)
    })

    it('should call next if submissions completed and no errors', () => {
      $ctrl.submission.giftConfig.completed = true
      $ctrl.submission.contactInfo.completed = true
      $ctrl.submission.payment.completed = true
      $ctrl.checkSuccessfulSubmission()

      expect($ctrl.next).toHaveBeenCalled()
      expect($ctrl.submitted).toEqual(true)
    })

    it('should set submitted to false if submissions completed and errors', () => {
      $ctrl.submission.giftConfig.completed = true
      $ctrl.submission.contactInfo.completed = true
      $ctrl.submission.payment.completed = true
      $ctrl.submission.giftConfig.error = true
      $ctrl.checkSuccessfulSubmission()

      expect($ctrl.next).not.toHaveBeenCalled()
      expect($ctrl.submitted).toEqual(false)
    })
  })
})

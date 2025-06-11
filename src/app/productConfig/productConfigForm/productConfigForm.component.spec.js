import angular from 'angular'
import 'angular-mocks'
import moment from 'moment'
import { advanceTo, clear } from 'jest-date-mock'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'
import { forcedUserToLogout } from '../../../common/services/session/session.service'
import module, { brandedCoverFeeCheckedEvent } from './productConfigForm.component'
import { giftAddedEvent, cartUpdatedEvent } from 'common/lib/cartEvents'
import { giveGiftParams } from '../giveGiftParams'

describe('product config form component', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl

  beforeEach(inject(function ($componentController) {
    advanceTo(moment.utc('2016-10-01').toDate())

    $ctrl = $componentController(module.name, {}, {
      itemConfigForm: {
        $valid: true,
        $dirty: false,
        $setDirty: jest.fn(() => {
          $ctrl.itemConfigForm.$dirty = true
        }),
        $submitted: false,
        $setSubmitted: jest.fn(() => {
          $ctrl.itemConfigForm.$submitted = true
        })
      },
      code: '1234567',
      itemConfig: {
        AMOUNT: '85'
      },
      isEdit: false,
      uri: 'uri',
      defaultFrequency: 'MON',
      updateQueryParam: jest.fn(),
      onStateChange: jest.fn(),
      hideQuarterly: false,
      hideAnnual: true,
      $window: { location: '', sessionStorage: { getItem: jest.fn() } }
    })
  }))

  afterEach(() => {
    clear()
  })

  it('to be defined', () => {
    expect($ctrl.$rootScope).toBeDefined()
    expect($ctrl.$scope).toBeDefined()
    expect($ctrl.$log).toBeDefined()
    expect($ctrl.designationsService).toBeDefined()
    expect($ctrl.cartService).toBeDefined()
    expect($ctrl.possibleTransactionDays).toBeDefined()
    expect($ctrl.startDate).toBeDefined()
  })

  describe('$onInit', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'initItemConfig').mockImplementation(() => {})
      jest.spyOn($ctrl, 'loadData').mockImplementation(() => {})
      jest.spyOn($ctrl, 'waitForFormInitialization').mockImplementation(() => {})
    })

    it('should call the initialization functions', () => {
      jest.spyOn($ctrl.$rootScope, '$on').mockImplementation(() => {})
      $ctrl.$onInit()

      expect($ctrl.initItemConfig).toHaveBeenCalled()
      expect($ctrl.loadData).toHaveBeenCalled()
      expect($ctrl.waitForFormInitialization).toHaveBeenCalled()
      $ctrl.$rootScope.$on.mock.calls[0][1]()
    })

    it('should handle brandedCoverFeeCheckedEvent for selectable amounts', () => {
      jest.spyOn($ctrl, 'changeAmount').mockImplementation(() => {})
      $ctrl.itemConfig.AMOUNT = 50

      $ctrl.$onInit()
      $ctrl.$rootScope.$emit(brandedCoverFeeCheckedEvent)
      expect($ctrl.initItemConfig).toHaveBeenCalled()
      expect($ctrl.changeAmount).toHaveBeenCalledWith(50, true)
    })

    it('should handle brandedCoverFeeCheckedEvent for custom amounts', () => {
      jest.spyOn($ctrl, 'changeCustomAmount').mockImplementation(() => {})
      $ctrl.itemConfig.AMOUNT = 1.02

      $ctrl.$onInit()
      $ctrl.$rootScope.$emit(brandedCoverFeeCheckedEvent)
      expect($ctrl.initItemConfig).toHaveBeenCalled()
      expect($ctrl.changeCustomAmount).toHaveBeenCalledWith(1.02, true)
    })
  })

  describe('initItemConfig', () => {
    it('should format item config values', () => {
      $ctrl.itemConfig['RECURRING_DAY_OF_MONTH'] = '9'
      $ctrl.itemConfig['RECURRING_START_MONTH'] = '8'
      $ctrl.initItemConfig()

      expect($ctrl.itemConfig.AMOUNT).toEqual(85)
      expect($ctrl.itemConfig.priceWithFees).toEqual('$87.05')
      expect($ctrl.itemConfig['RECURRING_DAY_OF_MONTH']).toEqual('09')
      expect($ctrl.itemConfig['RECURRING_START_MONTH']).toEqual('08')
    })

    it('should handle out of range values', () => {
      $ctrl.itemConfig.AMOUNT = 'invalid'
      $ctrl.itemConfig['RECURRING_DAY_OF_MONTH'] = '29'
      $ctrl.itemConfig['RECURRING_START_MONTH'] = '13'
      $ctrl.initItemConfig()

      expect($ctrl.itemConfig.AMOUNT).toBeUndefined()
      expect($ctrl.itemConfig.priceWithFees).toBeUndefined()
      expect($ctrl.itemConfig['RECURRING_DAY_OF_MONTH']).toBeUndefined()
      expect($ctrl.itemConfig['RECURRING_START_MONTH']).toBeUndefined()
    })

    it('should handle a whole number amount', () => {
      $ctrl.itemConfig.AMOUNT = 10
      $ctrl.initItemConfig()

      expect($ctrl.itemConfig.AMOUNT).toEqual(10)
      expect($ctrl.itemConfig.priceWithFees).toEqual('$10.24')
    })

    it('should handle amount on first time through', () => {
      $ctrl.itemConfig.AMOUNT = undefined
      $ctrl.initItemConfig()

      expect($ctrl.itemConfig.AMOUNT).toBeUndefined()
      expect($ctrl.itemConfig.priceWithFees).toBeUndefined()
    })

    it('should handle amount with cents', () => {
      $ctrl.itemConfig.AMOUNT = 10.25
      $ctrl.initItemConfig()

      expect($ctrl.itemConfig.AMOUNT).toEqual(10.25)
      expect($ctrl.itemConfig.priceWithFees).toEqual('$10.50')
    })
  })

  describe('$onChanges', () => {
    it('should call saveGiftToCart when submitted changes to true', () => {
      jest.spyOn($ctrl, 'saveGiftToCart').mockImplementation(() => {})
      $ctrl.$onChanges({ submitted: { currentValue: true } })

      expect($ctrl.saveGiftToCart).toHaveBeenCalled()
    })

    it('should not call saveGiftToCart when submit changes to false', () => {
      jest.spyOn($ctrl, 'saveGiftToCart').mockImplementation(() => {})
      $ctrl.$onChanges({ submitted: { currentValue: false } })

      expect($ctrl.saveGiftToCart).not.toHaveBeenCalled()
    })
  })

  describe('loadData', () => {
    beforeEach(() => {
      jest.spyOn($ctrl.designationsService, 'productLookup').mockReturnValue(Observable.of('product data'))
      jest.spyOn($ctrl, 'setDefaultAmount').mockImplementation(() => {})
      jest.spyOn($ctrl, 'setDefaultFrequency').mockImplementation(() => {})

      jest.spyOn($ctrl.commonService, 'getNextDrawDate').mockReturnValue(Observable.of('2016-10-02'))

      jest.spyOn($ctrl.designationsService, 'suggestedAmounts').mockReturnValue(Observable.of([{ amount: 5 }, { amount: 10 }, { amount: 0 }, { }]))

      jest.spyOn($ctrl.designationsService, 'givingLinks').mockReturnValue(Observable.of([]))
      jest.spyOn($ctrl.analyticsFactory, 'giveGiftModal').mockReturnValue(() => {})

      jest.spyOn($ctrl.envService, 'read').mockReturnValue(false)
      jest.spyOn($ctrl.brandedAnalyticsFactory, 'beginCheckout')
    })

    it('should get productData, nextDrawDate, suggestedAmounts and givingLinks', () => {
      $ctrl.loadData()

      expect($ctrl.showRecipientComments).toEqual(false)
      expect($ctrl.showDSComments).toEqual(false)

      expect($ctrl.productData).toEqual('product data')
      expect($ctrl.setDefaultAmount).toHaveBeenCalled()
      expect($ctrl.setDefaultFrequency).toHaveBeenCalled()
      expect($ctrl.brandedAnalyticsFactory.beginCheckout).not.toHaveBeenCalled()

      expect($ctrl.nextDrawDate).toEqual('2016-10-02')
      expect($ctrl.itemConfig['RECURRING_DAY_OF_MONTH']).toEqual('02')
      expect($ctrl.itemConfig['RECURRING_START_MONTH']).toEqual('10')

      expect($ctrl.suggestedAmounts).toEqual([{ amount: 5 }, { amount: 10 }])
      expect($ctrl.useSuggestedAmounts).toEqual(true)

      expect($ctrl.givingLinks).toEqual([])

      expect($ctrl.loading).toEqual(false)
      expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'unsubmitted' })
      expect($ctrl.analyticsFactory.giveGiftModal($ctrl.productData))
    })

    it('should called beginCheckout in branded checkout', () => {
      $ctrl.envService.read.mockReturnValue(true)
      $ctrl.loadData()
      expect($ctrl.brandedAnalyticsFactory.beginCheckout).toHaveBeenCalledWith($ctrl.productData)
    })

    it('should not use suggested amounts if they are not provided', () => {
      $ctrl.designationsService.suggestedAmounts.mockReturnValue(Observable.of([]))
      $ctrl.loadData()
      expect($ctrl.useSuggestedAmounts).toEqual(false)
    })

    it('should show givingLinks if present', () => {
      $ctrl.designationsService.givingLinks.mockReturnValue(Observable.of([{
        name: 'Name',
        url: 'http://example.com'
      }]))
      $ctrl.loadData()
      expect($ctrl.givingLinks).toEqual([{ name: 'Name', url: 'http://example.com' }])

      expect($ctrl.loading).toEqual(false)
      expect($ctrl.showGivingLinks).toEqual(true)
      expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'givingLinks' })
    })

    it('should handle an error loading data', () => {
      $ctrl.designationsService.productLookup.mockReturnValue(Observable.throw('some error'))
      $ctrl.loadData()

      expect($ctrl.errorLoading).toEqual(true)
      expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'errorLoading' })
      expect($ctrl.$log.error.logs[0]).toEqual(['Error loading data for product config form', 'some error'])
      expect($ctrl.loading).toEqual(false)
    })
  })


  describe('loadData but suggestedAmounts only has 0 amounts or empty objects', () => {
    beforeEach(() => {
      jest.spyOn($ctrl.designationsService, 'suggestedAmounts').mockReturnValue(Observable.of([{ amount: 0 }, { }]))
    })

    it('should use default amounts', () => {
      $ctrl.loadData()
      expect($ctrl.suggestedAmounts).toEqual([])
      expect($ctrl.useSuggestedAmounts).toEqual(false)
    })
  })

  describe('setDefaultAmount', () => {
    beforeEach(() => {
      $ctrl.itemConfig = {}
      jest.spyOn($ctrl, 'changeCustomAmount').mockImplementation(() => {})
    })

    it('should set the default amount if there are no suggested amounts', () => {
      $ctrl.setDefaultAmount()

      expect($ctrl.itemConfig.AMOUNT).toEqual(50)
      expect($ctrl.itemConfig.priceWithFees).toEqual('$51.20')
    })

    it('should set the default amount if there are suggested amounts', () => {
      $ctrl.suggestedAmounts = [{ amount: 14 }]
      $ctrl.setDefaultAmount()

      expect($ctrl.itemConfig.AMOUNT).toEqual(14)
      expect($ctrl.itemConfig.priceWithFees).toEqual('$14.34')
    })

    it('should use an existing selectableAmounts', () => {
      $ctrl.setAmount(100)
      $ctrl.setDefaultAmount()

      expect($ctrl.itemConfig.AMOUNT).toEqual(100)
      expect($ctrl.itemConfig.priceWithFees).toEqual('$102.41')
      expect($ctrl.changeCustomAmount).not.toHaveBeenCalled()
    })

    it('should use an existing suggestedAmounts', () => {
      $ctrl.setAmount(14)
      $ctrl.suggestedAmounts = [{ amount: 14 }]
      $ctrl.setDefaultAmount()

      expect($ctrl.itemConfig.AMOUNT).toEqual(14)
      expect($ctrl.itemConfig.priceWithFees).toEqual('$14.34')
      expect($ctrl.changeCustomAmount).not.toHaveBeenCalled()
    })

    it('should initialize the custom value without suggestedAmounts', () => {
      $ctrl.setAmount(14)
      $ctrl.setDefaultAmount()

      expect($ctrl.itemConfig.AMOUNT).toEqual(14)
      expect($ctrl.itemConfig.priceWithFees).toEqual('$14.34')
      expect($ctrl.changeCustomAmount).toHaveBeenCalledWith(14)
    })

    it('should initialize the custom value with suggestedAmounts', () => {
      $ctrl.setAmount(14)
      $ctrl.suggestedAmounts = [{ amount: 25 }]
      $ctrl.setDefaultAmount()

      expect($ctrl.itemConfig.AMOUNT).toEqual(14)
      expect($ctrl.itemConfig.priceWithFees).toEqual('$14.34')
      expect($ctrl.changeCustomAmount).toHaveBeenCalledWith(14)
    })
  })

  describe('setDefaultFrequency', () => {
    it('should change the frequency to the specified default frequency', () => {
      jest.spyOn($ctrl, 'changeFrequency').mockImplementation(() => {})
      $ctrl.productData = {
        frequencies: [{ name: 'MON', selectAction: 'uri' }]
      }
      $ctrl.setDefaultFrequency()

      expect($ctrl.changeFrequency).toHaveBeenCalledWith({ name: 'MON', selectAction: 'uri' })
    })
  })

  describe('waitForFormInitialization()', () => {
    it('should wait for the form to become available and then call addCustomValidators()', (done) => {
      jest.spyOn($ctrl, 'addCustomValidators').mockImplementation(() => {})
      delete $ctrl.itemConfigForm
      $ctrl.waitForFormInitialization()
      $ctrl.$scope.$digest()

      expect($ctrl.addCustomValidators).not.toHaveBeenCalled()
      $ctrl.itemConfigForm = {
        $valid: true,
        $dirty: false,
        amount: {}
      }
      $ctrl.$scope.$digest()

      expect($ctrl.addCustomValidators).toHaveBeenCalled()
      done()
    })
  })

  describe('addCustomValidators()', () => {
    beforeEach(() => {
      $ctrl.itemConfigForm.amount = {
        $validators: {},
        $parsers: []
      }
    })

    it('should create validators', () => {
      $ctrl.customInputActive = true
      $ctrl.addCustomValidators()

      expect($ctrl.itemConfigForm.amount.$parsers[0]('$10')).toBe('10')
      expect($ctrl.itemConfigForm.amount.$parsers[0]('$10,000')).toBe('10000')

      expect($ctrl.itemConfigForm.amount.$validators.minimum('1')).toBe(true)
      expect($ctrl.itemConfigForm.amount.$validators.minimum('0.9')).toBe(false)

      expect($ctrl.itemConfigForm.amount.$validators.maximum('9999999.99')).toBe(true)
      expect($ctrl.itemConfigForm.amount.$validators.maximum('10000000')).toBe(false)

      expect($ctrl.itemConfigForm.amount.$validators.pattern('4.4')).toBe(true)
      expect($ctrl.itemConfigForm.amount.$validators.pattern('4.')).toBe(false)
      expect($ctrl.itemConfigForm.amount.$validators.pattern('4.235')).toBe(false)
    })

    it('should pass validation in any \'bad\' case', () => {
      $ctrl.customInputActive = false
      $ctrl.addCustomValidators()

      expect($ctrl.itemConfigForm.amount.$validators.minimum('0.3')).toBe(true)
      expect($ctrl.itemConfigForm.amount.$validators.minimum('dlksfjs')).toBe(true)
      expect($ctrl.itemConfigForm.amount.$validators.maximum('4542452454524.99')).toBe(true)
      expect($ctrl.itemConfigForm.amount.$validators.pattern('1.214')).toBe(true)
    })
  })

  describe('frequencyOrder()', () => {
    it('orders frequency by name', () => {
      expect($ctrl.frequencyOrder({ name: 'NA' })).toEqual(0)
      expect($ctrl.frequencyOrder({ name: 'MON' })).toEqual(1)
    })

    it('changes frequency order when quarterly is shown', () => {
      $ctrl.hideQuarterly = false
      expect($ctrl.frequencyOrder({ name: 'QUARTERLY' })).toEqual(2)
    })

    it('changes frequency order when quarterly is hidden', () => {
      $ctrl.hideQuarterly = true
      expect($ctrl.frequencyOrder({ name: 'NA' })).toEqual(0)
    })

    it('should change frequency order when annual is shown and quarterly is hidden', () => {
      $ctrl.hideAnnual = true
      $ctrl.hideQuarterly = false
      expect($ctrl.frequencyOrder({ name: 'ANNUAL' })).toEqual(3)
    })
  })

  describe('changeFrequency()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl.designationsService, 'productLookup').mockReturnValue(Observable.of({ frequency: 'NA' }))
      $ctrl.productData = { frequency: 'MON' }
      $ctrl.errorAlreadyInCart = true
      $ctrl.changingFrequency = false
    })

    it('does nothing', () => {
      $ctrl.changeFrequency({ name: 'MON', selectAction: '/b' })

      expect($ctrl.designationsService.productLookup).not.toHaveBeenCalled()
      expect($ctrl.itemConfigForm.$setDirty).not.toHaveBeenCalled()
      expect($ctrl.productData).toEqual({ frequency: 'MON' })
    })

    it('changes product frequency', () => {
      $ctrl.changeFrequency({ name: 'NA', selectAction: '/a' })

      expect($ctrl.designationsService.productLookup).toHaveBeenCalledWith('/a', true)
      expect($ctrl.itemConfigForm.$setDirty).toHaveBeenCalled()
      expect($ctrl.productData).toEqual({ frequency: 'NA' })
      expect($ctrl.updateQueryParam).toHaveBeenCalledWith({ key: giveGiftParams.frequency, value: 'NA' })
      expect($ctrl.errorChangingFrequency).toEqual(false)
      expect($ctrl.errorAlreadyInCart).toEqual(false)
      expect($ctrl.changingFrequency).toEqual(false)
      expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'unsubmitted' })
    })

    it('should handle an error changing frequency', () => {
      $ctrl.designationsService.productLookup.mockReturnValue(Observable.throw('some error'))
      $ctrl.changeFrequency({ name: 'NA', selectAction: '/a' })

      expect($ctrl.designationsService.productLookup).toHaveBeenCalledWith('/a', true)
      expect($ctrl.itemConfigForm.$setDirty).not.toHaveBeenCalled()
      expect($ctrl.productData).toEqual({ frequency: 'MON' })
      expect($ctrl.updateQueryParam).toHaveBeenCalledWith({ key: giveGiftParams.frequency, value: 'NA' })
      expect($ctrl.updateQueryParam).toHaveBeenCalledWith({ key: giveGiftParams.frequency, value: 'MON' })
      expect($ctrl.errorChangingFrequency).toEqual(true)
      expect($ctrl.$log.error.logs[0]).toEqual(['Error loading new product when changing frequency', 'some error'])
      expect($ctrl.errorAlreadyInCart).toEqual(false)
      expect($ctrl.changingFrequency).toEqual(false)
      expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'unsubmitted' })
    })

    it('should expose the frequency display value to the itemConfig on branded checkout', () => {
      jest.spyOn($ctrl.envService, 'read').mockImplementation((key) => {
        if (key === 'isBrandedCheckout') {
          return true
        }
        return false
      })
      $ctrl.hideAnnual = false
      $ctrl.changeFrequency({ name: 'NA', selectAction: '/a', display: 'Single' })
      expect($ctrl.itemConfig.frequency).toEqual('Single')
    })
  })

  describe('changeAmount()', () => {
    it('sets itemConfig amount', () => {
      $ctrl.changeAmount(100)

      expect($ctrl.itemConfigForm.$setDirty).toHaveBeenCalled()
      expect($ctrl.itemConfig.AMOUNT).toEqual(100)
      expect($ctrl.itemConfig.priceWithFees).toEqual('$102.41')
      expect($ctrl.customAmount).toBe('')
      expect($ctrl.customInputActive).toEqual(false)
      expect($ctrl.updateQueryParam).toHaveBeenCalledWith({ key: giveGiftParams.amount, value: 100 })
    })

    it('should clear cover fees if we are not explicitly retaining them and the amount changed', () => {
      jest.spyOn($ctrl.orderService, 'clearCoverFees').mockImplementation(() => {})
      jest.spyOn($ctrl.$scope, '$emit').mockImplementation(() => {})

      $ctrl.itemConfig.AMOUNT = 50
      $ctrl.changeAmount(100)

      expect($ctrl.itemConfig.priceWithFees).toEqual('$102.41')
      expect($ctrl.amountChanged).toEqual(true)
      expect($ctrl.orderService.clearCoverFees).toHaveBeenCalled()
    })

    it('should not clear cover fees if we are explicitly retaining them and the amount changed', () => {
      jest.spyOn($ctrl.orderService, 'clearCoverFees').mockImplementation(() => {})
      jest.spyOn($ctrl.$scope, '$emit').mockImplementation(() => {})

      $ctrl.itemConfig.AMOUNT = 50
      $ctrl.changeAmount(100, true)

      expect($ctrl.itemConfig.priceWithFees).toEqual('$102.41')
      expect($ctrl.amountChanged).toEqual(true)
      expect($ctrl.orderService.clearCoverFees).not.toHaveBeenCalled()
    })

    it('should not clear cover fees if we did not change the amount', () => {
      jest.spyOn($ctrl.orderService, 'clearCoverFees').mockImplementation(() => {})
      jest.spyOn($ctrl.$scope, '$emit').mockImplementation(() => {})

      $ctrl.itemConfig.AMOUNT = 50
      $ctrl.changeAmount(50)

      expect($ctrl.itemConfig.priceWithFees).toEqual('$51.20')
      expect($ctrl.amountChanged).toEqual(false)
      expect($ctrl.orderService.clearCoverFees).not.toHaveBeenCalled()
    })
  })

  describe('changeCustomAmount()', () => {
    it('sets itemConfig amount', () => {
      $ctrl.itemConfig = {}
      $ctrl.changeCustomAmount(300)

      expect($ctrl.itemConfig.AMOUNT).toEqual(300)
      expect($ctrl.itemConfig.priceWithFees).toEqual('$307.22')
      expect($ctrl.customAmount).toEqual(300)
      expect($ctrl.customInputActive).toEqual(true)
      expect($ctrl.updateQueryParam).toHaveBeenCalledWith({ key: giveGiftParams.amount, value: 300 })
    })

    it('sets itemConfig amount with string', () => {
      $ctrl.itemConfig = {}
      $ctrl.changeCustomAmount('300')

      expect($ctrl.itemConfig.AMOUNT).toEqual(300)
      expect($ctrl.itemConfig.priceWithFees).toEqual('$307.22')
      expect($ctrl.customAmount).toEqual('300')
      expect($ctrl.customInputActive).toEqual(true)
      expect($ctrl.updateQueryParam).toHaveBeenCalledWith({ key: giveGiftParams.amount, value: '300' })
    })

    it('should clear cover fees if we are not explicitly retaining them and the amount changed', () => {
      jest.spyOn($ctrl.orderService, 'clearCoverFees').mockImplementation(() => {})
      jest.spyOn($ctrl.$scope, '$emit').mockImplementation(() => {})

      $ctrl.itemConfig.AMOUNT = 51.2
      $ctrl.changeCustomAmount(1)

      expect($ctrl.amountChanged).toEqual(true)
      expect($ctrl.itemConfig.priceWithFees).toEqual('$1.02')
      expect($ctrl.orderService.clearCoverFees).toHaveBeenCalled()
    })

    it('should not clear cover fees if we are explicitly retaining them and the amount changed', () => {
      jest.spyOn($ctrl.orderService, 'clearCoverFees').mockImplementation(() => {})
      jest.spyOn($ctrl.$scope, '$emit').mockImplementation(() => {})

      $ctrl.itemConfig.AMOUNT = 51.2
      $ctrl.changeCustomAmount(1, true)

      expect($ctrl.amountChanged).toEqual(true)
      expect($ctrl.itemConfig.priceWithFees).toEqual('$1.02')
      expect($ctrl.orderService.clearCoverFees).not.toHaveBeenCalled()
      expect($ctrl.$scope.$emit).not.toHaveBeenCalled()
    })

    it('should not clear cover fees if we did not change the amount', () => {
      jest.spyOn($ctrl.orderService, 'clearCoverFees').mockImplementation(() => {})
      jest.spyOn($ctrl.$scope, '$emit').mockImplementation(() => {})

      $ctrl.itemConfig.AMOUNT = 5
      $ctrl.changeAmount(5)

      expect($ctrl.amountChanged).toEqual(false)
      expect($ctrl.itemConfig.priceWithFees).toEqual('$5.12')
      expect($ctrl.orderService.clearCoverFees).not.toHaveBeenCalled()
      expect($ctrl.$scope.$emit).not.toHaveBeenCalled()
    })
  })

  describe('checkAmountChanged()', () => {
    it('returns true if the amount changed', () => {
      $ctrl.itemConfig = { AMOUNT: 1 }
      $ctrl.checkAmountChanged(2)
      expect($ctrl.amountChanged).toEqual(true)
    })

    it('returns false if the amount did not change', () => {
      $ctrl.itemConfig = { AMOUNT: 2 }
      $ctrl.checkAmountChanged(2)
      expect($ctrl.amountChanged).toEqual(false)
    })

    it('returns true if the item config amount was not defined but the amount is', () => {
      $ctrl.itemConfig = {}
      $ctrl.checkAmountChanged(5)
      expect($ctrl.amountChanged).toEqual(true)
    })
  })

  describe('changeStartDay()', () => {
    it('sets day query param', () => {
      $ctrl.errorAlreadyInCart = true
      $ctrl.changeStartDay('11')

      expect($ctrl.updateQueryParam).toHaveBeenCalledWith({ key: giveGiftParams.day, value: '11' })
      expect($ctrl.errorAlreadyInCart).toEqual(false)
    })
  })

  describe('setAmount', () => {
    it('should set AMOUNT and priceWithFees', () => {
      $ctrl.setAmount(50)
      expect($ctrl.itemConfig.priceWithFees).toEqual('$51.20')
    })

    it('should should handle large numbers properly', () => {
      $ctrl.setAmount(25000)
      expect($ctrl.itemConfig.priceWithFees).toEqual('$25,601.64')
    })
  })

  describe('saveGiftToCart()', () => {
    beforeEach(() => {
      // Make sure it resets errors
      $ctrl.errorAlreadyInCart = true
      $ctrl.errorSavingGeneric = true
      jest.spyOn($ctrl.analyticsFactory, 'cartAdd').mockImplementation(() => {})
      jest.spyOn($ctrl.brandedAnalyticsFactory, 'saveTestingTransaction')
      $ctrl.initItemConfig()
    })

    afterEach(() => {
      expect($ctrl.itemConfigForm.$submitted).toEqual(true)
    })

    describe('isEdit = true', () => {
      testSaving(true)
    })

    describe('isEdit = false', () => {
      testSaving(false)
    })

    describe('testing transaction flag', () => {
      beforeEach(() => {
        $ctrl.productData = {}
      })

      it('saves flag with no comment', () => {
        $ctrl.saveGiftToCart()

        expect($ctrl.brandedAnalyticsFactory.saveTestingTransaction).toHaveBeenCalledWith(false)
      })

      it('saves flag with non-test comment', () => {
        $ctrl.itemConfig.DONATION_SERVICES_COMMENTS = 'Anonymous'
        $ctrl.saveGiftToCart()

        expect($ctrl.brandedAnalyticsFactory.saveTestingTransaction).toHaveBeenCalledWith(false)
      })

      it('saves flag with test comment', () => {
        $ctrl.itemConfig.DONATION_SERVICES_COMMENTS = 'Testing'
        $ctrl.saveGiftToCart()

        expect($ctrl.brandedAnalyticsFactory.saveTestingTransaction).toHaveBeenCalledWith(true)
      })
    })

    function testSaving (isEdit) {
      const operation = isEdit ? 'editItem' : 'addItem'
      const cartEvent = isEdit ? cartUpdatedEvent : giftAddedEvent
      const operationArgs = isEdit
        ? ['uri', 'items/crugive/<some id>', { AMOUNT: 85, priceWithFees: '$87.05' }]
        : ['items/crugive/<some id>', { AMOUNT: 85, priceWithFees: '$87.05' }, undefined]
      beforeEach(() => {
        $ctrl.isEdit = isEdit
        jest.spyOn($ctrl.cartService, operation).mockReturnValue(Observable.of({ self: { uri: 'uri' } }))
        $ctrl.productData = { uri: 'items/crugive/<some id>' }
        jest.spyOn($ctrl.$scope, '$emit').mockImplementation(() => {})
      })

      it('should do nothing on invalid form', () => {
        $ctrl.itemConfigForm.$valid = false
        $ctrl.saveGiftToCart()

        expect($ctrl.submittingGift).toEqual(false)
        expect($ctrl.cartService[operation]).not.toHaveBeenCalled()
        expect($ctrl.errorAlreadyInCart).toEqual(false)
        expect($ctrl.errorSavingGeneric).toEqual(false)
      })

      it('should still submit the gift if the form is not dirty', () => {
        $ctrl.saveGiftToCart()

        expect($ctrl.submittingGift).toEqual(false)
        expect($ctrl.cartService[operation]).toHaveBeenCalledWith(...operationArgs)
        expect($ctrl.$scope.$emit).toHaveBeenCalledWith(cartEvent)
        expect($ctrl.errorAlreadyInCart).toEqual(false)
        expect($ctrl.errorSavingGeneric).toEqual(false)
      })

      it('should submit a gift successfully', () => {
        $ctrl.itemConfigForm.$dirty = true
        $ctrl.saveGiftToCart()

        expect($ctrl.submittingGift).toEqual(false)
        expect($ctrl.cartService[operation]).toHaveBeenCalledWith(...operationArgs)
        expect($ctrl.$scope.$emit).toHaveBeenCalledWith(cartEvent)
        expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'submitted' })
        expect($ctrl.errorAlreadyInCart).toEqual(false)
        expect($ctrl.errorSavingGeneric).toEqual(false)
        $ctrl.isEdit ? expect($ctrl.analyticsFactory.cartAdd).not.toHaveBeenCalled() : expect($ctrl.analyticsFactory.cartAdd).toHaveBeenCalledWith($ctrl.itemConfig, $ctrl.productData)
      })

      it('should submit a gift successfully and omit RECURRING_DAY_OF_MONTH if frequency is single', () => {
        $ctrl.itemConfig['RECURRING_DAY_OF_MONTH'] = '01'
        $ctrl.itemConfigForm.$dirty = true
        $ctrl.productData.frequency = 'NA'
        $ctrl.saveGiftToCart()

        expect($ctrl.submittingGift).toEqual(false)
        expect($ctrl.cartService[operation]).toHaveBeenCalledWith(...operationArgs)
        expect($ctrl.$scope.$emit).toHaveBeenCalledWith(cartEvent)
        expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'submitted' })
        expect($ctrl.errorAlreadyInCart).toEqual(false)
        expect($ctrl.errorSavingGeneric).toEqual(false)
      })

      it('should handle an error submitting a gift', () => {
        $ctrl.cartService[operation].mockReturnValue(Observable.throw('some error'))
        $ctrl.itemConfigForm.$dirty = true
        $ctrl.saveGiftToCart()

        expect($ctrl.submittingGift).toEqual(false)
        expect($ctrl.cartService[operation]).toHaveBeenCalledWith(...operationArgs)
        expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'errorSubmitting' })
        expect($ctrl.errorAlreadyInCart).toEqual(false)
        expect($ctrl.errorSavingGeneric).toEqual(true)
        expect($ctrl.$log.error.logs[0]).toEqual(['Error adding or updating item in cart', 'some error'])
      })

      it('should handle an error when saving a duplicate item', () => {
        $ctrl.cartService[operation].mockReturnValue(Observable.throw({ data: 'Recurring gift to designation: 0671540 on draw day: 14 is already in the cart' }))
        $ctrl.itemConfigForm.$dirty = true
        $ctrl.saveGiftToCart()

        expect($ctrl.submittingGift).toEqual(false)
        expect($ctrl.cartService[operation]).toHaveBeenCalledWith(...operationArgs)
        expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'errorAlreadyInCart' })
        expect($ctrl.errorAlreadyInCart).toEqual(true)
        expect($ctrl.errorSavingGeneric).toEqual(false)
      })

      it('should handle an error when saving a bad decimal amount - old error style', () => {
        const error = { data: 'Amount must be a valid decimal number without dollar signs or commas.' }
        $ctrl.cartService[operation].mockReturnValue(Observable.throw(error))
        $ctrl.itemConfigForm.$dirty = true
        $ctrl.saveGiftToCart()

        expect($ctrl.submittingGift).toEqual(false)
        expect($ctrl.cartService[operation]).toHaveBeenCalledWith(...operationArgs)
        expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'errorSubmitting' })
        expect($ctrl.errorAlreadyInCart).toEqual(false)
        expect($ctrl.errorSavingGeneric).toEqual(false)
        expect($ctrl.amountFormatError).toEqual = error.data
      })

      it('should handle an error when saving a bad decimal amount - new error style', () => {
        const error = {
          data: {
            messages: [{
              id: 'field.invalid.decimal.format',
              'debug-message': 'Amount must be a valid decimal number without dollar signs or commas.'
            }]
          }
        }
        $ctrl.cartService[operation].mockReturnValue(Observable.throw(error))
        $ctrl.itemConfigForm.$dirty = true
        $ctrl.saveGiftToCart()

        expect($ctrl.submittingGift).toEqual(false)
        expect($ctrl.cartService[operation]).toHaveBeenCalledWith(...operationArgs)
        expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'errorSubmitting' })
        expect($ctrl.errorAlreadyInCart).toEqual(false)
        expect($ctrl.errorSavingGeneric).toEqual(false)
        expect($ctrl.amountFormatError).toEqual = error.data.messages[0]['debug-message']
      })

      it('should clear the cover fee decision when editing the amount of an item in the cart', () => {
        if (isEdit) {
          jest.spyOn($ctrl.orderService, 'clearCoverFees')

          $ctrl.amountChanged = true
          $ctrl.saveGiftToCart()
          expect($ctrl.orderService.clearCoverFees).toHaveBeenCalled()
        } else {
          $ctrl.saveGiftToCart()
        }
      })

      it('should not clear the cover fee decision when editing something other than the amount of an item in the cart', () => {
        if (isEdit) {
          jest.spyOn($ctrl.orderService, 'clearCoverFees')

          $ctrl.amountChanged = false
          $ctrl.saveGiftToCart()
          expect($ctrl.orderService.clearCoverFees).not.toHaveBeenCalled()
        } else {
          $ctrl.saveGiftToCart()
        }
      })
    }
  })

  describe('displayId()', () => {
    it('should return an empty string when productData isn\'t defined', () => {
      expect($ctrl.displayId()).toEqual('')
    })

    it('shows designationNumber when jcr:title is the same', () => {
      $ctrl.productData = { displayName: 'Title', designationNumber: '0123456' }
      $ctrl.itemConfig = { 'jcr-title': 'Title' }

      expect($ctrl.displayId()).toEqual('#0123456')
    })

    it('includes productData when jcr:title is different', () => {
      $ctrl.productData = { displayName: 'Title', designationNumber: '0123456' }
      $ctrl.itemConfig = { 'jcr-title': 'Special Title', 'campaign-page': '9876' }

      expect($ctrl.displayId()).toEqual('#0123456 - Title')
    })
  })

  describe('suggestedAmount( amount )', () => {
    it('should format suggestedAmounts correctly.', () => {
      expect($ctrl.suggestedAmount(123.45)).toEqual('$123.45')
      expect($ctrl.suggestedAmount(12345.67)).toEqual('$12,345.67')
      expect($ctrl.suggestedAmount(123.4)).toEqual('$123.40')
      expect($ctrl.suggestedAmount(123)).toEqual('$123')
      expect($ctrl.suggestedAmount(1234)).toEqual('$1,234')
    })
  })

  describe('giveLink( url )', () => {
    beforeEach(() => {
      $ctrl.showGivingLinks = true
    })
    it('should proceed to product config', () => {
      $ctrl.giveLink()
      expect($ctrl.showGivingLinks).toEqual(false)
      expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'unsubmitted' })
    })
    it('should navigate to other giving link', () => {
      $ctrl.giveLink('https://example.com')
      expect($ctrl.$window.location).toEqual('https://example.com')
    })
  })


  describe('shouldShowForcedUserToLogoutError', () => {
    it('should call $window.sessionStorage', () => {
      $ctrl.$onInit()
      expect($ctrl.$window.sessionStorage.getItem).toHaveBeenCalledWith(forcedUserToLogout)
      expect($ctrl.errorForcedUserToLogout).toEqual(false)
    })

    it('should set errorForcedUserToLogout to true', () => {
      $ctrl.$window.sessionStorage.getItem.mockReturnValue('true')
      $ctrl.$onInit()
      expect($ctrl.$window.sessionStorage.getItem).toHaveBeenCalledWith(forcedUserToLogout)
      expect($ctrl.errorForcedUserToLogout).toEqual(true)
    })
  })
})

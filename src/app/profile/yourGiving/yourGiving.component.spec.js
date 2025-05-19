import angular from 'angular'
import 'angular-mocks'
import keys from 'lodash/keys'
import module, { queryParams } from './yourGiving.component'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'
import { Roles, SignOutEvent } from 'common/services/session/session.service'
/* global inject */

describe('your giving', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl

  beforeEach(inject((_$componentController_) => {
    $ctrl = _$componentController_(module.name, {
      $window: { location: '/your-giving.html' }
    })
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
    expect($ctrl.$window).toBeDefined()
    expect($ctrl.$location).toBeDefined()
    expect($ctrl.$rootScope).toBeDefined()
    expect($ctrl.sessionEnforcerService).toBeDefined()
    expect($ctrl.profileService).toBeDefined()
  })

  describe('$onInit()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'loadProfile').mockImplementation(() => {})
      jest.spyOn($ctrl, 'sessionEnforcerService').mockImplementation(() => {})
      jest.spyOn($ctrl, 'setGivingView').mockImplementation(() => {})
      jest.spyOn($ctrl.$rootScope, '$on').mockImplementation(() => {})
      jest.spyOn($ctrl, 'signedOut').mockImplementation(() => {})
    })

    describe('\'PUBLIC\' role', () => {
      it('sets profileLoading and registers sessionEnforcer', () => {
        $ctrl.$onInit()

        expect($ctrl.sessionEnforcerService).toHaveBeenCalledWith(
          [Roles.registered], expect.objectContaining({
            'sign-in': expect.any(Function),
            cancel: expect.any(Function)
          }), 'donor'
        )

        expect($ctrl.setGivingView).not.toHaveBeenCalled()
        expect($ctrl.profileLoading).toEqual(true)
        expect($ctrl.loadProfile).not.toHaveBeenCalled()
        expect($ctrl.$rootScope.$on).toHaveBeenCalledWith(SignOutEvent, expect.any(Function))
        $ctrl.$rootScope.$on.mock.calls[0][1]()

        expect($ctrl.signedOut).toHaveBeenCalled()
      })
    })

    describe('\'REGISTERED\' role', () => {
      it('calls loadProfile and registers sessionEnforcer', () => {
        $ctrl.$onInit()

        expect($ctrl.sessionEnforcerService).toHaveBeenCalledWith(
          [Roles.registered], expect.objectContaining({
            'sign-in': expect.any(Function),
            cancel: expect.any(Function)
          }), 'donor'
        )

        expect($ctrl.loadProfile).not.toHaveBeenCalled()
        expect($ctrl.$rootScope.$on).toHaveBeenCalledWith(SignOutEvent, expect.any(Function))
        $ctrl.$rootScope.$on.mock.calls[0][1]()

        expect($ctrl.signedOut).toHaveBeenCalled()
      })
    })

    describe('sessionEnforcerService success', () => {
      it('executes success callback', () => {
        expect($ctrl.loadProfile).not.toHaveBeenCalled()

        $ctrl.$onInit()
        $ctrl.sessionEnforcerService.mock.calls[0][1]['sign-in']()

        expect($ctrl.loadProfile).toHaveBeenCalledTimes(1)
        expect($ctrl.setGivingView).toHaveBeenCalled()
      })
    })

    describe('sessionEnforcerService failure', () => {
      it('executes failure callback', () => {
        $ctrl.$onInit()
        $ctrl.sessionEnforcerService.mock.calls[0][1]['cancel']()

        expect($ctrl.$window.location).toEqual('/')
      })
    })
  })

  describe('$onDestroy()', () => {
    it('cleans up the component', () => {
      jest.spyOn($ctrl.sessionEnforcerService, 'cancel').mockImplementation(() => {})
      jest.spyOn($ctrl.$location, 'search').mockImplementation(() => {})

      $ctrl.enforcerId = '1234567890'
      $ctrl.$onDestroy()

      expect($ctrl.sessionEnforcerService.cancel).toHaveBeenCalledWith('1234567890')
      expect($ctrl.$location.search).toHaveBeenCalledTimes(keys(queryParams).length)
    });
  })

  describe('loadProfile()', () => {
    beforeEach(() => {
      $ctrl.profileLoading = true
    })

    it('successfully loads profile', () => {
      jest.spyOn($ctrl.profileService, 'getGivingProfile').mockReturnValue(Observable.of({ a: 'b' }))

      $ctrl.loadProfile()

      expect($ctrl.profile).toEqual({ a: 'b' })
      expect($ctrl.profileLoading).toEqual(false)
      expect($ctrl.currentDate).toEqual(expect.any(Date))
      expect($ctrl.profileLoadingError).toEqual(false)
    })

    it('should log an error on failure', () => {
      jest.spyOn($ctrl.profileService, 'getGivingProfile').mockReturnValue(Observable.throw('some error'))
      $ctrl.loadProfile()

      expect($ctrl.$log.error.logs[0]).toEqual(['Error loading givingProfile', 'some error'])
      expect($ctrl.profileLoadingError).toEqual(true)
    })
  });

  describe('setGivingView( name )', () => {
    it('sets view based on url query param', () => {
      jest.spyOn($ctrl.$location, 'search').mockReturnValue({ [queryParams.view]: 'historical' })

      $ctrl.setGivingView()

      expect($ctrl.$location.search).toHaveBeenCalled()
      expect($ctrl.view).toEqual('historical')
      expect($ctrl.$location.search).toHaveBeenCalledWith(queryParams.view, 'historical')
    });

    it('sets view to \'recipient\' if name missing', () => {
      jest.spyOn($ctrl.$location, 'search').mockReturnValue({})

      $ctrl.setGivingView()

      expect($ctrl.$location.search).toHaveBeenCalled()
      expect($ctrl.view).toEqual('recipient')
      expect($ctrl.$location.search).toHaveBeenCalledWith(queryParams.view, 'recipient')
    });

    it('sets view', () => {
      jest.spyOn($ctrl.$location, 'search').mockReturnValue({})

      $ctrl.setGivingView('historical')

      expect($ctrl.view).toEqual('historical')
      expect($ctrl.$location.search).toHaveBeenCalledWith(queryParams.view, 'historical')
    });
  })

  describe('setViewLoading( loading )', () => {
    it('sets viewLoading to true', () => {
      $ctrl.reload = false
      $ctrl.setViewLoading(true)

      expect($ctrl.viewLoading).toEqual(true)
      expect($ctrl.reload).toEqual(false)
    })

    it('sets viewLoading and reload to false when finished loading', () => {
      $ctrl.reload = true
      $ctrl.setViewLoading(false)

      expect($ctrl.viewLoading).toEqual(false)
      expect($ctrl.reload).toEqual(false)
    });
  })

  describe('openEditRecurringGiftsModal', () => {
    it('should open the modal', () => {
      const thenSpy = jest.fn()
      jest.spyOn($ctrl.$uibModal, 'open').mockReturnValue({ result: { then: thenSpy } })
      $ctrl.openEditRecurringGiftsModal()

      expect($ctrl.$uibModal.open).toHaveBeenCalledWith(expect.objectContaining({ component: 'editRecurringGiftsModal' }))
      expect($ctrl.recurringGiftsUpdateSuccess).toEqual(false)
      thenSpy.mock.calls[0][0]()

      expect($ctrl.recurringGiftsUpdateSuccess).toEqual(true)
      expect($ctrl.reload).toEqual(true)
    });

    it('should call analytics event on dismiss', () => {
      const thenSpy = jest.fn()
      jest.spyOn($ctrl.$uibModal, 'open').mockReturnValue({ result: { then: thenSpy } })
      jest.spyOn($ctrl.analyticsFactory, 'track').mockReturnValue(null)
      $ctrl.openEditRecurringGiftsModal()
      thenSpy.mock.calls[0][1]()

      expect($ctrl.analyticsFactory.track).toHaveBeenCalledWith('ga-edit-recurring-exit')
    });
  })

  describe('openGiveOneTimeGiftModal', () => {
    it('should open the modal', () => {
      const thenSpy = jest.fn()
      jest.spyOn($ctrl.$uibModal, 'open').mockReturnValue({ result: { then: thenSpy } })
      $ctrl.openGiveOneTimeGiftModal()

      expect($ctrl.$uibModal.open).toHaveBeenCalledWith(expect.objectContaining({ component: 'giveOneTimeGiftModal' }))
    });

  })

  describe('openStopStartRecurringGiftsModal', () => {
    it('should open the modal', () => {
      const thenSpy = jest.fn()
      jest.spyOn($ctrl.$uibModal, 'open').mockReturnValue({ result: { then: thenSpy } })
      $ctrl.openStopStartRecurringGiftsModal()

      expect($ctrl.$uibModal.open).toHaveBeenCalledWith(expect.objectContaining({ component: 'stopStartRecurringGiftsModal' }))
      expect($ctrl.stopStartGiftsSuccess).toEqual(false)
      thenSpy.mock.calls[0][0]()

      expect($ctrl.stopStartGiftsSuccess).toEqual(true)
      expect($ctrl.reload).toEqual(true)
    });
  })

  describe('signedOut( event )', () => {
    describe('default prevented', () => {
      it('does nothing', () => {
        $ctrl.signedOut({ defaultPrevented: true })

        expect($ctrl.$window.location).toEqual('/your-giving.html')
      });
    })

    describe('default not prevented', () => {
      it('navigates to \'\/\'', () => {
        const spy = jest.fn()
        $ctrl.signedOut({ defaultPrevented: false, preventDefault: spy })

        expect(spy).toHaveBeenCalled()
        expect($ctrl.$window.location).toEqual('/')
      });
    })
  });
})

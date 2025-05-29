import angular from 'angular'
import 'angular-mocks'
import module from './accountBenefits.component'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/throw'
import { Roles } from 'common/services/session/session.service'

describe('thank you', function () {
  describe('accountBenefits', function () {
    beforeEach(angular.mock.module(module.name))
    let $ctrl
    const lastPurchaseId = 'iiydanbt='

    beforeEach(inject(function ($componentController) {
      $ctrl = $componentController(module.name)
      jest.spyOn($ctrl.orderService, 'retrieveLastPurchaseLink').mockReturnValue(`/purchases/crugive/${lastPurchaseId}`)
    }))

    it('should be defined', () => {
      expect($ctrl).toBeDefined()
      expect($ctrl.sessionModalService).toBeDefined()
      expect($ctrl.sessionService).toBeDefined()
      expect($ctrl.orderService).toBeDefined()
      expect($ctrl.isVisible).toEqual(false)
    })

    describe('$onInit', () => {
      it('should remove the Okta Redirect Indicator', () => {
        jest.spyOn($ctrl.sessionService, 'removeOktaRedirectIndicator')
        expect($ctrl.sessionService.removeOktaRedirectIndicator).not.toHaveBeenCalled()
        $ctrl.$onInit()
        expect($ctrl.sessionService.removeOktaRedirectIndicator).toHaveBeenCalled()
      });
    });

    describe('$onChanges', () => {
      beforeEach(() => {
        jest.spyOn($ctrl, 'openModal').mockImplementation(() => {})
      })

      it('is visible when registration-state is \'MATCHED\'', () => {
        $ctrl.$onChanges({ donorDetails: { currentValue: { 'registration-state': 'MATCHED' } } })

        expect($ctrl.isVisible).toEqual(true)
        expect($ctrl.openModal).toHaveBeenCalled()
      })

      it('is not visible when registration-state is \'COMPLETED\'', () => {
        $ctrl.$onChanges({ donorDetails: { currentValue: { 'registration-state': 'COMPLETED' } } })

        expect($ctrl.isVisible).toEqual(false)
        expect($ctrl.openModal).not.toHaveBeenCalled()
      })
    })

    describe('openModal', () => {
      let deferred, $rootScope, userMatch
      beforeEach(inject((_$q_, _$rootScope_) => {
        deferred = _$q_.defer()
        userMatch = _$q_.defer()
        $rootScope = _$rootScope_
        jest.spyOn($ctrl.sessionModalService, 'accountBenefits').mockReturnValue(deferred.promise)
        jest.spyOn($ctrl.sessionModalService, 'registerAccount').mockReturnValue(deferred.promise)
        jest.spyOn($ctrl.sessionModalService, 'userMatch').mockReturnValue(deferred.promise)
        jest.spyOn($ctrl.sessionService, 'oktaIsUserAuthenticated').mockReturnValue(Observable.from([false]))
        $ctrl.isVisible = true
      }))

      it('shows userMatch modal to users who are authenticated but need to complete donor matching', (done) => {
        $ctrl.sessionService.oktaIsUserAuthenticated.mockReturnValue(Observable.from([true]))
        $ctrl.donorDetails = { 'registration-state': 'MATCHED' }
        $ctrl.openModal()

        expect($ctrl.sessionModalService.userMatch).toHaveBeenCalledWith(lastPurchaseId)
        deferred.resolve()
        $rootScope.$digest()
        expect($ctrl.isVisible).toEqual(false)
        done()
      })

      it('shows registerAccount modal to users who are authenticated but need to register for a donor account', () => {
        $ctrl.sessionService.oktaIsUserAuthenticated.mockReturnValue(Observable.from([true]))
        $ctrl.donorDetails = { 'registration-state': 'NEW' }
        $ctrl.openModal()

        expect($ctrl.sessionModalService.registerAccount).toHaveBeenCalledWith({ lastPurchaseId })
        deferred.resolve()
        $rootScope.$digest()
        expect($ctrl.isVisible).toEqual(false)
      })

      it('shows registerAccount modal to users who aren\'t authenticated', () => {
        $ctrl.sessionService.oktaIsUserAuthenticated.mockReturnValue(Observable.from([false]))
        $ctrl.donorDetails = { 'registration-state': 'NEW' }
        $ctrl.openModal()

        expect($ctrl.sessionModalService.registerAccount).toHaveBeenCalledWith({ lastPurchaseId, signUp: true })
        deferred.resolve()
        $rootScope.$digest()

        expect($ctrl.isVisible).toEqual(false)
      })

      it('shows accountBenefits modal to users who aren\'t authenticated when defaultToAccountBenefits is true', () => {
        $ctrl.sessionService.oktaIsUserAuthenticated.mockReturnValue(Observable.from([false]))
        $ctrl.donorDetails = { 'registration-state': 'NEW' }
        $ctrl.openModal(true)

        expect($ctrl.sessionModalService.accountBenefits).toHaveBeenCalledWith(lastPurchaseId)
        deferred.resolve()
        $rootScope.$digest()

        expect($ctrl.isVisible).toEqual(false)
      })

      it('should not show accountBenefits modal if purchase link is missing', () => {
        $ctrl.orderService.retrieveLastPurchaseLink.mockReturnValue(undefined)
        $ctrl.donorDetails = { 'registration-state': 'NEW' }
        $ctrl.openModal()

        expect($ctrl.sessionModalService.accountBenefits).not.toHaveBeenCalled()
      })

      it('should log an error', () => {
        const error = 'Unknown error'
        $ctrl.sessionService.oktaIsUserAuthenticated.mockReturnValue(Observable.throw(error))
        $ctrl.openModal()

        expect($ctrl.$log.error.logs[0]).toEqual(['Failed checking if user is authenticated', error])
      })
    })

    describe('getLastPurchaseId', () => {
      it('should get the id from the last purchase link', () => {
        expect($ctrl.getLastPurchaseId()).toEqual(lastPurchaseId)
      })

      it('should return undefined when there is no last purchase link', () => {
        $ctrl.orderService.retrieveLastPurchaseLink.mockReturnValue(undefined)

        expect($ctrl.getLastPurchaseId()).toEqual(undefined)
      })
    })
  })
})

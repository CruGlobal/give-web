import angular from 'angular'
import 'angular-mocks'
import module from './accountBenefits.component'

import { Roles } from 'common/services/session/session.service'

describe('thank you', function () {
  describe('accountBenefits', function () {
    beforeEach(angular.mock.module(module.name))
    let $ctrl

    beforeEach(inject(function ($componentController) {
      $ctrl = $componentController(module.name)
      jest.spyOn($ctrl.orderService, 'retrieveLastPurchaseLink').mockReturnValue('/purchases/crugive/iiydanbt=')
    }))

    it('should be defined', () => {
      expect($ctrl).toBeDefined()
      expect($ctrl.sessionModalService).toBeDefined()
      expect($ctrl.sessionService).toBeDefined()
      expect($ctrl.orderService).toBeDefined()
      expect($ctrl.isVisible).toEqual(false)
    })

    describe('$onChanges', () => {
      beforeEach(() => {
        jest.spyOn($ctrl, 'openAccountBenefitsModal').mockImplementation(() => {})
      })

      it('is visible when registration-state is \'MATCHED\'', () => {
        $ctrl.$onChanges({ donorDetails: { currentValue: { 'registration-state': 'MATCHED' } } })

        expect($ctrl.isVisible).toEqual(true)
        expect($ctrl.openAccountBenefitsModal).toHaveBeenCalled()
      })

      it('is not visible when registration-state is \'COMPLETED\'', () => {
        $ctrl.$onChanges({ donorDetails: { currentValue: { 'registration-state': 'COMPLETED' } } })

        expect($ctrl.isVisible).toEqual(false)
        expect($ctrl.openAccountBenefitsModal).not.toHaveBeenCalled()
      })
    })

    describe('openAccountBenefitsModal', () => {
      let deferred, $rootScope, userMatch
      beforeEach(inject((_$q_, _$rootScope_) => {
        deferred = _$q_.defer()
        userMatch = _$q_.defer()
        $rootScope = _$rootScope_
        jest.spyOn($ctrl.sessionModalService, 'accountBenefits').mockReturnValue(deferred.promise)
        $ctrl.isVisible = true
      }))

      it('should show accountBenefits modal to users who have not completed donor matching', () => {
        $ctrl.donorDetails = { 'registration-state': 'MATCHED' }
        $ctrl.openAccountBenefitsModal()

        expect($ctrl.sessionModalService.accountBenefits).toHaveBeenCalledWith('iiydanbt=')
        deferred.resolve()
        $rootScope.$digest()

        expect($ctrl.isVisible).toEqual(false)
      })

      it('should not show accountBenefits modal to users who have completed donor matching', () => {
        $ctrl.donorDetails = { 'registration-state': 'COMPLETED' }
        $ctrl.openAccountBenefitsModal()

        expect($ctrl.sessionModalService.accountBenefits).not.toHaveBeenCalled()
      })

      it('should not show accountBenefits modal if purchase link is missing', () => {
        $ctrl.orderService.retrieveLastPurchaseLink.mockReturnValue(undefined)
        $ctrl.openAccountBenefitsModal()

        expect($ctrl.sessionModalService.accountBenefits).not.toHaveBeenCalled()
      })
    })

    describe('doUserMatch()', () => {
      let deferred, $rootScope
        beforeEach(inject((_$q_, _$rootScope_) => {
          deferred = _$q_.defer()
          $rootScope = _$rootScope_
          jest.spyOn($ctrl.sessionModalService, 'registerAccount').mockReturnValue(deferred.promise)
          $ctrl.isVisible = true
        }))

      it('shows registerAccount modal if role is \'REGISTERED\'', () => {
        jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue(Roles.registered)
        $ctrl.doUserMatch()
        expect($ctrl.sessionModalService.registerAccount).toHaveBeenCalled()
      })

      describe('\'PUBLIC\' role', () => {
        it('shows sign in modal, followed by registerAccount', () => {
          $ctrl.doUserMatch()

          expect($ctrl.sessionModalService.registerAccount).toHaveBeenCalled()
          deferred.resolve()
          $rootScope.$digest()

          expect($ctrl.isVisible).toEqual(false)
        })
      })
    })

    describe('getLastPurchaseId', () => {
      it('should get the id from the last purchase link', () => {
        expect($ctrl.getLastPurchaseId()).toEqual('iiydanbt=')
      })

      it('should return undefined when there is no last purchase link', () => {
        $ctrl.orderService.retrieveLastPurchaseLink.mockReturnValue(undefined)

        expect($ctrl.getLastPurchaseId()).toEqual(undefined)
      })
    })
  })
})

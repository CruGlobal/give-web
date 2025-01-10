import angular from 'angular'
import 'angular-mocks'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/of'
import module from './signUpModal.component'
import { Sessions } from 'common/services/session/session.service'
import { cortexRole } from 'common/services/session/fixtures/cortex-role'
import { giveSession } from 'common/services/session/fixtures/give-session'
import { cruProfile } from 'common/services/session/fixtures/cru-profile'

describe('signUpForm', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl, bindings, $rootScope

  beforeEach(inject(function (_$rootScope_,  _$componentController_) {
    $rootScope = _$rootScope_
    bindings = {
      onStateChange: jest.fn(),
      onSuccess: jest.fn(),
      signUpForm: {
        $valid: false,
        $setSubmitted: jest.fn()
      },
      onSubmit: jest.fn()
    }
    const scope = { $apply: jest.fn() }
    scope.$apply.mockImplementation(() => {})
    $ctrl = _$componentController_(module.name, { $scope: scope }, bindings)
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })

  describe('$onInit()', () => {
    describe('with \'REGISTERED\' cortex-session', () => {
      let $cookies
      beforeEach(inject(function (_$cookies_) {
        $cookies = _$cookies_
        $cookies.put(Sessions.role, cortexRole.registered)
        $cookies.put(Sessions.give, giveSession)
        $cookies.put(Sessions.profile, cruProfile)
        $rootScope.$digest()
      }))

      afterEach(() => {
        [Sessions.role, Sessions.give, Sessions.profile].forEach((name) => {
          $cookies.remove(name)
        })
      })

      it('Redirects user to sign in modal', () => {
        jest.spyOn($ctrl, 'onStateChange')
        $ctrl.$onInit()

        expect($ctrl.onStateChange).toHaveBeenCalled()
      })
    })

    it('Loads user cart details', () => {
      $ctrl.isInsideAnotherModal = false
      jest.spyOn($ctrl.cartService, 'getTotalQuantity').mockImplementation(() => Observable.from([5]))
 
      $ctrl.$onInit()

      expect($ctrl.cartCount).toEqual(5)
    })

    it('should default to 0 items in cart if error fetching cart details', () => {
      $ctrl.isInsideAnotherModal = false
      jest.spyOn($ctrl.cartService, 'getTotalQuantity').mockReturnValue(Observable.throw({status: 404}))
      $ctrl.$onInit()
      expect($ctrl.cartCount).toEqual(0)
    })
  })

  describe('loadDonorDetails()', () => {
    const signUpFormData = {
      name: {
        ['given-name']: 'givenName',
        ['family-name']: 'familyName',
      },
      email: 'email@cru.org',
    };
    
    it('Inherits data from orderService', (done) => {
      jest.spyOn($ctrl.orderService, 'getDonorDetails').mockImplementation(() => Observable.from(
        [signUpFormData]
      ))
      $ctrl.loadDonorDetails().subscribe((data) => {
        expect(data).toEqual(signUpFormData)
        done()
      })
    })

    it('grabs data from orderService if data from both orderService and sessionService are set', (done) => {
      jest.spyOn($ctrl, 'loadDonorDetails')
      jest.spyOn($ctrl.orderService, 'getDonorDetails').mockImplementation(() => Observable.from(
        [signUpFormData]
      ))
      $ctrl.sessionService.session.checkoutSavedData = {
        ...signUpFormData,
        email: 'emailFromCheckoutSavedData@cru.org'
      };

      $ctrl.loadDonorDetails().subscribe((data) => {
        expect(data).toEqual({
          ...signUpFormData,
        email: 'emailFromCheckoutSavedData@cru.org'
        })
        done()
      })
    })

    it('should set loadingDonorDetails to false', (done) => {
      jest.spyOn($ctrl.orderService, 'getDonorDetails').mockReturnValue(Observable.throw({status: 404}))
      $ctrl.loadingDonorDetails = true
      $ctrl.loadDonorDetails().subscribe({
        error: () => {
          expect($ctrl.loadingDonorDetails).toEqual(false)
          done()
        }
      })
    })
  })
})

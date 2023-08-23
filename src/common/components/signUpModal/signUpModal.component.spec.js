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
        $ctrl.session = {
          email: 'test@cru.org',
        }

        $ctrl.$onInit()

        expect($ctrl.onStateChange).toHaveBeenCalled()
      })
    })

    it('initializes the component, inherits data from orderService', () => {
      jest.spyOn($ctrl, 'loadDonorDetails')
      jest.spyOn($ctrl.orderService, 'getDonorDetails').mockImplementation(() => Observable.from(
        [
          {
            name: {
              ['given-name']: 'givenName',
              ['family-name']: 'familyName',
            },
            email: 'EMAIL@cru.org',
          }
        ]
      ))
      $ctrl.sessionService.session = {
        first_name: undefined,
        last_name: undefined,
        email: undefined,
      }

      $ctrl.$onInit()

      expect($ctrl.isLoading).toEqual(true)
      expect($ctrl.submitting).toEqual(false)
      expect($ctrl.loadDonorDetails).toHaveBeenCalled()
      expect($ctrl.orderService.getDonorDetails).toHaveBeenCalled()
      expect($ctrl.donorDetails.name['given-name']).toEqual('givenName')
      expect($ctrl.donorDetails.name['family-name']).toEqual('familyName')
      expect($ctrl.donorDetails.email).toEqual('EMAIL@cru.org')
    })

    it('initializes the component, inherits data from sessionService', () => {
      jest.spyOn($ctrl.orderService, 'getDonorDetails').mockImplementation(() => Observable.from(
        [
          {
            name: {
              ['given-name']: undefined,
              ['family-name']: undefined,
            },
            email: undefined,
          }
        ]
      ))
      $ctrl.sessionService.session = {
        first_name: 'newFirstName',
        last_name: 'newLastName',
        email: 'testing@cru.org',
      }
      $ctrl.$onInit()
      expect($ctrl.donorDetails.name['given-name']).toEqual('newFirstName')
      expect($ctrl.donorDetails.name['family-name']).toEqual('newLastName')
      expect($ctrl.donorDetails.email).toEqual('testing@cru.org')
    })

    it('initializes the component, inherits no data', () => {
      jest.spyOn($ctrl.orderService, 'getDonorDetails').mockImplementation(() => Observable.from(
        [
          {
            name: {
              ['given-name']: undefined,
              ['family-name']: undefined,
            },
            email: undefined,
          }
        ]
      ))
      $ctrl.sessionService.session = {
        first_name: undefined,
        last_name: undefined,
        email: undefined,
      }
      $ctrl.$onInit()
      expect($ctrl.donorDetails.name['given-name']).toEqual(undefined)
      expect($ctrl.donorDetails.name['family-name']).toEqual(undefined)
      expect($ctrl.donorDetails.email).toEqual(undefined)
    })

    it('Loads user cart details', () => {
      $ctrl.isInsideAnotherModal = false
      jest.spyOn($ctrl.cartService, 'getTotalQuantity').mockImplementation(() => Observable.from([5]))
 
      $ctrl.$onInit()

      expect($ctrl.cartCount).toEqual(5)
    })
  })

  describe('submitDetails()', () => {
    it('should return as form is not valid', () => {
      $ctrl.submitDetails()
      expect($ctrl.signUpForm.$setSubmitted).toHaveBeenCalled()
      expect($ctrl.submitting).toEqual(false)   
    })

    it("should call createAccount() with the user's data", () => {
      const data = {
        name: {
          ['given-name']: 'givenName',
          ['family-name']: 'familyName',
        },
        email: 'EMAIL@cru.org',
      };
      jest.spyOn($ctrl.orderService, 'getDonorDetails').mockImplementation(() => Observable.from(
        [data]
      ))
      jest.spyOn($ctrl.sessionService, 'createAccount').mockImplementation(() => Promise.resolve({
        status: 'error',
        data: ['Error one', 'Error 2']
      }))
      $ctrl.$onInit()
      $ctrl.signUpForm.$valid = true
      $ctrl.submitDetails()
      expect($ctrl.sessionService.createAccount).toHaveBeenCalledWith(data.email, data.name['given-name'], data.name['family-name'])    
    })

    it("should call createAccount() with the user's data", () => {
      jest.spyOn($ctrl, 'onStateChange')
      const data = {
        name: {
          ['given-name']: 'givenName',
          ['family-name']: 'familyName',
        },
        email: 'EMAIL@cru.org',
      };
      jest.spyOn($ctrl.orderService, 'getDonorDetails').mockImplementation(() => Observable.from(
        [data]
      ))
      jest.spyOn($ctrl.sessionService, 'createAccount').mockImplementation(() => Promise.resolve({
        status: 'success',
        data: 'yay'
      }))
      $ctrl.$onInit()
      $ctrl.signUpForm.$valid = true
      $ctrl.submitDetails()

      setTimeout(() => {
        expect($ctrl.sessionService.createAccount).toHaveBeenCalledWith(data.email, data.name['given-name'], data.name['family-name'])    
        expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'sign-up-activation' })
        expect($ctrl.$scope.$apply).toHaveBeenCalled()
      }, 2000)
    })
  })
})

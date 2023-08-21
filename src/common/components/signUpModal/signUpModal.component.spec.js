import angular from 'angular'
import 'angular-mocks'
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/of'
import module from './signUpModal.component'

describe('signUpForm', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl, bindings

  beforeEach(inject(function (_$componentController_) {
    bindings = {
      onStateChange: jest.fn(),
      onSuccess: jest.fn()
    }
    $ctrl = _$componentController_(module.name, {}, bindings)
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })

  describe('$onInit()', () => {
    it('initializes the component', () => {
      $ctrl.$onInit()

      expect($ctrl.modalTitle).toEqual('Sign Up')
      expect($ctrl.isLoading).toEqual(false)
      expect($ctrl.signUpErrors).toEqual({})
      expect($ctrl.hasError).toEqual(false)
    })
  })

  describe('signUp()', () => {
    let deferred
    beforeEach(inject(function (_$q_) {
      deferred = _$q_.defer()
      jest.spyOn($ctrl.sessionService, 'signUp').mockImplementation(() => Observable.from(deferred.promise))
    }))

    describe('invalid form', () => {
      it('does not submit the form', () => {
        $ctrl.signUpForm.$valid = false
        $ctrl.signUp()

        expect($ctrl.sessionService.signUp).not.toHaveBeenCalled()
      })
    })

    describe('valid form', () => {
      beforeEach(() => {
        $ctrl.email = 'professorx@xavier.edu'
        $ctrl.password = 'Cerebro12345678'
        $ctrl.first_name = 'Charles'
        $ctrl.last_name = 'Xavier'
        $ctrl.signUp()
      })

      it('sets isLoading to true and calls sessionService.signUp', () => {
        expect($ctrl.isLoading).toEqual(true)
        expect($ctrl.sessionService.signUp)
          .toHaveBeenCalledWith('professorx@xavier.edu', 'Cerebro12345678', 'Charles', 'Xavier')
      })

      describe('signUp success', () => {
        beforeEach(() => {
          deferred.resolve()
          $rootScope.$digest()
        })

        it('calls onSuccess', () => {
          expect($ctrl.isLoading).toEqual(false)
          expect($ctrl.onSuccess).toHaveBeenCalled()
        })
      })

      describe('signUp failure', () => {
        describe('400 Bad Request', () => {
          it('sets 400 error', () => {
            deferred.reject({ status: 400 })
            $rootScope.$digest()

            expect($ctrl.hasError).toEqual(true)
            expect($ctrl.signUpErrors).toEqual(expect.objectContaining({ 400: true }))
          })

          it('sets invalid password data', () => {
            deferred.reject({
              status: 400,
              data: {
                error: 'invalid_password',
                description: 'Invalid password...'
              }
            })
            $rootScope.$digest()
            expect($ctrl.hasError).toEqual(true)
            expect($ctrl.signUpErrors).toEqual(expect.objectContaining({ invalid_password: true }))
            expect($ctrl.invalidPasswordMessage).toEqual('Invalid password...')
          })
        })

        describe('403 Bad Request', () => {
          it('sets 403 error', () => {
            deferred.reject({ status: 403 })
            $rootScope.$digest()

            expect($ctrl.hasError).toEqual(true)
            expect($ctrl.signUpErrors).toEqual(expect.objectContaining({ 403: true }))
          })
        })

        describe('409 Bad Request', () => {
          it('sets 409 error', () => {
            deferred.reject({ status: 409 })
            $rootScope.$digest()

            expect($ctrl.hasError).toEqual(true)
            expect($ctrl.signUpErrors).toEqual(expect.objectContaining({ 409: true }))
          })
        })

        describe('500 Bad Request', () => {
          it('sets generic error', () => {
            deferred.reject({ status: 500 })
            $rootScope.$digest()

            expect($ctrl.hasError).toEqual(true)
            expect($ctrl.signUpErrors).toEqual(expect.objectContaining({ generic: true }))
          })
        })
      })
    })
  })
})

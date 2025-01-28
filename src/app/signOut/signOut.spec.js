import angular from 'angular'
import 'angular-mocks'
import module from './signOut.component'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'

describe('signOut', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl

  beforeEach(inject(function (_$componentController_) {
    $ctrl = _$componentController_(module.name,
      { $window: { location: { href: '/sign-out.html'} } }
    )
  }))
  
  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })

  describe('$onInit()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl.sessionService, 'getRole')
      jest.spyOn($ctrl, 'redirectToHomepage')
      jest.spyOn($ctrl, 'redirectToLocationPriorToSignOut')
    })

    describe('as \'IDENTIFIED\'', () => {
      it('should redirect to the home page', () => {
        $ctrl.sessionService.getRole.mockReturnValue('IDENTIFIED')
        $ctrl.$onInit()

        expect($ctrl.redirectToHomepage).toHaveBeenCalled()
        expect($ctrl.redirectToLocationPriorToSignOut).not.toHaveBeenCalled()
      })
    })

    describe('as \'REGISTERED\'', () => {
      it('should redirect to the home page', () => {
        $ctrl.sessionService.getRole.mockReturnValue('REGISTERED')
        $ctrl.$onInit()

        expect($ctrl.redirectToHomepage).toHaveBeenCalled()
        expect($ctrl.redirectToLocationPriorToSignOut).not.toHaveBeenCalled()
      })
    })


    describe('as \'GUEST\'', () => {
      it('should run redirectToLocationPriorToSignOut()', () => {
        $ctrl.sessionService.getRole.mockReturnValue('PUBLIC')
        $ctrl.$onInit()

        expect($ctrl.redirectToLocationPriorToSignOut).toHaveBeenCalled()
      })
    })
  })

  it('redirectToHomepage()', function () {
    $ctrl.redirectToHomepage()
    expect($ctrl.$window.location.href).toEqual('/')
  })

  describe('redirectToLocationPriorToSignOut()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'redirectToHomepage')
      jest.spyOn($ctrl.sessionService, 'removeLocationOnLogin')
    })

    it('redirects to prior page if getLocationOnLogin() returns value', () => {
      const priorLocation = 'https://give-stage2.cru.org/search-results.html'
      jest.spyOn($ctrl.sessionService, 'getLocationOnLogin').mockReturnValue(priorLocation)
      $ctrl.showRedirectingLoadingIcon = false
      $ctrl.redirectToLocationPriorToSignOut()
      expect($ctrl.showRedirectingLoadingIcon).toEqual(true)
      expect($ctrl.sessionService.getLocationOnLogin).toHaveBeenCalled()
      expect($ctrl.sessionService.removeLocationOnLogin).toHaveBeenCalled()
      expect($ctrl.$window.location.href).toEqual(priorLocation)
    })

    it('redirects to home page if getLocationOnLogin() returns no value', () => {
      jest.spyOn($ctrl.sessionService, 'getLocationOnLogin').mockReturnValue(undefined)
      $ctrl.showRedirectingLoadingIcon = false
      $ctrl.redirectToLocationPriorToSignOut()
      expect($ctrl.showRedirectingLoadingIcon).toEqual(true)
      expect($ctrl.sessionService.getLocationOnLogin).toHaveBeenCalled()
      expect($ctrl.sessionService.removeLocationOnLogin).not.toHaveBeenCalled()
      expect($ctrl.$window.location.href).toEqual('/')
    })
  })

  describe('closeRedirectingLoading()', () => {
    it('should run redirectToHomepage()', () => {
      jest.spyOn($ctrl, 'redirectToHomepage')
      $ctrl.showRedirectingLoadingIcon = true
      $ctrl.closeRedirectingLoading()
      expect($ctrl.showRedirectingLoadingIcon).toEqual(false)
      expect($ctrl.redirectToHomepage).toHaveBeenCalled()
    })
  })
})

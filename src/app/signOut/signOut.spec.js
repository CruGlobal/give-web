import angular from 'angular'
import 'angular-mocks'
import module from './signOut.component'

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
      jest.spyOn($ctrl.sessionService, 'removeStoredLocation')
    })

    it('redirects to prior page if getStoredLocation() returns value', () => {
      const priorLocation = 'https://give-stage2.cru.org/search-results.html'
      jest.spyOn($ctrl.sessionService, 'getStoredLocation').mockReturnValue(priorLocation)
      $ctrl.redirectToPreviousLocation = false
      $ctrl.redirectToLocationPriorToSignOut()
      expect($ctrl.redirectToPreviousLocation).toEqual(true)
      expect($ctrl.sessionService.getStoredLocation).toHaveBeenCalled()
      expect($ctrl.sessionService.removeStoredLocation).toHaveBeenCalled()
      expect($ctrl.$window.location.href).toEqual(priorLocation)
    })

    it('redirects to home page if getStoredLocation() returns no value', () => {
      jest.spyOn($ctrl.sessionService, 'getStoredLocation').mockReturnValue(undefined)
      $ctrl.redirectToPreviousLocation = false
      $ctrl.redirectToLocationPriorToSignOut()
      expect($ctrl.redirectToPreviousLocation).toEqual(true)
      expect($ctrl.sessionService.getStoredLocation).toHaveBeenCalled()
      expect($ctrl.sessionService.removeStoredLocation).not.toHaveBeenCalled()
      expect($ctrl.$window.location.href).toEqual('/')
    })
  })
})

import angular from 'angular'
import 'angular-mocks'
import module from './main.component'
import { Observable } from 'rxjs/Observable'

describe('main', function () {
  beforeEach(angular.mock.module(module.name))
  var self = {}

  beforeEach(inject(function ($rootScope, $componentController, sessionService) {
    var $scope = $rootScope.$new()

    self.controller = $componentController(module.name, {
      $scope: $scope,
      $window: { location: '/' }
    })

    self.controller.sessionService = sessionService
  }))

  it('to be defined', function () {
    expect(self.controller).toBeDefined()
  })

  describe('signOut', () => {
    it('should call session sign out', () => {
      jest.spyOn(self.controller.sessionService, 'signOut')
      self.controller.signOut()
      expect(self.controller.sessionService.signOut).toHaveBeenCalled()
    })
  })

    })
  })
})

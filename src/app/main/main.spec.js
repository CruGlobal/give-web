import angular from 'angular';
import 'angular-mocks';
import module from './main.component';
import { Observable } from 'rxjs/Observable';

describe('main', function () {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(function (
    $rootScope,
    $componentController,
    sessionService,
  ) {
    var $scope = $rootScope.$new();

    self.controller = $componentController(module.name, {
      $scope: $scope,
      $window: { location: '/' },
    });

    self.controller.sessionService = sessionService;
  }));

  it('to be defined', function () {
    expect(self.controller).toBeDefined();
  });

  describe('signOut', () => {
    it('should call session sign out', () => {
      jest.spyOn(self.controller.sessionService, 'signOut');
      self.controller.signOut();
      expect(self.controller.sessionService.signOut).toHaveBeenCalled();
    });
  });

  describe('signInModal', () => {
    it('should open the registerAccount modal', () => {
      jest
        .spyOn(self.controller.sessionModalService, 'signIn')
        .mockImplementation(() => Observable.of({}));
      self.controller.signInModal();
      expect(self.controller.sessionModalService.signIn).toHaveBeenCalled();
    });
  });

  describe('registerAccountModal', () => {
    it('should open the registerAccount modal', () => {
      jest
        .spyOn(self.controller.sessionModalService, 'registerAccount')
        .mockImplementation(() => Observable.of({}));
      self.controller.registerAccountModal();
      expect(
        self.controller.sessionModalService.registerAccount,
      ).toHaveBeenCalled();
    });
  });
});

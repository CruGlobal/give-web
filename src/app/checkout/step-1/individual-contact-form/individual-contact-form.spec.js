import angular from 'angular';
import 'angular-mocks';
import module from './individual-contact-form.component';

describe('checkout', function() {
  describe('step 1', function() {
    describe('individual contact form', function() {
      beforeEach(angular.mock.module(module.name));
      var self = {};

      beforeEach(inject(function($rootScope, $componentController) {
        var $scope = $rootScope.$new();

        self.controller = $componentController(module.name, {
          $scope: $scope
        });
      }));

      it('to be defined', function() {
        expect(self.controller).toBeDefined();
      });
    });
  });
});

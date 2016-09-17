import angular from 'angular';
import 'angular-mocks';

import module from './accountBenefits.component';

describe('thank you', function() {
  describe('accountBenefits', function() {
    beforeEach(angular.mock.module(module.name));
    var self = {};

    beforeEach(inject(function($componentController) {
      self.controller = $componentController(module.name);
    }));

    it('should be defined', () => {
      expect(self.controller).toBeDefined();
      expect(self.controller.sessionModalService).toBeDefined();
    });
  });
});

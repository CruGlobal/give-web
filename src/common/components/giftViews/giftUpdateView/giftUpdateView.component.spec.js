import angular from 'angular';
import 'angular-mocks';

import module from './giftUpdateView.component';

describe('giftUpdateView', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(($componentController) => {
    self.controller = $componentController(module.name);
  }));

  describe('$onInit', () => {
    it('should have already defined possibleMonths', () => {
      expect(self.controller.possibleMonths.length).toEqual(12);
    });
  });
});

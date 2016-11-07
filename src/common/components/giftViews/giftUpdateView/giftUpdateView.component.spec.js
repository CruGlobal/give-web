import angular from 'angular';
import 'angular-mocks';

import module from './giftUpdateView.component';

fdescribe('giftUpdateView', () => {
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

  describe('onChange', () => {
    it('should validate amount', () => {
      self.controller.gift = {
        amount: 0
      };
      self.controller.onChange();
      expect(self.controller.gift.amount).toEqual(1);
      self.controller.gift.amount = 10000000015;
      self.controller.onChange();
      expect(self.controller.gift.amount).toEqual(10000000);
    });
  });
});

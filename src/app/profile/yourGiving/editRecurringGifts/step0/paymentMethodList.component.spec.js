import angular from 'angular';
import 'angular-mocks';

import module from './paymentMethodList.component';

describe('editRecurringGiftsModal', () => {
  describe('step 0 paymentMethodList', () => {
    beforeEach(angular.mock.module(module.name));
    var self = {};

    beforeEach(inject(($componentController) => {
      self.controller = $componentController(module.name);
    }));

    describe('$onInit', () => {
      it('should select the first payment method by default', () => {
        self.controller.paymentMethods = [
          { 'card-number': 1234 },
          { 'card-number': 5678 },
        ];
        self.controller.$onInit();

        expect(self.controller.selectedPaymentMethod).toEqual({
          'card-number': 1234,
        });
      });
    });
  });
});

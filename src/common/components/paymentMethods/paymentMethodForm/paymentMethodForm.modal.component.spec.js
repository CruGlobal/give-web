import angular from 'angular';
import 'angular-mocks';
import module from './paymentMethodForm.modal.component.js';

describe('paymentMethodFormModal', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(function ($componentController) {
    self.controller = $componentController(
      module.name,
      {},
      {
        resolve: {
          onPaymentFormStateChange: jest.fn(),
        },
        dismiss: jest.fn(),
      },
    );
  }));

  it('should be defined', () => {
    expect(self.controller).toBeDefined();
    expect(self.controller.resolve.onPaymentFormStateChange).toBeDefined();
    expect(self.controller.dismiss).toBeDefined();
  });
});

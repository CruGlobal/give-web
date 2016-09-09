import angular from 'angular';
import 'angular-mocks';
import module from './modal';

describe('App Payment Method', function() {
  beforeEach(angular.mock.module(module.name));
  let self = {},
      uibModalInstance = jasmine.createSpyObj('$uibModalInstance', ['close', 'dismiss']),
      paymentType = 'bankAccount',
      error = false,
      submitted = false;

  beforeEach(inject(function($rootScope, $controller) {

    self.controller = $controller(module.name, {
      $uibModalInstance: uibModalInstance,
      error: error,
      paymentType: paymentType,
      submitted: submitted
    });

  }));

  it('to be defined', () => {
    expect(self.controller).toBeDefined();
  });

  it('should switch payment type',() => {
    self.controller.switchPaymentType('newPaymentType');
    expect(self.controller.paymentType).toBe('newPaymentType');
  });

  it('should perform onSave changes', () => {
    self.controller.onSave(true);
    expect(self.controller.submitted).toBe(false);
    expect(self.controller.error).toBe(false);
    expect(self.controller.$uibModalInstance.close).toHaveBeenCalled();

    self.controller.onSave(false,'Error');
    expect(self.controller.error).toBe('Error');
  });

  it('should set submitted to true', () => {
    self.controller.save();
    expect(self.controller.submitted).toBe(true);
  });

  it('should dismiss the modal', () => {
    self.controller.cancel();
    expect(self.controller.$uibModalInstance.dismiss).toHaveBeenCalled();
  });

});

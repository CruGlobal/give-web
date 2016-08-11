import angular from 'angular';
import 'angular-mocks';
import module from './step-2.component';

describe('checkout', () => {
  describe('step 2', () => {
    beforeEach(angular.mock.module(module.name));
    var self = {};

    beforeEach(inject(function($rootScope, $componentController) {
      var $scope = $rootScope.$new();

      self.controller = $componentController(module.name, {
          $scope: $scope
        },
        {
          changeStep: () => {}
        });
    }));

    describe('changePaymentType', () => {
      it('should set the payment type and set submitted to false', () => {
        self.controller.submitted = true;
        self.controller.changePaymentType('creditCard');
        expect(self.controller.paymentType).toBe('creditCard');
        expect(self.controller.submitted).toBe(false);
        self.controller.submitted = true;
        self.controller.changePaymentType('bankAccount');
        expect(self.controller.paymentType).toBe('bankAccount');
        expect(self.controller.submitted).toBe(false);
      });
    });

    describe('onSave', () => {
      it('should set submitted to false if save was unsuccessful', () => {
        self.controller.submitted = true;
        self.controller.onSave(false);
        expect(self.controller.submitted).toBe(false);
      });
      it('should call changeStep if save was successful', () => {
        spyOn(self.controller, 'changeStep');
        self.controller.onSave(true);
        expect(self.controller.changeStep).toHaveBeenCalledWith({ newStep: 'review' });
      });
    });
  });
});

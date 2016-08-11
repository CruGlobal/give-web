import angular from 'angular';
import 'angular-mocks';
import module from './bank-account.component';


describe('checkout', () => {
  describe('step 2', () => {
    describe('bank account', () => {
      beforeEach(angular.mock.module(module.name));
      var self = {};
      self.submitted = false;

      beforeEach(inject(function($rootScope, $componentController) {
        var $scope = $rootScope.$new();

        self.controller = $componentController(module.name, {
          $scope: $scope
        });
      }));

      describe('$onChanges', () => {
        it('should call savePayment when submitted changes to true', () => {
          spyOn(self.controller, 'savePayment');
          self.controller.$onChanges({
            submitted: {
              currentValue: true
            }
          });
          expect(self.controller.savePayment).toHaveBeenCalled();
        });
      });

      describe('waitForFormInitialization', () => {
        it('should call addCustomValidators when the form is initialized', () => {
          spyOn(self.controller, 'addCustomValidators');
          self.controller.waitForFormInitialization();
          self.controller.bankPaymentForm = {};
          self.controller.$scope.$apply();
          expect(self.controller.addCustomValidators).toHaveBeenCalled();
        });
      });
    });
  });
});

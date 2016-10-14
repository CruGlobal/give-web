import angular from 'angular';
import 'angular-mocks';
import module from './paymentMethodForm.modal.component.js';

describe('paymentMethodFormModal', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(function($componentController) {
    self.controller = $componentController(module.name, {},
      {
        resolve: {
          onSubmit: jasmine.createSpy('onSubmit')
        },
        dismiss: jasmine.createSpy('dismiss')
      });
  }));

  describe('onSubmit', () => {
    it('should pass the onSubmit notification to the onSubmit function the parent component gave it through resolve', () => {
      self.controller.submitted = true;
      self.controller.onSubmit(true, 'some data');
      expect(self.controller.submitted).toEqual(false);
      expect(self.controller.resolve.onSubmit).toHaveBeenCalledWith({success: true, data: 'some data'});
    });
  });
});

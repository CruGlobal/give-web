import angular from 'angular';
import 'angular-mocks';

import module from './registerAccountModal.component';

describe('registerAccountModal', function() {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(function($componentController) {
    self.controller = $componentController(module.name, {}, {
      onSuccess: jasmine.createSpy('onSuccess')
    });
  }));

  describe('$onInit', () => {
    it('should set the modal title', () => {
      self.controller.$onInit();
      expect(self.controller.modalTitle).toEqual('Your Contact Information');
    });
  });

  describe('onSubmit', () => {
    it('should call onSuccess to close the modal upon a successful submission', () => {
      self.controller.onSubmit(true);
      expect(self.controller.onSuccess).toHaveBeenCalled();
    });
    it('should set submitted to false upon a failed submission', () => {
      self.controller.submitted = true;
      self.controller.onSubmit(false);
      expect(self.controller.submitted).toEqual(false);
    });
  });
});

import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/toPromise';

import module from './addUpdatePaymentMethod.component.js';

describe('editRecurringGiftsModal', () => {
  describe('step 0 addUpdatePaymentMethod', () => {
    beforeEach(angular.mock.module(module.name));
    var self = {};

    beforeEach(inject(($componentController) => {
      self.controller = $componentController(module.name, {}, {
        next: jasmine.createSpy('next')
      });
    }));

    describe('onSubmit', () => {
      it('should save a payment method to the profile service', () => {
        spyOn(self.controller.profileService, 'addPaymentMethod').and.returnValue(Observable.of('payment method response'));
        self.controller.onSubmit(true, 'some payment method');
        expect(self.controller.profileService.addPaymentMethod).toHaveBeenCalledWith('some payment method');
        expect(self.controller.next).toHaveBeenCalledWith({ paymentMethod: 'payment method response'});
        expect(self.controller.submissionError.error).toEqual('');
      });
      it('should handle an error saving a payment method to the profile service', () => {
        spyOn(self.controller.profileService, 'addPaymentMethod').and.returnValue(Observable.throw({ data: 'payment method error' }));
        self.controller.onSubmit(true, 'some payment method');
        expect(self.controller.profileService.addPaymentMethod).toHaveBeenCalledWith('some payment method');
        expect(self.controller.$log.error.logs[0]).toEqual(['Error saving payment method', { data: 'payment method error' }]);
        expect(self.controller.next).not.toHaveBeenCalled();
        expect(self.controller.submitted).toEqual(false);
        expect(self.controller.submissionError.error).toEqual('payment method error');
      });
      it('should the case where success if false and change submitted back to false', () => {
        spyOn(self.controller.profileService, 'addPaymentMethod');
        self.controller.onSubmit(false);
        expect(self.controller.profileService.addPaymentMethod).not.toHaveBeenCalled();
        expect(self.controller.next).not.toHaveBeenCalled();
        expect(self.controller.submitted).toEqual(false);
        expect(self.controller.submissionError.error).toEqual('');
      });
    });
  });
});

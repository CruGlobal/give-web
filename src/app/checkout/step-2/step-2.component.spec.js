import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import module from './step-2.component';

describe('checkout', () => {
  describe('step 2', () => {
    beforeEach(angular.mock.module(module.name));
    var self = {};

    beforeEach(inject(function($componentController) {
      self.controller = $componentController(module.name, {},
        {
          changeStep: () => {}
        });
    }));

    describe('handleExistingPaymentLoading', () => {
      it('should set flags for the view if payment methods exist', () => {
        expect(self.controller.loadingPaymentMethods).toEqual(true);
        self.controller.handleExistingPaymentLoading(true, true);
        expect(self.controller.existingPaymentMethods).toEqual(true);
        expect(self.controller.loadingPaymentMethods).toEqual(false);
      });
      it('should set flags for the view if payment methods do not exist', () => {
        expect(self.controller.loadingPaymentMethods).toEqual(true);
        self.controller.handleExistingPaymentLoading(true, false);
        expect(self.controller.existingPaymentMethods).toEqual(false);
        expect(self.controller.loadingPaymentMethods).toEqual(false);
      });
      it('should set flags for the view if requesting payment methods fails', () => {
        expect(self.controller.loadingPaymentMethods).toEqual(true);
        self.controller.handleExistingPaymentLoading(false, undefined, 'some error');
        expect(self.controller.existingPaymentMethods).toEqual(false);
        expect(self.controller.loadingPaymentMethods).toEqual(false);
        expect(self.controller.$log.warn.logs[0]).toEqual(['Error loading existing payment methods', 'some error']);
        expect(self.controller.loadingExistingPaymentError).toEqual('some error');
      });
    });

    describe('onSubmit', () => {
      it('should save payment data when success is true and data is defined', () => {
        spyOn(self.controller, 'changeStep');
        spyOn(self.controller.orderService, 'addPaymentMethod').and.callFake(() => Observable.of(''));
        self.controller.onSubmit(true, {bankAccount: {}});
        expect(self.controller.changeStep).toHaveBeenCalledWith({ newStep: 'review' });
        expect(self.controller.orderService.addPaymentMethod).toHaveBeenCalledWith({bankAccount: {}});
      });
      it('should handle an error saving payment data', () => {
        spyOn(self.controller, 'changeStep');
        spyOn(self.controller.orderService, 'addPaymentMethod').and.callFake(() => Observable.throw({ data: 'some error' }));
        self.controller.onSubmit(true, {bankAccount: {}});
        expect(self.controller.orderService.addPaymentMethod).toHaveBeenCalledWith({bankAccount: {}});
        expect(self.controller.submitted).toEqual(false);
        expect(self.controller.$log.error.logs[0]).toEqual(['Error saving payment method', { data: 'some error' }]);
        expect(self.controller.submissionError.error).toEqual('some error');
      });
      it('should call changeStep if save was successful and there was no data (assumes another component saved the data)', () => {
        spyOn(self.controller, 'changeStep');
        self.controller.onSubmit(true);
        expect(self.controller.changeStep).toHaveBeenCalledWith({ newStep: 'review' });
      });
      it('should set submitted to false if save was unsuccessful', () => {
        self.controller.submitted = true;
        self.controller.onSubmit(false, undefined, 'some error');
        expect(self.controller.submitted).toEqual(false);
        expect(self.controller.submissionError.error).toEqual('some error');
      });
    });
  });
});

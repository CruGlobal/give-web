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

    describe('$onInit', () => {
      it('should call loadDonorDetails', () => {
        spyOn(self.controller, 'loadDonorDetails');
        self.controller.$onInit();
        expect(self.controller.loadDonorDetails).toHaveBeenCalled();
      });
    });

    describe('loadDonorDetails', () => {
      it('should load mailing address', () => {
        spyOn(self.controller.orderService, 'getDonorDetails').and.returnValue(Observable.of({ mailingAddress: { streetAddress: 'Some street address'} }));
        self.controller.loadDonorDetails();
        expect(self.controller.orderService.getDonorDetails).toHaveBeenCalled();
        expect(self.controller.mailingAddress).toEqual({ streetAddress: 'Some street address'});
      });
      it('should log on error', () => {
        spyOn(self.controller.orderService, 'getDonorDetails').and.returnValue(Observable.throw('some error'));
        self.controller.loadDonorDetails();
        expect(self.controller.orderService.getDonorDetails).toHaveBeenCalled();
        expect(self.controller.$log.error.logs[0]).toEqual(['Error loading donorDetails', 'some error']);
      });
    });

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
      beforeEach(() => {
        self.controller.submissionError = {};
      });
      it('should save payment data when success is true and data is defined', () => {
        spyOn(self.controller, 'changeStep');
        spyOn(self.controller.orderService, 'addPaymentMethod').and.returnValue(Observable.of(''));
        self.controller.onSubmit(true, {bankAccount: {}});
        expect(self.controller.changeStep).toHaveBeenCalledWith({ newStep: 'review' });
        expect(self.controller.orderService.addPaymentMethod).toHaveBeenCalledWith({bankAccount: {}});
      });
      it('should save payment data and not change step when success is true, data is defined, and stayOnStep is true', () => {
        spyOn(self.controller, 'changeStep');
        spyOn(self.controller.orderService, 'addPaymentMethod').and.returnValue(Observable.of(''));
        self.controller.onSubmit(true, {bankAccount: {}}, undefined, true);
        expect(self.controller.changeStep).not.toHaveBeenCalled();
        expect(self.controller.submitSuccess).toEqual(true);
        expect(self.controller.orderService.addPaymentMethod).toHaveBeenCalledWith({bankAccount: {}});
      });
      it('should handle an error saving payment data', () => {
        spyOn(self.controller, 'changeStep');
        spyOn(self.controller.orderService, 'addPaymentMethod').and.returnValue(Observable.throw({ data: 'some error' }));
        self.controller.onSubmit(true, {bankAccount: {}});
        expect(self.controller.orderService.addPaymentMethod).toHaveBeenCalledWith({bankAccount: {}});
        expect(self.controller.submissionError.loading).toEqual(false);
        expect(self.controller.$log.error.logs[0]).toEqual(['Error saving payment method', { data: 'some error' }]);
        expect(self.controller.submissionError.error).toEqual('some error');
      });
      it('should call changeStep if save was successful and there was no data (assumes another component saved the data)', () => {
        spyOn(self.controller, 'changeStep');
        self.controller.onSubmit(true);
        expect(self.controller.changeStep).toHaveBeenCalledWith({ newStep: 'review' });
      });
      it('should set submitted to false if save was unsuccessful', () => {
        self.controller.submissionError.loading = true;
        self.controller.onSubmit(false, undefined, 'some error');
        expect(self.controller.submissionError.loading).toEqual(false);
        expect(self.controller.submissionError.error).toEqual('some error');
      });
    });
  });
});

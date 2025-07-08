import angular from 'angular';
import 'angular-mocks';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/toPromise';

import module from './addUpdatePaymentMethod.component';

describe('editRecurringGiftsModal', () => {
  describe('step 0 addUpdatePaymentMethod', () => {
    beforeEach(angular.mock.module(module.name));
    var self = {};

    beforeEach(inject(($componentController) => {
      self.controller = $componentController(
        module.name,
        {},
        {
          next: jest.fn(),
        },
      );
    }));

    describe('$onInit', () => {
      it('should call loadDonorDetails', () => {
        jest
          .spyOn(self.controller, 'loadDonorDetails')
          .mockImplementation(() => {});
        self.controller.$onInit();

        expect(self.controller.loadDonorDetails).toHaveBeenCalled();
      });
    });

    describe('loadDonorDetails', () => {
      it('should load mailing address', () => {
        jest
          .spyOn(self.controller.profileService, 'getDonorDetails')
          .mockReturnValue(
            Observable.of({
              mailingAddress: { streetAddress: 'Some street address' },
            }),
          );
        self.controller.loadDonorDetails();

        expect(
          self.controller.profileService.getDonorDetails,
        ).toHaveBeenCalled();
        expect(self.controller.mailingAddress).toEqual({
          streetAddress: 'Some street address',
        });
      });

      it('should log an error on failure', () => {
        jest
          .spyOn(self.controller.profileService, 'getDonorDetails')
          .mockReturnValue(Observable.throw('some error'));
        self.controller.loadDonorDetails();

        expect(self.controller.$log.error.logs[0]).toEqual([
          'Error loading donorDetails',
          'some error',
        ]);
      });
    });

    describe('onPaymentFormStateChange', () => {
      it('should update the paymentFormState', () => {
        self.controller.paymentFormState = 'unsubmitted';
        self.controller.onPaymentFormStateChange({ state: 'submitted' });

        expect(self.controller.paymentFormState).toEqual('submitted');
      });

      it('should save a new payment method to the profile service', () => {
        jest
          .spyOn(self.controller.profileService, 'addPaymentMethod')
          .mockReturnValue(Observable.of('payment method response'));
        self.controller.onPaymentFormStateChange({
          state: 'loading',
          payload: 'some payment method',
        });

        expect(
          self.controller.profileService.addPaymentMethod,
        ).toHaveBeenCalledWith('some payment method');
        expect(self.controller.next).toHaveBeenCalled();
        expect(self.controller.paymentFormState).toEqual('loading');
      });

      it('should handle an error saving a new payment method to the profile service', () => {
        jest
          .spyOn(self.controller.profileService, 'addPaymentMethod')
          .mockReturnValue(Observable.throw({ data: 'payment method error' }));
        self.controller.onPaymentFormStateChange({
          state: 'loading',
          payload: 'some payment method',
        });

        expect(
          self.controller.profileService.addPaymentMethod,
        ).toHaveBeenCalledWith('some payment method');
        expect(self.controller.$log.error.logs[0]).toEqual([
          'Error adding/updating payment method',
          { data: 'payment method error' },
        ]);
        expect(self.controller.next).not.toHaveBeenCalled();
        expect(self.controller.paymentFormState).toEqual('error');
        expect(self.controller.paymentFormError).toEqual(
          'payment method error',
        );
      });

      it('should save an existing payment method to the profile service', () => {
        self.controller.paymentMethod = { self: { uri: 'paymentMethodUri' } };
        jest
          .spyOn(self.controller.profileService, 'updatePaymentMethod')
          .mockReturnValue(Observable.of(null));
        self.controller.onPaymentFormStateChange({
          state: 'loading',
          payload: 'some payment method',
        });

        expect(
          self.controller.profileService.updatePaymentMethod,
        ).toHaveBeenCalledWith(
          { self: { uri: 'paymentMethodUri' } },
          'some payment method',
        );
        expect(self.controller.next).toHaveBeenCalled();
        expect(self.controller.paymentFormState).toEqual('loading');
      });

      it('should handle an error saving an existing payment method to the profile service', () => {
        self.controller.paymentMethod = { self: { uri: 'paymentMethodUri' } };
        jest
          .spyOn(self.controller.profileService, 'updatePaymentMethod')
          .mockReturnValue(Observable.throw({ data: 'payment method error' }));
        self.controller.onPaymentFormStateChange({
          state: 'loading',
          payload: 'some payment method',
        });

        expect(
          self.controller.profileService.updatePaymentMethod,
        ).toHaveBeenCalledWith(
          { self: { uri: 'paymentMethodUri' } },
          'some payment method',
        );
        expect(self.controller.$log.error.logs[0]).toEqual([
          'Error adding/updating payment method',
          { data: 'payment method error' },
        ]);
        expect(self.controller.next).not.toHaveBeenCalled();
        expect(self.controller.paymentFormState).toEqual('error');
        expect(self.controller.paymentFormError).toEqual(
          'payment method error',
        );
      });
    });
  });
});

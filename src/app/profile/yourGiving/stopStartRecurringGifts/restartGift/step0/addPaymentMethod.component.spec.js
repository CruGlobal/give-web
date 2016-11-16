import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import module from './addPaymentMethod.component';

describe( 'your giving', () => {
  describe('stopStartRecurringGiftsModal', () => {
    describe('restartGift -> Step0', () => {
      beforeEach(angular.mock.module(module.name));
      let $ctrl;

      beforeEach(inject(($componentController) => {
        $ctrl = $componentController(module.name, {}, jasmine.createSpyObj('bindings', ['next', 'previous', 'paymentMethods', 'setLoading']));
      }));

      it('is defined', () => {
        expect($ctrl).toBeDefined();
        expect($ctrl.$log).toBeDefined();
        expect($ctrl.profileService).toBeDefined();
        expect($ctrl.submissionError.loading).toBe(false);
      });

      describe('$onInit()', () => {
        it('should call loadDonorDetails()', () => {
          spyOn($ctrl, 'loadDonorDetails');
          $ctrl.$onInit();
          expect($ctrl.loadDonorDetails).toHaveBeenCalled();
        });
      });

      describe('loadDonorDetails()', () => {
        it('should load donor details', () => {
          spyOn($ctrl.profileService, 'getDonorDetails');
          $ctrl.profileService.getDonorDetails.and.returnValue( Observable.of( {mailingAddress: 'data'} ) );
          $ctrl.loadDonorDetails();
          expect($ctrl.profileService.getDonorDetails).toHaveBeenCalled();
          expect($ctrl.mailingAddress).toBe('data');
        });
      });

      describe('onSubmit()', () => {
        beforeEach(() => {
          spyOn($ctrl.profileService, 'addPaymentMethod');
        });
        it('should add payment method', () => {
          $ctrl.paymentMethods = [];
          $ctrl.profileService.addPaymentMethod.and.returnValue( Observable.of( 'data' ) );
          $ctrl.onSubmit(true, {});
          expect($ctrl.profileService.addPaymentMethod).toHaveBeenCalled();
          expect($ctrl.setLoading).toHaveBeenCalledWith({loading: false});
          expect($ctrl.next).toHaveBeenCalled();
          expect($ctrl.paymentMethods.length).toBe(1);
        });

        it('should handle error adding payment method', () => {
          $ctrl.profileService.addPaymentMethod.and.returnValue( Observable.throw( {data: 'error'} ) );
          $ctrl.onSubmit(true, {});
          expect($ctrl.profileService.addPaymentMethod).toHaveBeenCalled();
          expect($ctrl.setLoading).toHaveBeenCalledWith({loading: false});
          expect($ctrl.next).not.toHaveBeenCalled();
          expect($ctrl.submissionError.error).toBe('error');
        });

        it('should not submit', () => {
          $ctrl.onSubmit(false, {});
          expect($ctrl.profileService.addPaymentMethod).not.toHaveBeenCalled();
          expect($ctrl.submissionError.loading).toBe(false);
        });
      });

    });
  });
});

import angular from 'angular';
import 'angular-mocks';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import RecurringGiftModel from 'common/models/recurringGift.model';

import module from './deletePaymentMethod.modal.component';

describe('delete payment method modal', function () {
  beforeEach(angular.mock.module(module.name));
  const self = {};

  beforeEach(inject(function ($componentController) {
    const paymentMethod = {
      self: {
        uri: 'uri',
      },
      recurringGifts: [
        new RecurringGiftModel({ 'designation-name': 'Joe' }),
        new RecurringGiftModel({ 'designation-name': 'Bob' }),
      ],
    };
    self.controller = $componentController(
      module.name,
      {
        profileService: {
          addPaymentMethod: jest.fn(),
          deletePaymentMethod: jest.fn(),
        },
        donationsService: {
          updateRecurringGifts: jest.fn(),
        },
      },
      {
        resolve: {
          paymentMethod: paymentMethod,
          paymentMethodsList: [paymentMethod],
        },
        close: jest.fn(),
      },
    );
  }));

  it('to be defined', function () {
    expect(self.controller).toBeDefined();
    expect(self.controller.loading).toEqual(false);
  });

  describe('$onInit()', () => {
    it('initializes the component', () => {
      jest.spyOn(self.controller, 'setView').mockImplementation(() => {});
      jest
        .spyOn(self.controller, 'getPaymentMethods')
        .mockImplementation(() => {});

      self.controller.$onInit();

      self.controller.hasRecurringGifts = true;

      expect(self.controller.setView).toHaveBeenCalled();
      expect(self.controller.getPaymentMethods).toHaveBeenCalled();
    });
  });

  describe('setView()', () => {
    it('should set initial view to manageDonations if there are existing recurring gifts', () => {
      self.controller.resolve.paymentMethod.recurringGifts = [{}];
      self.controller.setView();

      expect(self.controller.view).toEqual('manageDonations');
    });

    it('should set initial view to confirm if there are no existing recurring gifts', () => {
      self.controller.resolve.paymentMethod.recurringGifts = [];
      self.controller.setView();

      expect(self.controller.view).toEqual('confirm');
    });
  });

  describe('getPaymentMethods()', () => {
    it('should do nothing if there are no recurring gifts', () => {
      self.controller.hasRecurringGifts = false;
      self.controller.getPaymentMethods();

      expect(self.controller.filteredPaymentMethods).toEqual([]);
      expect(self.controller.toEqual).toBeUndefined();
      expect(self.controller.selectedPaymentMethod).toBeUndefined();
    });

    it('should handle deleting the only payment method (no filtered payment methods)', () => {
      self.controller.hasRecurringGifts = true;
      self.controller.getPaymentMethods();

      expect(self.controller.filteredPaymentMethods.length).toEqual(0);
      expect(self.controller.deleteOption).toEqual('2');
      expect(self.controller.selectedPaymentMethod).toEqual(false);
    });

    it('should create an array of filtered payment methods', () => {
      const secondPaymentMethod = {
        self: {
          uri: 'uri2',
        },
        recurringGifts: [],
      };
      const thirdPaymentMethod = {
        self: {
          uri: 'uri3',
        },
        recurringGifts: [],
      };
      self.controller.resolve.paymentMethodsList.push(secondPaymentMethod);
      self.controller.resolve.paymentMethodsList.push(thirdPaymentMethod);
      self.controller.hasRecurringGifts = true;
      self.controller.getPaymentMethods();

      expect(self.controller.filteredPaymentMethods).toEqual([
        secondPaymentMethod,
        thirdPaymentMethod,
      ]);
      expect(self.controller.deleteOption).toEqual('1');
      expect(self.controller.selectedPaymentMethod).toEqual(
        secondPaymentMethod,
      );
    });
  });

  describe('changeView()', () => {
    beforeEach(() => {
      jest
        .spyOn(self.controller, 'scrollModalToTop')
        .mockImplementation(() => {});
    });

    it('should scroll to the top of the modal', () => {
      self.controller.changeView();

      expect(self.controller.scrollModalToTop).toHaveBeenCalled();
    });

    it('should reset the view', () => {
      jest.spyOn(self.controller, 'setView').mockImplementation(() => {});
      self.controller.changeView(true);

      expect(self.controller.setView).toHaveBeenCalled();
      expect(self.controller.deletionError).toEqual('');
    });

    it("changes 'view' and 'confirm text' properties", () => {
      self.controller.deleteOption = '1';
      self.controller.changeView();

      expect(self.controller.view).toBe('confirm');
      expect(self.controller.confirmText).toBe('withTransfer');

      self.controller.deleteOption = '2';
      self.controller.changeView();

      expect(self.controller.view).toBe('addPaymentMethod');

      self.controller.deleteOption = '3';
      self.controller.changeView();

      expect(self.controller.view).toBe('confirm');
      expect(self.controller.confirmText).toBe('withOutTransfer');
    });
  });

  describe('getPaymentMethodOptionLabel()', () => {
    it('returns bank display string', () => {
      self.controller.resolve.paymentMethod['bank-name'] = 'Moral Bank';
      self.controller.resolve.paymentMethod['display-account-number'] = '4444';

      expect(
        self.controller.getPaymentMethodOptionLabel(
          self.controller.resolve.paymentMethod,
        ),
      ).toBe('Moral Bank ending in ****4444');
    });

    it('returns card display string', () => {
      self.controller.resolve.paymentMethod['card-type'] = 'Visa';
      self.controller.resolve.paymentMethod['last-four-digits'] = '4321';

      expect(
        self.controller.getPaymentMethodOptionLabel(
          self.controller.resolve.paymentMethod,
        ),
      ).toBe('Visa ending in ****4321');
    });
  });

  describe('getNewPaymentMethodId()', () => {
    it('return id from self.uri', () => {
      self.controller.selectedPaymentMethod = {
        self: {
          uri: '/blah/blah/123',
        },
      };

      expect(self.controller.getNewPaymentMethodId()).toBe('123');
    });
  });

  describe('moveDonationsToNewPaymentMethod()', () => {
    it("should update each donation's updated-payment-instrument-id field and make an API call to update", () => {
      self.controller.selectedPaymentMethod = {
        self: {
          uri: '/blah/blah/123',
        },
      };
      jest
        .spyOn(self.controller, 'updateRecurringGifts')
        .mockImplementation(() => {});
      self.controller.moveDonationsToNewPaymentMethod();

      expect(self.controller.updateRecurringGifts).toHaveBeenCalledWith(
        self.controller.resolve.paymentMethod.recurringGifts,
      );
      expect(
        self.controller.resolve.paymentMethod.recurringGifts[0].paymentMethodId,
      ).toEqual('123');
      expect(
        self.controller.resolve.paymentMethod.recurringGifts[1].paymentMethodId,
      ).toEqual('123');
    });
  });

  describe('stopRecurringGifts()', () => {
    it("should update each donation's updated-donation-line-status field and make an API call to update", () => {
      jest
        .spyOn(self.controller, 'updateRecurringGifts')
        .mockImplementation(() => {});
      self.controller.stopRecurringGifts();

      expect(self.controller.updateRecurringGifts).toHaveBeenCalledWith(
        self.controller.resolve.paymentMethod.recurringGifts,
      );
      expect(
        self.controller.resolve.paymentMethod.recurringGifts[0]
          .donationLineStatus,
      ).toBe('Cancelled');
      expect(
        self.controller.resolve.paymentMethod.recurringGifts[1]
          .donationLineStatus,
      ).toBe('Cancelled');
    });
  });

  describe('updateRecurringGifts()', () => {
    it('make an successful API call to update recurring gifts and delete payment method', () => {
      jest
        .spyOn(self.controller, 'deletePaymentMethod')
        .mockImplementation(() => {});
      self.controller.donationsService.updateRecurringGifts.mockReturnValue(
        Observable.of('data'),
      );
      self.controller.updateRecurringGifts();

      expect(self.controller.deletePaymentMethod).toHaveBeenCalled();
    });

    it('should throw an error', () => {
      self.controller.donationsService.updateRecurringGifts.mockReturnValue(
        Observable.throw({
          data: 'some error',
        }),
      );

      self.controller.updateRecurringGifts();

      expect(self.controller.deletionError).toEqual('updateGifts');
      expect(self.controller.$log.error.logs[0]).toEqual([
        'Error updating recurring gifts before deleting old payment method',
        {
          data: 'some error',
        },
      ]);
    });
  });

  describe('onPaymentFormStateChange()', () => {
    beforeEach(() => {
      jest.spyOn(self.controller, 'changeView').mockImplementation(() => {});
    });

    it('should update paymentFormState', () => {
      self.controller.paymentFormState = 'unsubmitted';
      self.controller.onPaymentFormStateChange({ state: 'submitted' });

      expect(self.controller.paymentFormState).toEqual('submitted');
    });

    it('should save new payment method', () => {
      const responseData = {
        self: {
          uri: 'some uri',
        },
        address: {
          streetAddress: '123 First St',
          extendedAddress: 'Apt 123',
          locality: 'Sacramento',
          postalCode: '12345',
          region: 'CA',
        },
      };
      self.controller.profileService.addPaymentMethod.mockReturnValue(
        Observable.of(responseData),
      );
      self.controller.onPaymentFormStateChange({
        state: 'loading',
        payload: 'some data',
      });

      expect(
        self.controller.profileService.addPaymentMethod,
      ).toHaveBeenCalledWith('some data');
      expect(self.controller.selectedPaymentMethod).toEqual(
        expect.objectContaining(responseData),
      );
      expect(self.controller.filteredPaymentMethods[0]).toEqual(
        expect.objectContaining(responseData),
      );
      expect(self.controller.resolve.paymentMethodsList[1]).toEqual(
        expect.objectContaining(responseData),
      );
      expect(self.controller.deleteOption).toEqual('1');
      expect(self.controller.changeView).toHaveBeenCalled();
    });

    it('should fail and throw error', () => {
      self.controller.profileService.addPaymentMethod.mockReturnValue(
        Observable.throw({
          data: 'some error',
        }),
      );
      self.controller.onPaymentFormStateChange({
        state: 'loading',
        payload: 'some data',
      });

      expect(
        self.controller.profileService.addPaymentMethod,
      ).toHaveBeenCalledWith('some data');
      expect(self.controller.paymentFormState).toEqual('error');
      expect(self.controller.paymentFormError).toEqual('some error');
      expect(self.controller.changeView).not.toHaveBeenCalled();
      expect(self.controller.$log.error.logs[0]).toEqual([
        'Error saving new payment method in delete payment method modal',
        {
          data: 'some error',
        },
      ]);
    });
  });

  describe('deletePaymentMethod()', () => {
    beforeEach(() => {
      jest
        .spyOn(self.controller, 'removePaymentMethodFromList')
        .mockImplementation(() => {});
    });

    it('should delete payment method and remove it from local list', () => {
      self.controller.profileService.deletePaymentMethod.mockReturnValue(
        Observable.of('data'),
      );
      self.controller.deleteOption = '1';
      self.controller.hasRecurringGifts = true;
      self.controller.deletePaymentMethod();

      expect(
        self.controller.profileService.deletePaymentMethod,
      ).toHaveBeenCalledWith(self.controller.resolve.paymentMethod.self.uri);
      expect(self.controller.removePaymentMethodFromList).toHaveBeenCalled();
      expect(self.controller.close).toHaveBeenCalled();
      expect(self.controller.loading).toEqual(false);
    });

    it('should fail and throw error', () => {
      self.controller.profileService.deletePaymentMethod.mockReturnValue(
        Observable.throw({
          data: 'some error',
        }),
      );
      self.controller.deletePaymentMethod();

      expect(self.controller.deletionError).toEqual('delete');
      expect(self.controller.$log.error.logs[0]).toEqual([
        'Error deleting payment method',
        {
          data: 'some error',
        },
      ]);

      expect(self.controller.loading).toEqual(false);
    });
  });

  describe('removePaymentMethodFromList()', () => {
    it('remove payment method that was deleted from local list ', () => {
      const otherPaymentMethod = {
        self: {
          uri: 'uri2',
        },
      };
      self.controller.resolve.paymentMethodsList.push(otherPaymentMethod);

      expect(self.controller.resolve.paymentMethodsList.length).toEqual(2);
      self.controller.removePaymentMethodFromList();

      expect(self.controller.resolve.paymentMethodsList).toEqual([
        otherPaymentMethod,
      ]);
    });
  });

  describe('onSubmit()', () => {
    it('should call different functions depending on delete option', () => {
      jest
        .spyOn(self.controller, 'moveDonationsToNewPaymentMethod')
        .mockImplementation(() => {});
      jest
        .spyOn(self.controller, 'stopRecurringGifts')
        .mockImplementation(() => {});
      jest
        .spyOn(self.controller, 'deletePaymentMethod')
        .mockImplementation(() => {});

      self.controller.deleteOption = '0';
      self.controller.onSubmit();

      expect(self.controller.deletePaymentMethod).toHaveBeenCalled();

      self.controller.deleteOption = '2';
      self.controller.onSubmit();

      expect(self.controller.deletePaymentMethod).toHaveBeenCalled();

      self.controller.deleteOption = '1';
      self.controller.onSubmit();

      expect(
        self.controller.moveDonationsToNewPaymentMethod,
      ).toHaveBeenCalled();

      self.controller.deleteOption = '3';
      self.controller.onSubmit();

      expect(self.controller.stopRecurringGifts).toHaveBeenCalled();

      expect(self.controller.loading).toEqual(true);
    });
  });
});

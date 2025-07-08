import angular from 'angular';
import 'angular-mocks';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/throw';

import RecurringGiftModel from 'common/models/recurringGift.model';
import { giftAddedEvent } from 'common/lib/cartEvents';

import module from './giveOneTimeGift.modal.component';

describe('giveOneTimeGiftModal', () => {
  beforeEach(angular.mock.module(module.name));
  const self = {};

  beforeEach(inject(($componentController) => {
    self.controller = $componentController(
      module.name,
      {},
      {
        close: jest.fn(),
        dismiss: jest.fn(),
      },
    );
  }));

  describe('$onInit', () => {
    it('should call loadRecentRecipients', () => {
      jest
        .spyOn(self.controller, 'loadRecentRecipients')
        .mockImplementation(() => {});
      self.controller.$onInit();

      expect(self.controller.loadRecentRecipients).toHaveBeenCalled();
    });
  });

  describe('loadRecentRecipients', () => {
    beforeEach(() => {
      jest.spyOn(self.controller, 'next').mockImplementation(() => {});
    });

    it('should load recent recipients', () => {
      jest
        .spyOn(self.controller.donationsService, 'getRecentRecipients')
        .mockReturnValue(
          Observable.of([
            {
              'designation-name': 'Staff Member',
              'designation-number': '0123456',
            },
          ]),
        );
      self.controller.loadRecentRecipients();

      expect(self.controller.recentRecipients).toEqual([
        new RecurringGiftModel({
          'designation-name': 'Staff Member',
          'designation-number': '0123456',
        }).setDefaultsSingleGift(),
      ]);

      expect(self.controller.hasRecentRecipients).toEqual(true);
      expect(self.controller.next).toHaveBeenCalled();
    });

    it('should handle an error loading recent recipients', () => {
      jest
        .spyOn(self.controller.donationsService, 'getRecentRecipients')
        .mockReturnValue(Observable.throw('some error'));
      self.controller.loadRecentRecipients();

      expect(self.controller.recentRecipients).toEqual([]);
      expect(self.controller.$log.error.logs[0]).toEqual([
        'Error loading recent recipients',
        'some error',
      ]);
      expect(self.controller.next).not.toHaveBeenCalled();
    });
  });

  describe('next', () => {
    beforeEach(() => {
      jest
        .spyOn(self.controller, 'scrollModalToTop')
        .mockImplementation(() => {});
    });

    it('should scroll to the top of the modal', () => {
      self.controller.next();

      expect(self.controller.scrollModalToTop).toHaveBeenCalled();
    });

    it('should transition from loadingRecentRecipients to step1SelectRecentRecipients', () => {
      self.controller.state = 'loadingRecentRecipients';
      self.controller.hasRecentRecipients = true;
      self.controller.next();

      expect(self.controller.state).toEqual('step1SelectRecentRecipients');
    });

    it('should transition from loadingRecentRecipients to step1SearchRecipients', () => {
      self.controller.state = 'loadingRecentRecipients';
      self.controller.hasRecentRecipients = false;
      self.controller.next();

      expect(self.controller.state).toEqual('step1SearchRecipients');
    });

    it('should transition from errorLoadingRecentRecipients to step1SearchRecipients', () => {
      self.controller.state = 'errorLoadingRecentRecipients';
      self.controller.next();

      expect(self.controller.state).toEqual('step1SearchRecipients');
    });

    it('should transition from step1SelectRecentRecipients to step2EnterAmounts if recipients are selected', () => {
      self.controller.state = 'step1SelectRecentRecipients';
      self.controller.next(['recipient']);

      expect(self.controller.selectedRecipients).toEqual(['recipient']);
      expect(self.controller.state).toEqual('step2EnterAmounts');
    });

    it('should transition from step1SelectRecentRecipients to step1SearchRecipients if search is true', () => {
      self.controller.state = 'step1SelectRecentRecipients';
      self.controller.next(['recipient'], true);

      expect(self.controller.selectedRecipients).toEqual(['recipient']);
      expect(self.controller.state).toEqual('step1SearchRecipients');
    });

    it('should transition from step1SelectRecentRecipients to step1SearchRecipients if no recipients are selected', () => {
      self.controller.state = 'step1SelectRecentRecipients';
      self.controller.next();

      expect(self.controller.selectedRecipients).toEqual([]);
      expect(self.controller.state).toEqual('step1SearchRecipients');
    });

    it('should transition from step1SearchRecipients to step2EnterAmounts', () => {
      self.controller.state = 'step1SearchRecipients';
      self.controller.recentRecipients = [
        'old recipient',
        'selected recipient',
      ];
      self.controller.selectedRecipients = ['selected recipient'];
      self.controller.next(null, null, ['new recipient']);

      expect(self.controller.recentRecipients).toEqual([
        'old recipient',
        'selected recipient',
        'new recipient',
      ]);
      expect(self.controller.hasRecentRecipients).toEqual(true);
      expect(self.controller.selectedRecipients).toEqual([
        'selected recipient',
        'new recipient',
      ]);
      expect(self.controller.state).toEqual('step2EnterAmounts');
    });

    it('should transition from step2EnterAmounts, add gifts to cart, close the modal, and open the mini nav cart', () => {
      jest
        .spyOn(self.controller, 'addSelectedRecipientsToCart')
        .mockImplementation(() => {});
      self.controller.state = 'step2EnterAmounts';
      self.controller.next(['confirmed gift']);

      expect(self.controller.selectedRecipients).toEqual(['confirmed gift']);
      expect(self.controller.addSelectedRecipientsToCart).toHaveBeenCalled();
    });
  });

  describe('previous', () => {
    beforeEach(() => {
      jest
        .spyOn(self.controller, 'scrollModalToTop')
        .mockImplementation(() => {});
    });

    it('should scroll to the top of the modal', () => {
      self.controller.previous();

      expect(self.controller.scrollModalToTop).toHaveBeenCalled();
    });

    it('should transition from step2EnterAmounts to step1SelectRecentRecipients if there are recent recipients', () => {
      self.controller.state = 'step2EnterAmounts';
      self.controller.hasRecentRecipients = true;
      self.controller.previous();

      expect(self.controller.state).toEqual('step1SelectRecentRecipients');
    });

    it('should transition from step2EnterAmounts to step1SearchRecipients if there are no recent recipients', () => {
      self.controller.state = 'step2EnterAmounts';
      self.controller.hasRecentRecipients = false;
      self.controller.previous();

      expect(self.controller.state).toEqual('step1SearchRecipients');
    });

    it('should transition from step1SearchRecipients to step1SelectRecentRecipients', () => {
      self.controller.state = 'step1SearchRecipients';
      self.controller.previous();

      expect(self.controller.state).toEqual('step1SelectRecentRecipients');
    });
  });

  describe('addSelectedRecipientsToCart', () => {
    beforeEach(() => {
      jest
        .spyOn(self.controller.cartService, 'bulkAdd')
        .mockImplementation(() => {});
      jest.spyOn(self.controller.$scope, '$emit').mockImplementation(() => {});
    });

    it('should add the selected recipients to cart, close the modal, and open the mini cart', () => {
      self.controller.cartService.bulkAdd.mockReturnValue(
        Observable.from([
          {
            configuredDesignation: {
              designationNumber: '0123456',
              amount: 57,
              uri: 'uri1',
            },
          },
        ]),
      );
      self.controller.selectedRecipients = [
        { designationNumber: '0123456', amount: 57 },
      ];
      self.controller.addSelectedRecipientsToCart();

      expect(self.controller.cartService.bulkAdd).toHaveBeenCalledWith([
        { designationNumber: '0123456', amount: 57 },
      ]);
      expect(self.controller.$scope.$emit).toHaveBeenCalledWith(giftAddedEvent);
      expect(self.controller.close).toHaveBeenCalled();
      expect(self.controller.errors).toEqual({});
      expect(self.controller.submitted).toEqual(false);
    });

    it('should show the recipients that failed to be added to cart to the user', () => {
      self.controller.cartService.bulkAdd.mockReturnValue(
        Observable.from([
          {
            configuredDesignation: {
              designationNumber: '0123456',
              amount: 57,
              uri: 'uri1',
            },
          },
          {
            error: 'some error',
            configuredDesignation: {
              designationNumber: '1234567',
              amount: 58,
              uri: 'uri2',
            },
          },
        ]),
      );
      self.controller.selectedRecipients = [
        { designationNumber: '0123456', amount: 57 },
        { designationNumber: '1234567', amount: 58 },
      ];
      self.controller.addSelectedRecipientsToCart();

      expect(self.controller.cartService.bulkAdd).toHaveBeenCalledWith([
        { designationNumber: '0123456', amount: 57 },
        { designationNumber: '1234567', amount: 58 },
      ]);

      expect(self.controller.$scope.$emit).not.toHaveBeenCalled();
      expect(self.controller.close).not.toHaveBeenCalled();
      expect(self.controller.selectedRecipients).toEqual([
        { designationNumber: '1234567', amount: 58, uri: 'uri2' },
      ]);
      expect(self.controller.errors.addToCart).toEqual(true);
      expect(self.controller.submitted).toEqual(true);
      expect(self.controller.$log.error.logs[0]).toEqual([
        'Error adding a selected one time recipient to cart',
        {
          error: 'some error',
          configuredDesignation: {
            designationNumber: '1234567',
            amount: 58,
            uri: 'uri2',
          },
        },
      ]);
    });

    it('should handle a generic error that is not gift specific', () => {
      self.controller.cartService.bulkAdd.mockReturnValue(
        Observable.throw('some error'),
      );
      self.controller.selectedRecipients = [
        { designationNumber: '0123456', amount: 57 },
      ];
      self.controller.addSelectedRecipientsToCart();

      expect(self.controller.cartService.bulkAdd).toHaveBeenCalledWith([
        { designationNumber: '0123456', amount: 57 },
      ]);

      expect(self.controller.$scope.$emit).not.toHaveBeenCalled();
      expect(self.controller.close).not.toHaveBeenCalled();
      expect(self.controller.selectedRecipients).toEqual([
        { designationNumber: '0123456', amount: 57 },
      ]);
      expect(self.controller.errors.addToCart).toEqual(true);
      expect(self.controller.submitted).toEqual(true);
      expect(self.controller.$log.error.logs[0]).toEqual([
        'Error adding selected one time recipients to cart',
        'some error',
      ]);
    });
  });
});

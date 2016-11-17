import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import RecurringGiftModel from 'common/models/recurringGift.model';

import module from './giveOneTimeGift.modal.component';

describe('giveOneTimeGiftModal', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(($componentController) => {
    self.controller = $componentController(module.name, {}, {
      close: jasmine.createSpy('close'),
      dismiss: jasmine.createSpy('dismiss')
    });
  }));

  describe('$onInit', () => {
    it('should call loadRecentRecipients', () => {
      spyOn(self.controller, 'loadRecentRecipients');
      self.controller.$onInit();
      expect(self.controller.loadRecentRecipients).toHaveBeenCalled();
    });
  });

  describe('loadRecentRecipients', () => {
    it('should load recent recipients', () => {
      spyOn(self.controller.donationsService, 'getRecentRecipients').and.returnValue(Observable.of([ { 'designation-name': 'Staff Member', 'designation-number': '0123456' } ]));
      self.controller.loadRecentRecipients();
      expect(self.controller.recentRecipients).toEqual([ (new RecurringGiftModel(
        { 'designation-name': 'Staff Member', 'designation-number': '0123456' }
      )).setDefaultsSingleGift() ] );
      expect(self.controller.hasRecentRecipients).toEqual(true);
    });
    it('should handle an error loading recent recipients', () => {
      spyOn(self.controller.donationsService, 'getRecentRecipients').and.returnValue(Observable.throw('some error'));
      self.controller.loadRecentRecipients();
      expect(self.controller.recentRecipients).toEqual([]);
      expect(self.controller.$log.error.logs[0]).toEqual( [ 'Error loading recent recipients', 'some error' ] );
    });
  });

  describe('next', () => {
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
      self.controller.recentRecipients = ['old recipient', 'selected recipient'];
      self.controller.selectedRecipients = ['selected recipient'];
      self.controller.next(null, null, ['new recipient']);
      expect(self.controller.recentRecipients).toEqual(['old recipient', 'selected recipient', 'new recipient']);
      expect(self.controller.hasRecentRecipients).toEqual(true);
      expect(self.controller.selectedRecipients).toEqual(['selected recipient', 'new recipient']);
      expect(self.controller.state).toEqual('step2EnterAmounts');
    });

    it('should transition from step2EnterAmounts, add gifts to cart, close the modal, and open the mini nav cart', () => {
      self.controller.state = 'step2EnterAmounts';
      self.controller.next(['confirmed gift']);
      expect(self.controller.selectedRecipients).toEqual(['confirmed gift']);
      expect(self.controller.close).toHaveBeenCalled();
      // TODO: test adding gifts to cart and opening the mini cart
    });
  });

  describe('previous', () => {
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
});

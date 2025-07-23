import angular from 'angular';
import 'angular-mocks';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { TestScheduler } from 'rxjs/testing/TestScheduler';

import module from './giftSearchView.component';

describe('giftSearchView', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(($componentController) => {
    self.controller = $componentController(
      module.name,
      {},
      {
        onSelection: jest.fn(),
      },
    );
  }));

  it('should set initial state', () => {
    expect(self.controller.searchState).toEqual('initial');
  });

  describe('$onInit', () => {
    it('should call searchHandler', () => {
      jest.spyOn(self.controller, 'searchHandler').mockImplementation(() => {});
      self.controller.$onInit();

      expect(self.controller.searchHandler).toHaveBeenCalled();
    });
  });

  describe('searchHandler', () => {
    beforeEach(() => {
      jest
        .spyOn(self.controller.designationsService, 'productSearch')
        .mockReturnValue(Observable.empty());

      // Setup fake debounceTime so it can be flushed synchronously
      self.scheduler = new TestScheduler();
      const originalDebounceTime = Observable.prototype.debounceTime;
      jest
        .spyOn(Observable.prototype, 'debounceTime')
        .mockImplementation(function (dueTime) {
          // Don't use arrow function here for this to be defined correctly
          return originalDebounceTime.call(this, dueTime, self.scheduler);
        });

      self.controller.searchHandler();
    });

    it('should submit a query and load the result array', () => {
      self.controller.designationsService.productSearch.mockReturnValue(
        Observable.of([
          { name: 'A', designationNumber: '01234567' },
          { name: 'B', designationNumber: '76543210' },
        ]),
      );
      self.controller.searchSubject.next('Joe');
      self.scheduler.flush();

      expect(
        self.controller.designationsService.productSearch,
      ).toHaveBeenCalledWith({ keyword: 'Joe' });
      expect(self.controller.results).toEqual([
        { designationName: 'A', designationNumber: '01234567' },
        { designationName: 'B', designationNumber: '76543210' },
      ]);

      expect(self.controller.searchState).toEqual('results');
    });

    it('should submit a query and handle an empty response', () => {
      self.controller.designationsService.productSearch.mockReturnValue(
        Observable.of([]),
      );
      self.controller.searchSubject.next('Joe');
      self.scheduler.flush();

      expect(
        self.controller.designationsService.productSearch,
      ).toHaveBeenCalledWith({ keyword: 'Joe' });
      expect(self.controller.results).toBeUndefined();
      expect(self.controller.searchState).toEqual('no-results');
    });

    it('should submit a query and handle an error response', () => {
      self.controller.designationsService.productSearch.mockReturnValue(
        Observable.throw('some error'),
      );
      self.controller.searchSubject.next('Joe');
      self.scheduler.flush();

      expect(
        self.controller.designationsService.productSearch,
      ).toHaveBeenCalledWith({ keyword: 'Joe' });
      expect(self.controller.results).toBeUndefined();
      expect(self.controller.searchState).toEqual('error');
      expect(self.controller.$log.error.logs[0]).toEqual([
        'Error loading search results in giftSearchView',
        'some error',
      ]);
    });

    it('should set the state to searching during a search', () => {
      self.controller.searchSubject.next('J');
      self.scheduler.flush();

      expect(self.controller.searchState).toEqual('searching');
    });

    it('should only submit the last query when the debounce interval expires', () => {
      self.controller.searchSubject.next('J');
      self.scheduler.maxFrames = 600;
      self.scheduler.flush();

      expect(
        self.controller.designationsService.productSearch,
      ).toHaveBeenCalledWith({ keyword: 'J' });
      self.controller.designationsService.productSearch.mockClear();

      self.controller.searchSubject.next('Jo');
      self.scheduler.maxFrames = 1100;
      self.scheduler.flush();

      expect(
        self.controller.designationsService.productSearch,
      ).not.toHaveBeenCalled();
      self.controller.designationsService.productSearch.mockClear();

      self.controller.searchSubject.next('Joe');
      self.scheduler.maxFrames = 1800; // Should be available at 1700. Need a better way of testing than manipulating maxFrames
      self.scheduler.flush();

      expect(
        self.controller.designationsService.productSearch,
      ).toHaveBeenCalledWith({ keyword: 'Joe' });
      expect(
        self.controller.designationsService.productSearch.mock.calls.length,
      ).toEqual(1);
    });

    it('should not submit the same query twice', () => {
      self.controller.searchSubject.next('Joe');
      self.scheduler.maxFrames = 600;
      self.scheduler.flush();

      expect(
        self.controller.designationsService.productSearch,
      ).toHaveBeenCalledWith({ keyword: 'Joe' });
      self.controller.designationsService.productSearch.mockClear();

      self.controller.searchSubject.next('Joe');
      self.scheduler.maxFrames = 1200;
      self.scheduler.flush();

      expect(
        self.controller.designationsService.productSearch,
      ).not.toHaveBeenCalled();
      self.controller.designationsService.productSearch.mockClear();

      self.controller.searchSubject.next('Joey');
      self.scheduler.maxFrames = 1800;
      self.scheduler.flush();

      expect(
        self.controller.designationsService.productSearch,
      ).toHaveBeenCalledWith({ keyword: 'Joey' });
    });

    it('should set the state to initial on an empty query', () => {
      self.controller.searchSubject.next('');
      self.scheduler.flush();

      expect(
        self.controller.designationsService.productSearch,
      ).not.toHaveBeenCalled();
      expect(self.controller.searchState).toEqual('initial');
    });
  });

  describe('onSearchChange', () => {
    beforeEach(() => {
      jest
        .spyOn(self.controller.searchSubject, 'next')
        .mockImplementation(() => {});
    });

    it('should add the current search term to the stream', () => {
      self.controller.search = 'Andy';
      self.controller.onSearchChange();

      expect(self.controller.searchSubject.next).toHaveBeenCalledWith('Andy');
    });
  });

  describe('gatherSelections', () => {
    beforeEach(() => {
      self.controller.results = [
        { result: 1 },
        { result: 2, _selectedGift: true },
        { result: 3 },
        { result: 4, _selectedGift: true },
      ];
    });

    it('should notify the parent component of the selected gifts when using checkboxes', () => {
      self.controller.selectable = 'checkbox';
      self.controller.gatherSelections();

      expect(self.controller.onSelection).toHaveBeenCalledWith({
        selectedRecipients: [
          { result: 2, _selectedGift: true },
          { result: 4, _selectedGift: true },
        ],
      });
    });

    it('should notify the parent component of the selected gift when using radio buttons', () => {
      self.controller.selectable = 'radio';
      self.controller.gatherSelections(self.controller.results[1]);

      expect(self.controller.onSelection).toHaveBeenCalledWith({
        selectedRecipient: { result: 2, _selectedGift: true },
      });

      expect(self.controller.results).toEqual([
        { result: 1, _selectedGift: false },
        { result: 2, _selectedGift: true },
        { result: 3, _selectedGift: false },
        { result: 4, _selectedGift: false },
      ]);
    });
  });
});

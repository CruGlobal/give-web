import angular from 'angular';
import 'angular-mocks';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import module from './searchResults.component';

describe('searchResults', function () {
  beforeEach(angular.mock.module(module.name));
  let $ctrl, $rootScope, $location;

  beforeEach(inject(function (
    _$componentController_,
    _$rootScope_,
    _$location_,
  ) {
    $rootScope = _$rootScope_;
    $location = _$location_;
    $ctrl = _$componentController_(module.name, {
      $scope: $rootScope.$new(),
      $window: {
        location: {
          href: '/search-results.html',
          hostname: 'give.cru.org',
        },
      },
    });
  }));

  it('to be defined', function () {
    expect($ctrl).toBeDefined();
  });

  describe('requestGiveSearch', () => {
    it('request search onInit', () => {
      jest.spyOn($ctrl, 'requestGiveSearch').mockImplementation(() => {});

      $ctrl.$onInit();

      expect($ctrl.requestGiveSearch).toHaveBeenCalled();
    });

    it('changes type', () => {
      $ctrl.$onInit();

      $ctrl.searchParams = {
        keyword: 'steve',
        type: '',
      };
      $ctrl.requestGiveSearch('people');

      expect($ctrl.searchParams.type).toEqual('people');
    });

    it('pulls ministry list', () => {
      jest.spyOn($ctrl.designationsService, 'ministriesList').mockReturnValue(
        Observable.of({
          name: 'Cru Greatest Needs',
          designationNumber: '0763355',
          path: '/cru-greatestneeds',
          facet: 'ministry',
        }),
      );

      $ctrl.$onInit();
      $ctrl.requestGiveSearch('ministries');

      expect($ctrl.searchResults).toEqual({
        name: 'Cru Greatest Needs',
        designationNumber: '0763355',
        path: '/cru-greatestneeds',
        facet: 'ministry',
      });
      expect($ctrl.loadingResults).toEqual(false);
    });

    it('handles no search query', () => {
      $ctrl.$onInit();
      $ctrl.requestGiveSearch('people');

      expect($ctrl.searchResults).toEqual(null);
    });

    it('handles results from search results', () => {
      jest
        .spyOn($ctrl.designationsService, 'productSearch')
        .mockReturnValue(Observable.of([]));

      $ctrl.$onInit();
      $ctrl.searchParams = {
        keyword: 'steve',
      };

      $ctrl.requestGiveSearch('people');

      expect($ctrl.searchResults).toEqual([]);
      expect($ctrl.loadingResults).toEqual(false);
    });

    it('handles error from search results', () => {
      jest
        .spyOn($ctrl.designationsService, 'productSearch')
        .mockReturnValue(Observable.throw({}));

      $ctrl.$onInit();
      $ctrl.searchParams = {
        keyword: 'steve',
      };
      $ctrl.requestGiveSearch('people');

      expect($ctrl.searchResults).toEqual(null);
      expect($ctrl.searchError).toEqual(true);
    });

    it('fires productViewDetailsAnalyticsEvent', () => {
      jest
        .spyOn($ctrl.analyticsFactory, 'productViewDetailsEvent')
        .mockReturnValue(() => {});

      $ctrl.productViewDetailsAnalyticsEvent('product');

      expect(
        $ctrl.analyticsFactory.productViewDetailsEvent,
      ).toHaveBeenCalledWith('product');
    });
  });

  describe('submitKeywordSearch', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'requestGiveSearch').mockImplementation(() => {});
      jest.spyOn($location, 'search');
    });

    it('updates the URL params and searches in place without reloading', () => {
      $ctrl.searchParams = {
        keyword: 'steve',
        first_name: 'first',
        last_name: 'last',
        type: 'featured',
      };

      $ctrl.submitKeywordSearch();

      expect($location.search).toHaveBeenCalledWith({
        q: 'steve',
        fName: null,
        lName: null,
        type: 'featured',
      });
      expect($ctrl.requestGiveSearch).toHaveBeenCalledWith('featured');
      expect($ctrl.$window.location.href).toEqual('/search-results.html');
    });

    it('clears the name params on a new keyword search', () => {
      $ctrl.searchParams = {
        keyword: 'steve',
        first_name: 'first',
        last_name: 'last',
      };

      $ctrl.submitKeywordSearch();

      expect($ctrl.searchParams.first_name).toBeUndefined();
      expect($ctrl.searchParams.last_name).toBeUndefined();
    });
  });

  describe('submitNameSearch', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'requestGiveSearch').mockImplementation(() => {});
      jest.spyOn($location, 'search');
    });

    it('updates the URL params and searches people in place without reloading', () => {
      $ctrl.searchParams = {
        keyword: 'steve',
        first_name: 'first',
        last_name: 'last',
        type: 'people',
      };

      $ctrl.submitNameSearch();

      expect($location.search).toHaveBeenCalledWith({
        q: null,
        fName: 'first',
        lName: 'last',
        type: 'people',
      });
      expect($ctrl.requestGiveSearch).toHaveBeenCalledWith('people');
      expect($ctrl.$window.location.href).toEqual('/search-results.html');
    });

    it('clears the keyword param on a new name search', () => {
      $ctrl.searchParams = {
        keyword: 'steve',
        first_name: 'first',
        last_name: 'last',
        type: 'people',
      };

      $ctrl.submitNameSearch();

      expect($ctrl.searchParams.keyword).toBeUndefined();
    });
  });

  describe('$locationChangeSuccess', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'requestGiveSearch').mockImplementation(() => {});
    });

    it('re-reads params and re-runs the search when the URL changes (back/forward)', () => {
      $ctrl.$onInit();
      $ctrl.requestGiveSearch.mockClear();

      $location.search({ q: 'new keyword', type: 'featured' });
      $rootScope.$broadcast('$locationChangeSuccess');

      expect($ctrl.searchParams.keyword).toEqual('new keyword');
      expect($ctrl.requestGiveSearch).toHaveBeenCalledWith('featured');
    });

    it('does not re-run the search when the params have not changed', () => {
      $location.search({ q: 'steve' });
      $ctrl.$onInit();
      $ctrl.requestGiveSearch.mockClear();

      $rootScope.$broadcast('$locationChangeSuccess');

      expect($ctrl.requestGiveSearch).not.toHaveBeenCalled();
    });
  });

  describe('buildVanity', () => {
    it('should replace a full url with a proper vanity', () => {
      const fullUrl =
        'https://localhost.cru.org/designations/0/1/2/3/4/0123456.html';
      const expectedVanity = 'https://localhost.cru.org/0123456';
      expect($ctrl.buildVanity(fullUrl)).toEqual(expectedVanity);
    });

    it('should not break an already-vanity url', () => {
      const fullUrl = 'https://localhost.cru.org/0123456';
      expect($ctrl.buildVanity(fullUrl)).toEqual(fullUrl);
    });

    it('should not break a non-staff page url', () => {
      const fullUrl = 'https://localhost.cru.org/give-all-money-now';
      expect($ctrl.buildVanity(fullUrl)).toEqual(fullUrl);
    });
  });
});

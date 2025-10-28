/* eslint-disable angular/no-private-call */
import angular from 'angular';
import 'angular-mocks';
import module from './receipts.filter';

describe('filterByYear filter', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};
  var receipts = [
    {
      'transaction-date': {
        'display-value': '2016-10-10',
      },
    },
    {
      'transaction-date': {
        'display-value': '2016-15-10',
      },
    },
    {
      'transaction-date': {
        'display-value': '2015-10-10',
      },
    },
  ];

  beforeEach(inject(function ($filter) {
    self.$filter = $filter;
  }));

  it('should return the whole list', () => {
    expect(self.$filter('filterByYear')(receipts).length).toBe(3);
  });

  it('should return only 2015 list', () => {
    expect(self.$filter('filterByYear')(receipts, 2015).length).toBe(1);
  });

  it('should return only 2016 list', () => {
    expect(self.$filter('filterByYear')(receipts, 2016).length).toBe(2);
  });
});

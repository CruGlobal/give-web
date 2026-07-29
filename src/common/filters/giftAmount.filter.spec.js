import angular from 'angular';
import 'angular-mocks';
import module from './giftAmount.filter';

describe('giftAmount filter', () => {
  beforeEach(angular.mock.module(module.name));
  let giftAmount;

  beforeEach(inject(($filter) => {
    giftAmount = $filter('giftAmount');
  }));

  it('should format a whole dollar amount without cents', () => {
    expect(giftAmount(50)).toEqual('$50');
  });

  it('should keep cents when the amount has them', () => {
    expect(giftAmount(49.99)).toEqual('$49.99');
  });

  it('should keep cents on a string amount', () => {
    expect(giftAmount('50.00')).toEqual('$50.00');
  });

  it('should separate thousands', () => {
    expect(giftAmount(1234)).toEqual('$1,234');
    expect(giftAmount(12345.67)).toEqual('$12,345.67');
  });

  it('should pad a single decimal place', () => {
    expect(giftAmount(123.4)).toEqual('$123.40');
  });
});

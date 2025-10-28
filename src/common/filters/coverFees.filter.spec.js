import angular from 'angular';
import 'angular-mocks';
import module from './coverFees.filter';

describe('coverFees filter', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject((orderService, $filter) => {
    self.$filter = $filter;
    self.orderService = orderService;
  }));

  it('to be defined', () => {
    expect(self.$filter).toBeDefined();
  });

  const amount = 50;
  const amountWithFees = 51.2;
  const price = '$50.00';
  const priceWithFees = '$51.20';

  // Note: such an item would never exist, but contains all possible fields for testing purposes
  const item = {
    amount: amount,
    amountWithFees: amountWithFees,
    price: price,
    priceWithFees: priceWithFees,
    total: price,
    totalWithFees: priceWithFees,
    frequencyTotals: [{ frequency: 'Single', totalWithFees: priceWithFees }],
    cartTotal: amount,
    cartTotalDisplay: price,
  };

  it('should use the original price', () => {
    jest
      .spyOn(self.orderService, 'retrieveCoverFeeDecision')
      .mockImplementationOnce(() => false);
    expect(self.$filter('coverFeesFilter')(price, item, 'price')).toEqual(
      item.price,
    );
  });

  it('should use the price with fees', () => {
    jest
      .spyOn(self.orderService, 'retrieveCoverFeeDecision')
      .mockImplementationOnce(() => true);
    expect(self.$filter('coverFeesFilter')(price, item, 'price')).toEqual(
      item.priceWithFees,
    );
  });

  it('should use the original total', () => {
    jest
      .spyOn(self.orderService, 'retrieveCoverFeeDecision')
      .mockImplementationOnce(() => false);
    expect(self.$filter('coverFeesFilter')(price, item, 'total')).toEqual(
      item.total,
    );
  });

  it('should use the total with fees', () => {
    jest
      .spyOn(self.orderService, 'retrieveCoverFeeDecision')
      .mockImplementationOnce(() => true);
    expect(self.$filter('coverFeesFilter')(price, item, 'total')).toEqual(
      item.totalWithFees,
    );
  });

  it('should use the original cartTotal', () => {
    jest
      .spyOn(self.orderService, 'retrieveCoverFeeDecision')
      .mockImplementationOnce(() => false);
    expect(self.$filter('coverFeesFilter')(price, item, 'cartTotal')).toEqual(
      item.cartTotalDisplay,
    );
  });

  it('should use the cartTotal with fees', () => {
    jest
      .spyOn(self.orderService, 'retrieveCoverFeeDecision')
      .mockImplementationOnce(() => true);
    expect(self.$filter('coverFeesFilter')(price, item, 'cartTotal')).toEqual(
      item.frequencyTotals[0].totalWithFees,
    );
  });
});

import {validPaymentMethods, validPaymentMethod} from './validPaymentMethods';

describe('validPaymentMethods', () => {
  beforeEach(() => {
    jasmine.clock().mockDate(new Date(2015, 0, 10));
  });
  it('should return bank accounts', () => {
    let paymentMethods = [{
      self: {
        type: 'elasticpath.bankaccounts.bank-account'
      }
    }];
    expect(validPaymentMethods(paymentMethods)).toEqual(paymentMethods);
  });
  it('should return active credit cards', () => {
    let paymentMethods = [{
      self: {
        type: 'cru.creditcards.named-credit-card'
      },
      'expiry-month': '01',
      'expiry-year': '2015'
    }];
    expect(validPaymentMethods(paymentMethods)).toEqual(paymentMethods);
  });
  it('should filter out inactive credit cards', () => {
    let paymentMethods = [{
      self: {
        type: 'cru.creditcards.named-credit-card'
      },
      'expiry-month': '12',
      'expiry-year': '2014'
    }];
    expect(validPaymentMethods(paymentMethods)).toEqual([]);
  });
  it('should handle no payment methods', () => {
    let paymentMethods = [];
    expect(validPaymentMethods(paymentMethods)).toEqual([]);
  });
  it('should handle several payment methods', () => {
    let paymentMethods = [
      {
        self: {
          type: 'elasticpath.bankaccounts.bank-account'
        }
      },
      {
        self: {
          type: 'cru.creditcards.named-credit-card'
        },
        'expiry-month': '01',
        'expiry-year': '2015'
      },
      {
        self: {
          type: 'cru.creditcards.named-credit-card'
        },
        'expiry-month': '12',
        'expiry-year': '2014'
      },
      {
        self: {
          type: 'cru.creditcards.named-credit-card'
        },
        'expiry-month': '02',
        'expiry-year': '2015'
      },
      {
        self: {
          type: 'elasticpath.bankaccounts.bank-account'
        }
      },
      {
        self: {
          type: 'cru.creditcards.named-credit-card'
        },
        'expiry-month': '01',
        'expiry-year': '2014'
      },
      {
        self: {
          type: 'cru.creditcards.named-credit-card'
        },
        'expiry-month': '01',
        'expiry-year': '2016'
      }
    ];
    expect(validPaymentMethods(paymentMethods)).toEqual([
      paymentMethods[0],
      paymentMethods[1],
      paymentMethods[3],
      paymentMethods[4],
      paymentMethods[6]
    ]);
  });
});

describe('validPaymentMethod', () => {
  beforeEach(() => {
    jasmine.clock().mockDate(new Date(2015, 0, 10));
  });
  it('should consider bank accounts valid', () => {
    let paymentMethod = {
      self: {
        type: 'elasticpath.bankaccounts.bank-account'
      }
    };
    expect(validPaymentMethod(paymentMethod)).toEqual(true);
  });
  it('should consider unexpired credit cards valid', () => {
    let paymentMethod = {
      self: {
        type: 'cru.creditcards.named-credit-card'
      },
      'expiry-month': '01',
      'expiry-year': '2015'
    };
    expect(validPaymentMethod(paymentMethod)).toEqual(true);
  });
  it('should consider expired credit cards invalid', () => {
    let paymentMethod = {
      self: {
        type: 'cru.creditcards.named-credit-card'
      },
      'expiry-month': '12',
      'expiry-year': '2014'
    };
    expect(validPaymentMethod(paymentMethod)).toEqual(false);
  });
});

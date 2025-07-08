import sortPaymentMethods from 'common/services/paymentHelpers/paymentMethodSort';

describe('paymentMethodSort', () => {
  const checkingAccount1 = {
    self: {
      type: 'paymentinstruments.payment-instrument',
    },
    'account-type': 'Checking',
    'bank-name': 'First Bank',
  };
  const checkingAccount2 = {
    self: {
      type: 'paymentinstruments.payment-instrument',
    },
    'account-type': 'Checking',
    'bank-name': 'Second Bank',
  };
  const savingsAccount1 = {
    self: {
      type: 'paymentinstruments.payment-instrument',
    },
    'account-type': 'Savings',
    'bank-name': 'Third Bank',
  };
  const savingsAccount2 = {
    self: {
      type: 'paymentinstruments.payment-instrument',
    },
    'account-type': 'Savings',
    'bank-name': 'Third Bank',
  };
  const creditCard1 = {
    self: {
      type: 'paymentinstruments.payment-instrument',
    },
    'card-type': 'Visa',
    'expiry-month': '11',
    'expiry-year': '2019',
  };
  const creditCard2 = {
    self: {
      type: 'paymentinstruments.payment-instrument',
    },
    'card-type': 'Visa',
    'expiry-month': '12',
    'expiry-year': '2019',
  };
  const creditCard3 = {
    self: {
      type: 'paymentinstruments.payment-instrument',
    },
    'card-type': 'Visa',
    'expiry-month': '12',
    'expiry-year': '2018',
  };

  describe('sortPaymentMethods', () => {
    it('should put bank accounts before credit cards', () => {
      expect(sortPaymentMethods([checkingAccount1, creditCard1])).toEqual([
        checkingAccount1,
        creditCard1,
      ]);
      expect(sortPaymentMethods([creditCard1, checkingAccount1])).toEqual([
        checkingAccount1,
        creditCard1,
      ]);
    });

    it('should put checking accounts before savings accounts', () => {
      expect(sortPaymentMethods([checkingAccount1, savingsAccount1])).toEqual([
        checkingAccount1,
        savingsAccount1,
      ]);
      expect(sortPaymentMethods([savingsAccount1, checkingAccount1])).toEqual([
        checkingAccount1,
        savingsAccount1,
      ]);
    });

    it('should put credit cards expiring farther in the future before those expiring sooner', () => {
      expect(
        sortPaymentMethods([creditCard1, creditCard2, creditCard3]),
      ).toEqual([creditCard2, creditCard1, creditCard3]);
      expect(
        sortPaymentMethods([creditCard1, creditCard3, creditCard2]),
      ).toEqual([creditCard2, creditCard1, creditCard3]);
      expect(
        sortPaymentMethods([creditCard2, creditCard1, creditCard3]),
      ).toEqual([creditCard2, creditCard1, creditCard3]);
      expect(
        sortPaymentMethods([creditCard2, creditCard3, creditCard1]),
      ).toEqual([creditCard2, creditCard1, creditCard3]);
      expect(
        sortPaymentMethods([creditCard3, creditCard1, creditCard2]),
      ).toEqual([creditCard2, creditCard1, creditCard3]);
      expect(
        sortPaymentMethods([creditCard3, creditCard2, creditCard1]),
      ).toEqual([creditCard2, creditCard1, creditCard3]);
    });

    it('should sort all payment methods into the correct order', () => {
      // Sorted
      expect(
        sortPaymentMethods([
          checkingAccount1,
          checkingAccount2,
          savingsAccount1,
          savingsAccount2,
          creditCard2,
          creditCard1,
          creditCard3,
        ]),
      ).toEqual([
        checkingAccount1,
        checkingAccount2,
        savingsAccount1,
        savingsAccount2,
        creditCard2,
        creditCard1,
        creditCard3,
      ]);
      // Reverse
      expect(
        sortPaymentMethods([
          creditCard3,
          creditCard1,
          creditCard2,
          savingsAccount1,
          savingsAccount2,
          checkingAccount1,
          checkingAccount2,
        ]),
      ).toEqual([
        checkingAccount1,
        checkingAccount2,
        savingsAccount1,
        savingsAccount2,
        creditCard2,
        creditCard1,
        creditCard3,
      ]);
      // Random
      expect(
        sortPaymentMethods([
          savingsAccount1,
          creditCard3,
          checkingAccount1,
          savingsAccount2,
          creditCard1,
          checkingAccount2,
          creditCard2,
        ]),
      ).toEqual([
        checkingAccount1,
        checkingAccount2,
        savingsAccount1,
        savingsAccount2,
        creditCard2,
        creditCard1,
        creditCard3,
      ]);
    });

    it("since bank accounts of the same type don't have an order, it should keep those in the same relative order", () => {
      expect(
        sortPaymentMethods([
          checkingAccount2,
          checkingAccount1,
          savingsAccount2,
          savingsAccount1,
          creditCard2,
          creditCard1,
          creditCard3,
        ]),
      ).toEqual([
        checkingAccount2,
        checkingAccount1,
        savingsAccount2,
        savingsAccount1,
        creditCard2,
        creditCard1,
        creditCard3,
      ]);
    });
  });
});

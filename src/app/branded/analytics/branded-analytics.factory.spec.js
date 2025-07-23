import angular from 'angular';
import 'angular-mocks';
import moment from 'moment';

import module from './branded-analytics.factory';

const productData = {
  designationNumber: '1234567',
  displayName: 'Staff Person',
  orgId: 'CRU',
  designationType: 'STAFF',
};

describe('branded analytics factory', () => {
  beforeEach(angular.mock.module(module.name));

  const self = {};
  beforeEach(inject((brandedAnalyticsFactory, $window) => {
    self.brandedAnalyticsFactory = brandedAnalyticsFactory;
    self.$window = $window;
    self.$window.dataLayer = [];
  }));

  describe('beginCheckout', () => {
    it('should silently ignore bad data', () => {
      self.brandedAnalyticsFactory.beginCheckout();
      expect(self.$window.dataLayer).toEqual([{ ecommerce: null }]);
    });

    it('should add begin_checkout event', () => {
      self.brandedAnalyticsFactory.beginCheckout(productData);

      expect(self.$window.dataLayer).toEqual([
        { ecommerce: null },
        {
          event: 'begin_checkout',
          ecommerce: {
            items: [
              {
                item_id: '1234567',
                item_name: 'Staff Person',
                item_brand: 'CRU',
                item_category: 'STAFF',
                currency: 'USD',
                price: undefined,
                quantity: '1',
              },
            ],
          },
        },
      ]);
    });
  });

  describe('addPaymentInfo', () => {
    beforeEach(() => {
      self.brandedAnalyticsFactory.saveDonorDetails({
        'donor-type': 'Household',
      });
      self.brandedAnalyticsFactory.saveTestingTransaction(false);
      self.brandedAnalyticsFactory.savePaymentType('Visa', true);
      self.brandedAnalyticsFactory.saveCoverFees(false);
    });

    it('should silently ignore bad data', () => {
      self.brandedAnalyticsFactory.addPaymentInfo();
      expect(self.$window.dataLayer).toEqual([{ ecommerce: null }]);
    });

    it('should add add_payment_info event', () => {
      self.brandedAnalyticsFactory.saveItem({
        amount: 100,
        amountWithFees: 102.5,
        frequency: 'Single',
        giftStartDate: null,
        ...productData,
      });
      self.brandedAnalyticsFactory.addPaymentInfo();

      expect(self.$window.dataLayer).toEqual([
        { ecommerce: null },
        {
          event: 'add_payment_info',
          ecommerce: {
            payment_type: 'Visa',
            currency: 'USD',
            donator_type: 'Household',
            pays_processing: 'no',
            value: '100.00',
            processing_fee: '2.50',
            testing_transaction: false,
            items: [
              {
                item_id: '1234567',
                item_name: 'Staff Person',
                item_brand: 'CRU',
                item_category: 'STAFF',
                item_variant: 'single',
                currency: 'USD',
                price: '100.00',
                quantity: '1',
                recurring_date: undefined,
              },
            ],
          },
        },
      ]);
    });

    it('with testing transaction should add add_payment_info event', () => {
      self.brandedAnalyticsFactory.saveTestingTransaction(true);
      self.brandedAnalyticsFactory.saveItem({
        amount: 100,
        amountWithFees: 102.5,
        frequency: 'Single',
        giftStartDate: null,
        ...productData,
      });
      self.brandedAnalyticsFactory.addPaymentInfo();

      expect(self.$window.dataLayer).toEqual([
        { ecommerce: null },
        {
          event: 'add_payment_info',
          ecommerce: {
            payment_type: 'Visa',
            currency: 'USD',
            donator_type: 'Household',
            pays_processing: 'no',
            value: '100.00',
            processing_fee: '2.50',
            testing_transaction: true,
            items: [
              {
                item_id: '1234567',
                item_name: 'Staff Person',
                item_brand: 'CRU',
                item_category: 'STAFF',
                item_variant: 'single',
                currency: 'USD',
                price: '100.00',
                quantity: '1',
                recurring_date: undefined,
              },
            ],
          },
        },
      ]);
    });

    it('with paying fees should add add_payment_info event', () => {
      self.brandedAnalyticsFactory.saveCoverFees(true);
      self.brandedAnalyticsFactory.saveItem({
        amount: 100,
        amountWithFees: 102.5,
        frequency: 'Single',
        giftStartDate: null,
        ...productData,
      });
      self.brandedAnalyticsFactory.addPaymentInfo();

      expect(self.$window.dataLayer).toEqual([
        { ecommerce: null },
        {
          event: 'add_payment_info',
          ecommerce: {
            payment_type: 'Visa',
            currency: 'USD',
            donator_type: 'Household',
            pays_processing: 'yes',
            value: '102.50',
            processing_fee: '2.50',
            testing_transaction: false,
            items: [
              {
                item_id: '1234567',
                item_name: 'Staff Person',
                item_brand: 'CRU',
                item_category: 'STAFF',
                item_variant: 'single',
                currency: 'USD',
                price: '102.50',
                quantity: '1',
                recurring_date: undefined,
              },
            ],
          },
        },
      ]);
    });

    it('with bank account should add add_payment_info event', () => {
      self.brandedAnalyticsFactory.savePaymentType('Checking', false);
      self.brandedAnalyticsFactory.saveItem({
        amount: 100,
        amountWithFees: 102.5,
        frequency: 'Single',
        giftStartDate: null,
        ...productData,
      });
      self.brandedAnalyticsFactory.addPaymentInfo();

      expect(self.$window.dataLayer).toEqual([
        { ecommerce: null },
        {
          event: 'add_payment_info',
          ecommerce: {
            payment_type: 'Checking',
            currency: 'USD',
            donator_type: 'Household',
            pays_processing: undefined,
            value: '100.00',
            processing_fee: undefined,
            testing_transaction: false,
            items: [
              {
                item_id: '1234567',
                item_name: 'Staff Person',
                item_brand: 'CRU',
                item_category: 'STAFF',
                item_variant: 'single',
                currency: 'USD',
                price: '100.00',
                quantity: '1',
                recurring_date: undefined,
              },
            ],
          },
        },
      ]);
    });

    it('with monthly gift should add add_payment_info event', () => {
      self.brandedAnalyticsFactory.saveItem({
        amount: 100,
        amountWithFees: 102.5,
        frequency: 'Monthly',
        giftStartDate: moment(new Date(2024, 0, 1)),
        ...productData,
      });
      self.brandedAnalyticsFactory.addPaymentInfo();

      expect(self.$window.dataLayer).toEqual([
        { ecommerce: null },
        {
          event: 'add_payment_info',
          ecommerce: {
            payment_type: 'Visa',
            currency: 'USD',
            donator_type: 'Household',
            pays_processing: 'no',
            value: '100.00',
            processing_fee: '2.50',
            testing_transaction: false,
            items: [
              {
                item_id: '1234567',
                item_name: 'Staff Person',
                item_brand: 'CRU',
                item_category: 'STAFF',
                item_variant: 'monthly',
                currency: 'USD',
                price: '100.00',
                quantity: '1',
                recurring_date: 'January 1, 2024',
              },
            ],
          },
        },
      ]);
    });
  });

  describe('reviewOrder', () => {
    it('should add review_order event', () => {
      self.brandedAnalyticsFactory.reviewOrder();

      expect(self.$window.dataLayer).toEqual([
        { ecommerce: null },
        { event: 'review_order' },
      ]);
    });
  });

  describe('purchase', () => {
    beforeEach(() => {
      self.brandedAnalyticsFactory.saveDonorDetails({
        'donor-type': 'Household',
      });
      self.brandedAnalyticsFactory.saveTestingTransaction(false);
      self.brandedAnalyticsFactory.savePaymentType('Visa', true);
      self.brandedAnalyticsFactory.saveCoverFees(false);
      self.brandedAnalyticsFactory.savePurchase({
        rawData: {
          'purchase-number': '12345',
        },
      });
    });

    it('should silently ignore bad data', () => {
      self.brandedAnalyticsFactory.savePurchase(undefined);
      self.brandedAnalyticsFactory.purchase();
      expect(self.$window.dataLayer).toEqual([{ ecommerce: null }]);
    });

    it('should add purchase event', () => {
      self.brandedAnalyticsFactory.saveItem({
        amount: 100,
        amountWithFees: 102.5,
        frequency: 'Single',
        giftStartDate: null,
        ...productData,
      });
      self.brandedAnalyticsFactory.purchase();

      expect(self.$window.dataLayer).toEqual([
        { ecommerce: null },
        {
          event: 'purchase',
          ecommerce: {
            payment_type: 'Visa',
            currency: 'USD',
            donator_type: 'Household',
            pays_processing: 'no',
            value: '100.00',
            processing_fee: '2.50',
            transaction_id: '12345',
            testing_transaction: false,
            items: [
              {
                item_id: '1234567',
                item_name: 'Staff Person',
                item_brand: 'CRU',
                item_category: 'STAFF',
                item_variant: 'single',
                currency: 'USD',
                price: '100.00',
                quantity: '1',
                recurring_date: undefined,
              },
            ],
          },
        },
      ]);
    });

    it('with testing transaction should add purchase event', () => {
      self.brandedAnalyticsFactory.saveTestingTransaction(true);
      self.brandedAnalyticsFactory.saveItem({
        amount: 100,
        amountWithFees: 102.5,
        frequency: 'Single',
        giftStartDate: null,
        ...productData,
      });
      self.brandedAnalyticsFactory.purchase();

      expect(self.$window.dataLayer).toEqual([
        { ecommerce: null },
        {
          event: 'purchase',
          ecommerce: {
            payment_type: 'Visa',
            currency: 'USD',
            donator_type: 'Household',
            pays_processing: 'no',
            value: '100.00',
            processing_fee: '2.50',
            transaction_id: '12345',
            testing_transaction: true,
            items: [
              {
                item_id: '1234567',
                item_name: 'Staff Person',
                item_brand: 'CRU',
                item_category: 'STAFF',
                item_variant: 'single',
                currency: 'USD',
                price: '100.00',
                quantity: '1',
                recurring_date: undefined,
              },
            ],
          },
        },
      ]);
    });

    it('with paying fees should add purchase event', () => {
      self.brandedAnalyticsFactory.saveCoverFees(true);
      self.brandedAnalyticsFactory.saveItem({
        amount: 100,
        amountWithFees: 102.5,
        frequency: 'Single',
        giftStartDate: null,
        ...productData,
      });
      self.brandedAnalyticsFactory.purchase();

      expect(self.$window.dataLayer).toEqual([
        { ecommerce: null },
        {
          event: 'purchase',
          ecommerce: {
            payment_type: 'Visa',
            currency: 'USD',
            donator_type: 'Household',
            pays_processing: 'yes',
            value: '102.50',
            processing_fee: '2.50',
            transaction_id: '12345',
            testing_transaction: false,
            items: [
              {
                item_id: '1234567',
                item_name: 'Staff Person',
                item_brand: 'CRU',
                item_category: 'STAFF',
                item_variant: 'single',
                currency: 'USD',
                price: '102.50',
                quantity: '1',
                recurring_date: undefined,
              },
            ],
          },
        },
      ]);
    });

    it('with bank account should add purchase event', () => {
      self.brandedAnalyticsFactory.savePaymentType('Checking', false);
      self.brandedAnalyticsFactory.saveItem({
        amount: 100,
        amountWithFees: 102.5,
        frequency: 'Single',
        giftStartDate: null,
        ...productData,
      });
      self.brandedAnalyticsFactory.purchase();

      expect(self.$window.dataLayer).toEqual([
        { ecommerce: null },
        {
          event: 'purchase',
          ecommerce: {
            payment_type: 'Checking',
            currency: 'USD',
            donator_type: 'Household',
            pays_processing: undefined,
            value: '100.00',
            processing_fee: undefined,
            transaction_id: '12345',
            testing_transaction: false,
            items: [
              {
                item_id: '1234567',
                item_name: 'Staff Person',
                item_brand: 'CRU',
                item_category: 'STAFF',
                item_variant: 'single',
                currency: 'USD',
                price: '100.00',
                quantity: '1',
                recurring_date: undefined,
              },
            ],
          },
        },
      ]);
    });

    it('with monthly gift should add purchase event', () => {
      self.brandedAnalyticsFactory.saveItem({
        amount: 100,
        amountWithFees: 102.5,
        frequency: 'Monthly',
        giftStartDate: moment(new Date(2024, 0, 1)),
        ...productData,
      });
      self.brandedAnalyticsFactory.purchase();

      expect(self.$window.dataLayer).toEqual([
        { ecommerce: null },
        {
          event: 'purchase',
          ecommerce: {
            payment_type: 'Visa',
            currency: 'USD',
            donator_type: 'Household',
            pays_processing: 'no',
            value: '100.00',
            processing_fee: '2.50',
            transaction_id: '12345',
            testing_transaction: false,
            items: [
              {
                item_id: '1234567',
                item_name: 'Staff Person',
                item_brand: 'CRU',
                item_category: 'STAFF',
                item_variant: 'monthly',
                currency: 'USD',
                price: '100.00',
                quantity: '1',
                recurring_date: 'January 1, 2024',
              },
            ],
          },
        },
      ]);
    });
  });

  describe('checkoutChange', () => {
    it('contact should add review_order event', () => {
      self.brandedAnalyticsFactory.checkoutChange('contact');

      expect(self.$window.dataLayer).toEqual([
        {
          event: 'checkout_change_option',
          checkout_option_changed: 'contact info',
        },
      ]);
    });

    it('cart should add review_order event', () => {
      self.brandedAnalyticsFactory.checkoutChange('cart');

      expect(self.$window.dataLayer).toEqual([
        { event: 'checkout_change_option', checkout_option_changed: 'gift' },
      ]);
    });

    it('payment should add review_order event', () => {
      self.brandedAnalyticsFactory.checkoutChange('payment');

      expect(self.$window.dataLayer).toEqual([
        {
          event: 'checkout_change_option',
          checkout_option_changed: 'payment method',
        },
      ]);
    });
  });
});

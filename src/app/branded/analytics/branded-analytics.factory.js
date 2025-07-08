import '../../analytics/analytics.module';
import angular from 'angular';

const factoryName = 'brandedAnalyticsFactory';

const brandedState = {
  coverFees: undefined,
  donorType: undefined,
  isCreditCard: undefined,
  item: undefined,
  paymentType: undefined,
  purchase: undefined,
  testingTransaction: undefined,
};

// Generate a datalayer ecommerce object
function generateEcommerce(siebelTransactionId) {
  const item = brandedState.item;
  const amountPaid = (
    brandedState.isCreditCard && brandedState.coverFees
      ? item.amountWithFees
      : item.amount
  ).toFixed(2);

  return {
    payment_type: brandedState.paymentType,
    currency: 'USD',
    donator_type: brandedState.donorType,
    pays_processing: brandedState.isCreditCard
      ? brandedState.coverFees
        ? 'yes'
        : 'no'
      : undefined,
    value: amountPaid,
    processing_fee: brandedState.isCreditCard
      ? (item.amountWithFees - item.amount).toFixed(2)
      : undefined,
    transaction_id: siebelTransactionId,
    testing_transaction: Boolean(brandedState.testingTransaction),
    items: [
      {
        item_id: item.designationNumber,
        item_name: item.displayName,
        item_brand: item.orgId,
        item_category: item.designationType,
        item_variant: item.frequency.toLowerCase(),
        currency: 'USD',
        price: amountPaid,
        quantity: '1',
        recurring_date: item.giftStartDate
          ? item.giftStartDate.format('MMMM D, YYYY')
          : undefined,
      },
    ],
  };
}

function suppressErrors(func) {
  return function wrapper(...args) {
    try {
      return func.apply(this, args);
    } catch {}
  };
}

const brandedAnalyticsFactory = /* @ngInject */ function ($window) {
  return {
    saveCoverFees: suppressErrors(function (coverFees) {
      brandedState.coverFees = coverFees;
    }),

    saveDonorDetails: suppressErrors(function (donorDetails) {
      brandedState.donorType = donorDetails['donor-type'];
    }),

    saveItem: suppressErrors(function (item) {
      brandedState.item = item;
    }),

    savePaymentType: suppressErrors(function (paymentType, isCreditCard) {
      brandedState.paymentType = paymentType;
      brandedState.isCreditCard = isCreditCard;
    }),

    savePurchase: suppressErrors(function (purchase) {
      brandedState.purchase = purchase;
    }),

    saveTestingTransaction: suppressErrors(function (testingTransaction) {
      brandedState.testingTransaction = testingTransaction;
    }),

    beginCheckout: suppressErrors(function (productData) {
      $window.dataLayer = $window.dataLayer || [];
      $window.dataLayer.push({ ecommerce: null });
      $window.dataLayer.push({
        event: 'begin_checkout',
        ecommerce: {
          items: [
            {
              item_id: productData.designationNumber,
              item_name: productData.displayName,
              item_brand: productData.orgId,
              item_category: productData.designationType,
              currency: 'USD',
              price: undefined,
              quantity: '1',
            },
          ],
        },
      });
    }),

    // saveCoverFees, saveDonorDetails, saveItem, savePaymentType, and saveTestingTransaction should have been called before this
    addPaymentInfo: suppressErrors(function () {
      $window.dataLayer = $window.dataLayer || [];
      $window.dataLayer.push({ ecommerce: null });
      $window.dataLayer.push({
        event: 'add_payment_info',
        ecommerce: generateEcommerce(undefined),
      });
    }),

    reviewOrder: suppressErrors(function () {
      $window.dataLayer = $window.dataLayer || [];
      $window.dataLayer.push({ ecommerce: null });
      $window.dataLayer.push({
        event: 'review_order',
      });
    }),

    // saveCoverFees, saveDonorDetails, saveItem, savePaymentType, savePurchase, and saveTestingTransaction should have been called before this
    purchase: suppressErrors(function () {
      $window.dataLayer = $window.dataLayer || [];
      $window.dataLayer.push({ ecommerce: null });
      $window.dataLayer.push({
        event: 'purchase',
        ecommerce: generateEcommerce(
          brandedState.purchase.rawData['purchase-number'],
        ),
      });
    }),

    checkoutChange: suppressErrors(function (newStep) {
      let optionChanged;
      switch (newStep) {
        case 'contact':
          optionChanged = 'contact info';
          break;
        case 'cart':
          optionChanged = 'gift';
          break;
        case 'payment':
          optionChanged = 'payment method';
          break;
      }

      $window.dataLayer = $window.dataLayer || [];
      $window.dataLayer.push({
        event: 'checkout_change_option',
        checkout_option_changed: optionChanged,
      });
    }),
  };
};

export default angular
  .module('analytics')
  .factory(factoryName, brandedAnalyticsFactory);

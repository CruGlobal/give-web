import angular from 'angular';
import 'angular-mocks';
import moment from 'moment';

import module from './analytics.factory';

describe('analytics factory', () => {
  beforeEach(angular.mock.module(module.name, 'environment'));

  const self = {};
  beforeEach(inject((analyticsFactory, envService, $window) => {
    self.analyticsFactory = analyticsFactory;
    self.envService = envService;
    self.$window = $window;
    self.$window.digitalData = { cart: {} };
    self.$window.dataLayer = [];

    self.$window.sessionStorage.clear();
    self.$window.localStorage.clear();

    Date.now = jest.fn(() => new Date('2023-04-05T01:02:03.000Z'));
  }));

  describe('handleCheckoutFormErrors', () => {
    const form = {
      $valid: false,
      $dirty: true,
      firstName: {
        $invalid: true,
        $error: {
          required: true,
        },
      },
      lastName: {
        $invalid: false,
        $error: {},
      },
      middleName: {
        $invalid: true,
        $error: {
          capitalized: true,
          maxLength: true,
        },
      },
    };

    it('calls checkoutFieldError for each error', () => {
      jest.spyOn(self.analyticsFactory, 'checkoutFieldError');
      jest
        .spyOn(self.envService, 'read')
        .mockImplementation((name) => name === 'isCheckout');

      self.analyticsFactory.handleCheckoutFormErrors(form);
      expect(self.analyticsFactory.checkoutFieldError.mock.calls).toEqual([
        ['firstName', 'required'],
        ['middleName', 'capitalized'],
        ['middleName', 'maxLength'],
      ]);
    });

    it('does nothing when not checkout out', () => {
      jest.spyOn(self.analyticsFactory, 'checkoutFieldError');
      jest.spyOn(self.envService, 'read').mockReturnValue(false);

      self.analyticsFactory.handleCheckoutFormErrors(form);
      expect(self.analyticsFactory.checkoutFieldError).not.toHaveBeenCalled();
    });
  });

  describe('cartAdd', () => {
    const itemConfig = {
      'campaign-page': '',
      'jcr-title': 'John Doe',
      RECURRING_DAY_OF_MONTH: '13',
      RECURRING_START_MONTH: '09',
      AMOUNT: 50,
    };
    const productData = {
      uri: 'items/crugive/a5t4fmspmfpwpqv3le7hgksifu=',
      frequencies: [
        {
          name: 'SEMIANNUAL',
          display: 'Semi-Annually',
          selectAction:
            '/itemselections/crugive/a5t4fmspmfpwpqv3le7hgksifu=/options/izzgk4lvmvxgg6i=/values/kncu2skbjzhfkqkm=/selector',
        },
        {
          name: 'QUARTERLY',
          display: 'Quarterly',
          selectAction:
            '/itemselections/crugive/a5t4fmspmfpwpqv3le7hgksifu=/options/izzgk4lvmvxgg6i=/values/kfkucusuivjeywi=/selector',
        },
        {
          name: 'MON',
          display: 'Monthly',
          selectAction:
            '/itemselections/crugive/a5t4fmspmfpwpqv3le7hgksifu=/options/izzgk4lvmvxgg6i=/values/jvhu4=/selector',
        },
        {
          name: 'ANNUAL',
          display: 'Annually',
          selectAction:
            '/itemselections/crugive/a5t4fmspmfpwpqv3le7hgksifu=/options/izzgk4lvmvxgg6i=/values/ifhe4vkbjq=/selector',
        },
        {
          name: 'NA',
          display: 'Single',
          selectAction: '',
        },
      ],
      frequency: 'MON',
      displayName: 'International Staff',
      designationType: 'Staff',
      code: '0643021',
      designationNumber: '0643021',
      orgId: 'STAFF',
    };

    it('should add an monthly item to the datalayer', () => {
      jest
        .spyOn(self.envService, 'read')
        .mockImplementation((name) => name === 'isCheckout');

      self.analyticsFactory.cartAdd(itemConfig, productData);

      expect(self.$window.dataLayer.length).toEqual(1);
      expect(self.$window.dataLayer[0].event).toEqual('add_to_cart');
      expect(self.$window.dataLayer[0].ecommerce.value).toEqual(
        itemConfig.AMOUNT.toFixed(2),
      );
      expect(self.$window.dataLayer[0].ecommerce.items[0]).toEqual({
        item_id: productData.code,
        item_name: productData.displayName,
        item_brand: productData.orgId,
        item_category: productData.designationType.toLowerCase(),
        item_variant: 'monthly',
        currency: 'USD',
        price: itemConfig.AMOUNT.toString(),
        quantity: '1',
        recurring_date: 'September 13, 2023',
        testing_transaction: 'false',
      });
    });

    it('should add an single item to the datalayer', () => {
      productData.frequency = 'NA';
      jest
        .spyOn(self.envService, 'read')
        .mockImplementation((name) => name === 'isCheckout');

      self.analyticsFactory.cartAdd(itemConfig, productData);

      expect(self.$window.dataLayer.length).toEqual(1);
      expect(self.$window.dataLayer[0].event).toEqual('add_to_cart');
      expect(self.$window.dataLayer[0].ecommerce.value).toEqual(
        itemConfig.AMOUNT.toFixed(2),
      );
      expect(self.$window.dataLayer[0].ecommerce.items[0]).toEqual({
        item_id: productData.code,
        item_name: productData.displayName,
        item_brand: productData.orgId,
        item_category: productData.designationType.toLowerCase(),
        item_variant: 'single',
        currency: 'USD',
        price: itemConfig.AMOUNT.toString(),
        quantity: '1',
        recurring_date: undefined,
        testing_transaction: 'false',
      });
    });
  });

  describe('buildProductVar', () => {
    const cartData = {
      id: 'geydmm3cgfsgiljygjtgeljumfstkllbgfrdkljvgf',
      items: [
        {
          uri: '/carts/crugive/geydmm3cgfsgiljygjtgeljumfstkllbgfrdkljvgf/lineitems/g44wcnzrhe3wgllcmezdmljugvqtgllc',
          code: '0048461_mon',
          orgId: 'STAFF',
          displayName: 'John Doe',
          designationType: 'Staff',
          price: '$50.00',
          priceWithFees: '$51.20',
          config: {
            AMOUNT: 50,
            AMOUNT_WITH_FEES: 51.2,
            CAMPAIGN_CODE: '',
            DONATION_SERVICES_COMMENTS: '',
            PREMIUM_CODE: '',
            RECIPIENT_COMMENTS: '',
            RECURRING_DAY_OF_MONTH: '15',
            RECURRING_START_MONTH: '09',
          },
          frequency: 'Monthly',
          amount: 50,
          amountWithFees: 51.2,
          designationNumber: '0048461',
          productUri:
            '/items/crugive/a5t4fmspmhbkez6cvfmucmrkykwc7q4mykr4fps5ee=',
          giftStartDate: moment(new Date(2024, 8, 15)),
          giftStartDateDaysFromNow: 361,
          giftStartDateWarning: true,
        },
      ],
      frequencyTotals: [
        {
          frequency: 'Monthly',
          amount: 50,
          amountWithFees: 51.2,
          total: '$50.00',
          totalWithFees: '$51.20',
        },
        {
          frequency: 'Single',
          amount: 0,
          amountWithFees: 0,
          total: '$0.00',
          totalWithFees: '$0.00',
        },
      ],
      cartTotal: 0,
      cartTotalDisplay: '$0.00',
    };

    it('should add data to DataLayer', () => {
      self.analyticsFactory.buildProductVar(cartData);

      expect(self.$window.digitalData.cart.id).toEqual(cartData.id);
      expect(self.$window.digitalData.cart.hash).toEqual(
        '330c050e7344971e9250',
      );
      expect(self.$window.digitalData.cart.price.cartTotal).toEqual(
        cartData.cartTotal,
      );
      expect(self.$window.digitalData.cart.item.length).toEqual(1);
    });
  });

  describe('cartRemove', () => {
    const item = {
      uri: '/carts/crugive/geydmm3cgfsgiljygjtgeljumfstkllbgfrdkljvgf/lineitems/g44wcnzrhe3wgllcmezdmljugvqtgllcmeztol',
      code: '0048461_mon',
      orgId: 'STAFF',
      displayName: 'John Doe',
      designationType: 'Staff',
      price: '$50.00',
      priceWithFees: '$51.20',
      config: {
        AMOUNT: 50,
        AMOUNT_WITH_FEES: 51.2,
        CAMPAIGN_CODE: 'CAMPAIGN',
        DONATION_SERVICES_COMMENTS: '',
        PREMIUM_CODE: '',
        RECIPIENT_COMMENTS: '',
        RECURRING_DAY_OF_MONTH: '15',
        RECURRING_START_MONTH: '09',
      },
      frequency: 'Monthly',
      amount: 50,
      amountWithFees: 51.2,
      designationNumber: '0048461',
      productUri: '/items/crugive/a5t4fmspmhbkez6cv',
      giftStartDate: moment(new Date(2024, 8, 15)),
      giftStartDateDaysFromNow: 361,
      giftStartDateWarning: true,
      removing: true,
    };

    it('should remove item from dataLayer and fire event', () => {
      jest
        .spyOn(self.envService, 'read')
        .mockImplementation((name) => name === 'isCheckout');

      self.analyticsFactory.cartRemove(item);

      expect(self.$window.digitalData.cart.item[0].attributes).toEqual({
        donationType: 'recurring donation',
        donationFrequency: item.frequency.toLowerCase(),
        siebel: {
          productType: 'designation',
          campaignCode: 'CAMPAIGN',
        },
      });
      expect(self.$window.digitalData.cart.item.length).toEqual(1);

      expect(self.$window.dataLayer[0].event).toEqual('remove_from_cart');
      expect(self.$window.dataLayer[0].ecommerce).toEqual({
        currencyCode: 'USD',
        value: item.amount.toFixed(2),
        items: [
          {
            item_id: item.designationNumber,
            item_name: item.displayName,
            item_brand: item.orgId,
            item_category: item.designationType.toLowerCase(),
            item_variant: 'monthly',
            currency: 'USD',
            price: item.amount.toString(),
            quantity: '1',
            recurring_date: 'September 15, 2024',
            testing_transaction: 'false',
          },
        ],
      });
    });
  });

  describe('checkoutStepEvent', () => {
    const cart = {
      id: 'g5stanjsgzswkllbmjtdaljuga4wmljzgnqw=',
      items: [
        {
          uri: '/carts/crugive/g5stanjsgzswkllbmjtdaljuga4wmljzgnqw/lineitems/he4wcnzvgfswgllgmizdqljumi2wkllbmjrdqljw',
          code: '0643021',
          orgId: 'STAFF',
          displayName: 'John Doe',
          designationType: 'Staff',
          price: '$50.00',
          priceWithFees: '$51.20',
          config: {
            AMOUNT: 50,
            AMOUNT_WITH_FEES: 51.2,
            CAMPAIGN_CODE: '',
            DONATION_SERVICES_COMMENTS: '',
            PREMIUM_CODE: '',
            RECIPIENT_COMMENTS: '',
            RECURRING_DAY_OF_MONTH: '',
            RECURRING_START_MONTH: '',
          },
          frequency: 'Single',
          amount: 50,
          amountWithFees: 51.2,
          designationNumber: '0643021',
          productUri: '/items/crugive/a5t4fmspm',
          giftStartDate: null,
          giftStartDateDaysFromNow: 0,
          giftStartDateWarning: false,
        },
      ],
      frequencyTotals: [
        {
          frequency: 'Single',
          amount: 50,
          amountWithFees: 51.2,
          total: '$50.00',
          totalWithFees: '$51.20',
        },
      ],
      cartTotal: 50,
      cartTotalDisplay: '$50.00',
    };
    const item = cart.items[0];
    const formattedItem = {
      item_id: item.designationNumber,
      item_name: item.displayName,
      item_brand: item.orgId,
      item_category: item.designationType.toLowerCase(),
      item_variant: 'single',
      currency: 'USD',
      price: item.amount.toString(),
      quantity: '1',
      recurring_date: undefined,
      testing_transaction: 'false',
    };

    it('should create begining checkout and checkout step DataLayer events', () => {
      self.analyticsFactory.checkoutStepEvent('contact', cart);

      expect(self.$window.dataLayer.length).toEqual(2);
      expect(self.$window.dataLayer[0]).toEqual({
        event: 'begin_checkout',
        ecommerce: {
          items: [formattedItem],
        },
      });

      expect(self.$window.dataLayer[1].event).toEqual('checkout-step');
      expect(self.$window.dataLayer[1].cartId).toEqual(cart.id);
      expect(self.$window.dataLayer[1].ecommerce).toEqual({
        currencyCode: 'USD',
        checkout: {
          actionField: {
            step: 1,
            option: '',
          },
          products: [formattedItem],
        },
      });
    });

    it('should create payment info and checkout step DataLayer events', () => {
      self.analyticsFactory.checkoutStepEvent('payment', cart);

      expect(self.$window.dataLayer.length).toEqual(2);
      expect(self.$window.dataLayer[0]).toEqual({
        event: 'add_payment_info',
      });

      expect(self.$window.dataLayer[1].event).toEqual('checkout-step');
      expect(self.$window.dataLayer[1].cartId).toEqual(cart.id);
      expect(self.$window.dataLayer[1].ecommerce).toEqual({
        currencyCode: 'USD',
        checkout: {
          actionField: {
            step: 2,
            option: '',
          },
          products: [formattedItem],
        },
      });
    });

    it('should create review order and checkout step DataLayer events', () => {
      self.analyticsFactory.checkoutStepEvent('review', cart);

      expect(self.$window.dataLayer.length).toEqual(2);
      expect(self.$window.dataLayer[0]).toEqual({
        event: 'review_order',
      });

      expect(self.$window.dataLayer[1].event).toEqual('checkout-step');
      expect(self.$window.dataLayer[1].cartId).toEqual(cart.id);
      expect(self.$window.dataLayer[1].ecommerce).toEqual({
        currencyCode: 'USD',
        checkout: {
          actionField: {
            step: 3,
            option: '',
          },
          products: [formattedItem],
        },
      });
    });
  });

  describe('checkoutStepOptionEvent', () => {
    it('should add contact checkout option event to DataLayer', () => {
      self.analyticsFactory.checkoutStepOptionEvent('Household', 'contact');
      expect(self.$window.dataLayer.length).toEqual(1);
      expect(self.$window.dataLayer[0].event).toEqual('checkout-option');
      expect(self.$window.dataLayer[0].ecommerce).toEqual({
        checkout_option: {
          actionField: {
            step: 1,
            option: 'household',
          },
        },
      });
    });
    it('should add payment checkout option event to DataLayer', () => {
      self.analyticsFactory.checkoutStepOptionEvent('Visa', 'payment');
      expect(self.$window.dataLayer.length).toEqual(1);
      expect(self.$window.dataLayer[0].event).toEqual('checkout-option');
      expect(self.$window.dataLayer[0].ecommerce).toEqual({
        checkout_option: {
          actionField: {
            step: 2,
            option: 'visa',
          },
        },
      });
    });
    it('should add review checkout option event to DataLayer', () => {
      self.analyticsFactory.checkoutStepOptionEvent('Visa', 'review');
      expect(self.$window.dataLayer.length).toEqual(1);
      expect(self.$window.dataLayer[0].event).toEqual('checkout-option');
      expect(self.$window.dataLayer[0].ecommerce).toEqual({
        checkout_option: {
          actionField: {
            step: 3,
            option: 'visa',
          },
        },
      });
    });
  });

  describe('giveGiftModal', () => {
    const productData = {
      uri: 'items/crugive/a5t4fmspmfpwpqv3le7hgksifu=',
      frequencies: [
        {
          name: 'SEMIANNUAL',
          display: 'Semi-Annually',
          selectAction:
            '/itemselections/crugive/a5t4fmspmfpwpqv3le7hgksifu=/options/izzgk4lvmvxgg6i=/values/kncu2skbjzhfkqkm=/selector',
        },
        {
          name: 'QUARTERLY',
          display: 'Quarterly',
          selectAction:
            '/itemselections/crugive/a5t4fmspmfpwpqv3le7hgksifu=/options/izzgk4lvmvxgg6i=/values/kfkucusuivjeywi=/selector',
        },
        {
          name: 'MON',
          display: 'Monthly',
          selectAction:
            '/itemselections/crugive/a5t4fmspmfpwpqv3le7hgksifu=/options/izzgk4lvmvxgg6i=/values/jvhu4=/selector',
        },
        {
          name: 'ANNUAL',
          display: 'Annually',
          selectAction:
            '/itemselections/crugive/a5t4fmspmfpwpqv3le7hgksifu=/options/izzgk4lvmvxgg6i=/values/ifhe4vkbjq=/selector',
        },
        {
          name: 'NA',
          display: 'Single',
          selectAction: '',
        },
      ],
      frequency: 'NA',
      displayName: 'International Staff',
      designationType: 'Staff',
      code: '0643021',
      designationNumber: '0643021',
      orgId: 'STAFF',
    };

    it('should push view_item event to the DataLayer', () => {
      self.analyticsFactory.giveGiftModal(productData);
      expect(self.$window.dataLayer.length).toEqual(1);
      expect(self.$window.dataLayer[0].event).toEqual('view_item');
      expect(self.$window.dataLayer[0].ecommerce).toEqual({
        currencyCode: 'USD',
        value: undefined,
        items: [
          {
            item_id: '0643021',
            item_name: 'International Staff',
            item_brand: 'STAFF',
            item_category: 'staff',
            item_variant: undefined,
            price: undefined,
            currency: 'USD',
            quantity: '1',
            recurring_date: undefined,
            testing_transaction: 'false',
          },
        ],
      });
    });
  });

  describe('productViewDetailsEvent', () => {
    const productData = {
      path: 'https://give-stage-cloud.cru.org/designations/0/6/4/3/0/0643021.html',
      designationNumber: '0643021',
      campaignPage: null,
      replacementDesignationNumber: null,
      name: 'John Doe',
      type: 'Staff',
      facet: 'person',
      startMonth: null,
      ministry: 'Staff Giving',
      orgId: 'STAFF',
    };
    it('should add product-detail-click event', () => {
      self.analyticsFactory.productViewDetailsEvent(productData);
      expect(self.$window.dataLayer.length).toEqual(1);
      expect(self.$window.dataLayer[0].event).toEqual('product-detail-click');
      expect(self.$window.dataLayer[0].ecommerce).toEqual({
        currencyCode: 'USD',
        click: {
          actionField: {
            list: 'search results',
          },
          products: [
            {
              item_id: '0643021',
              item_name: 'John Doe',
              item_brand: 'STAFF',
              item_category: 'staff',
              item_variant: undefined,
              price: undefined,
              currency: 'USD',
              quantity: '1',
              recurring_date: undefined,
              testing_transaction: 'false',
            },
          ],
        },
      });
    });
  });

  describe('transactionEvent', () => {
    const item = {
      uri: '/carts/crugive/grsgezrxhfqtsljrga3gkljugvtdaljygjqtc;/lineitems/hezwgntcmrsgmllcgu3dsljumuygcljzmjsgcljwgqzdkyr',
      code: '0643021',
      orgId: 'STAFF',
      displayName: 'John Doe',
      designationType: 'Staff',
      price: '$50.00',
      priceWithFees: '$51.20',
      config: {
        AMOUNT: 50,
        AMOUNT_WITH_FEES: 51.2,
        CAMPAIGN_CODE: '',
        DONATION_SERVICES_COMMENTS: '',
        PREMIUM_CODE: '',
        RECIPIENT_COMMENTS: '',
        RECURRING_DAY_OF_MONTH: '',
        RECURRING_START_MONTH: '',
      },
      frequency: 'Single',
      amount: 50,
      amountWithFees: 51.2,
      designationNumber: '0643021',
      productUri: '/items/crugive/a5t4fmspmfpwpqv',
      giftStartDate: null,
      giftStartDateDaysFromNow: 0,
      giftStartDateWarning: false,
    };
    const transactionCart = {
      id: 'grsgezrxhfqtsljrga3gkljugvtdaljygjqtcl',
      items: [item],
      frequencyTotals: [
        {
          frequency: 'Single',
          amount: 50,
          amountWithFees: 51.2,
          total: '$50.00',
          totalWithFees: '$51.20',
        },
      ],
      cartTotal: 50,
      cartTotalDisplay: '$50.00',
    };
    const purchaseData = {
      donorDetails: {
        'donor-type': 'Household',
      },
      paymentInstruments: {
        'card-type': 'Visa',
      },
      lineItems: [],
      rateTotals: [],
      rawData: {
        'purchase-number': '23032',
      },
    };
    it('should add purchase event', async () => {
      self.$window.sessionStorage.setItem('coverFeeDecision', null);
      self.$window.localStorage.setItem(
        'transactionCart',
        JSON.stringify(transactionCart),
      );
      self.$window.sessionStorage.setItem('transactionId', 23031);

      expect(self.$window.sessionStorage.getItem('transactionId')).toEqual(
        '23031',
      );

      self.analyticsFactory.transactionEvent(purchaseData);

      expect(self.$window.sessionStorage.getItem('transactionId')).toEqual(
        purchaseData.rawData['purchase-number'],
      );

      expect(self.$window.dataLayer.length).toEqual(1);
      expect(self.$window.dataLayer[0].event).toEqual('purchase');
      expect(self.$window.dataLayer[0].paymentType).toEqual('credit card');
      expect(self.$window.dataLayer[0].ecommerce).toEqual({
        currency: 'USD',
        payment_type: 'credit card',
        donator_type: 'Household',
        pays_processing: 'no',
        value: '50.00',
        processing_fee: undefined,
        transaction_id: purchaseData.rawData['purchase-number'],
        items: [
          {
            item_id: '0643021',
            item_name: 'John Doe',
            item_category: 'staff',
            item_variant: 'single',
            price: '50',
            currency: 'USD',
            quantity: '1',
            recurring_date: undefined,
            ga_donator_type: null,
            donation_type: 'one-time',
            donation_frequency: 'single',
            payment_type: 'credit card',
            purchase_number: '23032',
            campaign_code: undefined,
            item_brand: 'STAFF',
            processingFee: undefined,
            testing_transaction: 'false',
          },
        ],
      });
    });

    it('should ignore and not send event', async () => {
      self.$window.sessionStorage.setItem('coverFeeDecision', null);
      self.$window.localStorage.setItem(
        'transactionCart',
        JSON.stringify(transactionCart),
      );
      self.$window.sessionStorage.setItem('transactionId', 23032);
      self.analyticsFactory.transactionEvent(purchaseData);

      expect(self.$window.dataLayer.length).toEqual(0);
    });

    it('should add up totals correctly purchase event', async () => {
      // Adding three items to the cart
      transactionCart.items = [item, item, item];
      self.$window.sessionStorage.setItem('coverFeeDecision', true);
      self.$window.localStorage.setItem(
        'transactionCart',
        JSON.stringify(transactionCart),
      );
      self.$window.sessionStorage.setItem('transactionId', 23031);

      self.analyticsFactory.transactionEvent(purchaseData);

      const totalWithFees = 51.2 * 3;
      const totalWithoutFees = 50 * 3;

      expect(self.$window.dataLayer[0].ecommerce.processing_fee).toEqual(
        (totalWithFees - totalWithoutFees).toFixed(2),
      );
      expect(self.$window.dataLayer[0].ecommerce.value).toEqual(
        totalWithFees.toFixed(2),
      );
      expect(self.$window.dataLayer[0].ecommerce.pays_processing).toEqual(
        'yes',
      );
      expect(
        self.$window.dataLayer[0].ecommerce.items[0].processingFee,
      ).toEqual((51.2 - 50).toFixed(2));
    });
  });
});

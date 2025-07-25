import angular from 'angular';
import every from 'lodash/every';

import productConfigForm from 'app/productConfig/productConfigForm/productConfigForm.component';
import contactInfo from 'common/components/contactInfo/contactInfo.component';
import checkoutStep2 from 'app/checkout/step-2/step-2.component';
import checkoutErrorMessages from 'app/checkout/checkout-error-messages/checkout-error-messages.component';

import cartService from 'common/services/api/cart.service';
import orderService from 'common/services/api/order.service';
import analyticsFactory from '../../analytics/analytics.factory';
import brandedAnalyticsFactory from '../../branded/analytics/branded-analytics.factory';

import template from './branded-checkout-step-1.tpl.html';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';

const componentName = 'brandedCheckoutStep1';

class BrandedCheckoutStep1Controller {
  /* @ngInject */
  constructor(
    $scope,
    $log,
    $filter,
    $window,
    analyticsFactory,
    brandedAnalyticsFactory,
    cartService,
    orderService,
  ) {
    this.$scope = $scope;
    this.$log = $log;
    this.$filter = $filter;
    this.$window = $window;
    this.analyticsFactory = analyticsFactory;
    this.brandedAnalyticsFactory = brandedAnalyticsFactory;
    this.cartService = cartService;
    this.orderService = orderService;
  }

  $onInit() {
    this.resetSubmission();
    this.initItemConfig();
    this.initCart();
  }

  initItemConfig() {
    // if itemConfig is defined, this means that the user clicked
    // "Change" on the review page. We can set the premiumSelected
    // and return so that itemConfig is not re-initialized.
    if (this.itemConfig) {
      this.premiumSelected = !!this.itemConfig.PREMIUM_CODE;
      return;
    }
    this.itemConfig = {};
    this.itemConfig.CAMPAIGN_CODE = this.campaignCode;
    if (
      this.itemConfig.CAMPAIGN_CODE &&
      (this.itemConfig.CAMPAIGN_CODE.match(/^[a-z0-9]+$/i) === null ||
        this.itemConfig.CAMPAIGN_CODE.length > 30)
    ) {
      this.itemConfig.CAMPAIGN_CODE = '';
    }
    this.itemConfig['campaign-page'] = this.campaignPage;
    this.itemConfig.AMOUNT = this.amount;

    switch (this.frequency) {
      case 'monthly':
        this.defaultFrequency = 'MON';
        break;
      case 'quarterly':
        this.defaultFrequency = 'QUARTERLY';
        break;
      case 'annually':
        this.defaultFrequency = 'ANNUAL';
        break;
    }
    this.itemConfig.RECURRING_DAY_OF_MONTH = this.day;
    this.itemConfig.frequency = this.frequency;

    if (this.premiumCode) {
      this.itemConfig.PREMIUM_CODE = this.premiumCode;
      this.premiumSelected = true;
    }
  }

  initCart() {
    this.loadingProductConfig = true;
    this.errorLoadingProductConfig = false;

    this.cartService.get().subscribe(
      (data) => {
        const item = data.items && data.items[0];
        if (item) {
          // Edit first item from user's cart if it exits
          this.isEdit = true;
          this.item = item;
          this.code = item.code;
          this.itemConfig = item.config;

          // add campaign page
          this.itemConfig['campaign-page'] = this.campaignPage;
        }
        this.loadingProductConfig = false;
      },
      (error) => {
        this.errorLoadingProductConfig = true;
        this.loadingProductConfig = false;
        this.$log.error(
          'Error loading cart data for branded checkout step 1',
          error,
        );
      },
    );
  }

  submit() {
    this.resetSubmission();
    this.submitted = true;
  }

  resetSubmission() {
    this.submission = {
      giftConfig: {
        completed: false,
        error: false,
      },
      contactInfo: {
        completed: false,
        error: false,
      },
      payment: {
        completed: false,
        error: false,
      },
    };
  }

  onGiftConfigStateChange(state) {
    switch (state) {
      case 'submitted':
        this.submission.giftConfig.completed = true;
        this.isEdit = true;
        this.checkSuccessfulSubmission();
        break;
      case 'errorSubmitting':
      case 'errorAlreadyInCart':
        this.submission.giftConfig.completed = true;
        this.submission.giftConfig.error = true;
        this.checkSuccessfulSubmission();
        break;
    }
  }

  onContactInfoSubmit(success) {
    if (success) {
      this.submission.contactInfo.completed = true;
      this.brandedAnalyticsFactory.saveDonorDetails(this.donorDetails);
    } else {
      this.submission.contactInfo.completed = true;
      this.submission.contactInfo.error = true;
    }
    this.checkSuccessfulSubmission();
  }

  onPaymentStateChange(state) {
    switch (state) {
      case 'submitted':
        this.submission.payment.completed = true;
        this.checkSuccessfulSubmission();
        break;
      case 'errorSubmitting':
      case 'unsubmitted':
        this.submission.payment.completed = true;
        this.submission.payment.error = true;
        this.checkSuccessfulSubmission();
        this.onPaymentFailed({ $event: { donorDetails: this.donorDetails } });
        break;
    }
  }

  onSelectPremiumOption() {
    if (this.premiumSelected) {
      this.itemConfig.PREMIUM_CODE = this.premiumCode;
    } else {
      this.itemConfig.PREMIUM_CODE = undefined;
    }
  }

  checkSuccessfulSubmission() {
    if (every(this.submission, 'completed')) {
      if (every(this.submission, { error: false })) {
        if (this.useV3) {
          this.submitOrderInternal();
        } else {
          this.next();
        }
      } else {
        this.submitted = false;
      }
    }
  }

  loadCart() {
    this.errorLoadingCart = false;

    const cart = this.cartService.get();
    cart.subscribe(
      (data) => {
        // Setting cart data and analytics
        this.cartData = data;
        this.brandedAnalyticsFactory.saveCoverFees(
          this.orderService.retrieveCoverFeeDecision(),
        );
        if (this.cartData && this.cartData.items) {
          this.brandedAnalyticsFactory.saveItem(this.cartData.items[0]);
        }
        this.brandedAnalyticsFactory.addPaymentInfo();
      },
      (error) => {
        // Handle errors by setting flag and logging the error
        this.errorLoadingCart = true;
        this.$log.error(
          'Error loading cart data for branded checkout (single step)',
          error,
        );
      },
    );
    return cart;
  }

  loadCurrentPayment() {
    this.loadingCurrentPayment = true;

    const getCurrentPayment = this.orderService.getCurrentPayment();
    getCurrentPayment
      .finally(() => {
        this.loadingCurrentPayment = false;
      })
      .subscribe(
        (data) => {
          if (!data) {
            this.$log.error(
              "Error loading current payment info: current payment doesn't seem to exist",
            );
          } else if (data['account-type']) {
            this.bankAccountPaymentDetails = data;
          } else if (data['card-type']) {
            this.creditCardPaymentDetails = data;
          } else {
            this.$log.error(
              'Error loading current payment info: current payment type is unknown',
            );
          }
        },
        (error) => {
          this.$log.error('Error loading current payment info', error);
        },
      );
    return getCurrentPayment;
  }

  checkErrors() {
    // Then check for errors on the API
    return this.orderService
      .checkErrors()
      .do((data) => {
        this.needinfoErrors = data;
      })
      .catch((error) => {
        this.$log.error('Error loading checkErrors', error);
      });
  }

  submitOrderInternal() {
    this.loadingAndSubmitting = true;
    this.loadCart()
      .mergeMap(() => {
        return this.loadCurrentPayment();
      })
      .mergeMap(() => {
        return this.checkErrors();
      })
      .mergeMap(() => {
        return this.orderService.submitOrder(this);
      })
      .finally(() => {
        this.loadingAndSubmitting = false;
        this.submitted = false;
      })
      .subscribe(() => {
        this.next();
      });
  }

  canSubmitOrder() {
    return !this.submittingOrder;
  }
}

export default angular
  .module(componentName, [
    productConfigForm.name,
    contactInfo.name,
    checkoutStep2.name,
    checkoutErrorMessages.name,
    cartService.name,
    orderService.name,
    analyticsFactory.name,
    brandedAnalyticsFactory.name,
  ])
  .component(componentName, {
    controller: BrandedCheckoutStep1Controller,
    templateUrl: template,
    bindings: {
      code: '<',
      campaignCode: '<',
      campaignPage: '<',
      amount: '<',
      frequency: '<',
      day: '<',
      donorDetails: '<',
      defaultPaymentType: '<',
      hidePaymentTypeOptions: '<',
      showCoverFees: '<',
      next: '&',
      onPaymentFailed: '&',
      radioStationApiUrl: '<',
      premiumCode: '<',
      premiumName: '<',
      premiumImageUrl: '<',
      itemConfig: '=',
      onSubmittingOrder: '&',
      onSubmitted: '&',
      useV3: '<',
      loadingAndSubmitting: '<',
      hideAnnual: '<',
      hideQuarterly: '<',
    },
  });

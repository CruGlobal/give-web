import angular from 'angular';
import 'angular-ordinal';
import 'angular-sanitize';
import indexOf from 'lodash/indexOf';
import find from 'lodash/find';
import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';
import map from 'lodash/map';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import padStart from 'lodash/padStart';
import inRange from 'lodash/inRange';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/do';
import designationsService from 'common/services/api/designations.service';
import cartService from 'common/services/api/cart.service';
import orderService from 'common/services/api/order.service';
import { forcedUserToLogout } from '../../../common/services/session/session.service';
import {
  possibleTransactionDays,
  possibleTransactionMonths,
  startDate,
  startMonth,
} from 'common/services/giftHelpers/giftDates.service';
import desigSrcDirective from 'common/directives/desigSrc.directive';
import showErrors from 'common/filters/showErrors.filter';
import { giftAddedEvent, cartUpdatedEvent } from 'common/lib/cartEvents';
import { giveGiftParams } from '../giveGiftParams';
import loading from 'common/components/loading/loading.component';
import analyticsFactory from 'app/analytics/analytics.factory';
import brandedAnalyticsFactory from 'app/branded/analytics/branded-analytics.factory';
import giftPanels from '../giftPanels/giftPanels.component';
import specialInstructions from '../specialInstructions/specialInstructions.component';
import template from './productConfigForm.tpl.html';

export const brandedCoverFeeCheckedEvent = 'brandedCoverFeeCheckedEvent';

const FEE_DERIVATIVE = 0.9765; // 2.35% processing fee (calculated by 1 - 0.0235)

const componentName = 'productConfigForm';

class ProductConfigFormController {
  /* @ngInject */
  constructor(
    $rootScope,
    $scope,
    $log,
    $filter,
    $window,
    designationsService,
    cartService,
    orderService,
    commonService,
    analyticsFactory,
    brandedAnalyticsFactory,
    envService,
  ) {
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$log = $log;
    this.$filter = $filter;
    this.$window = $window;
    this.designationsService = designationsService;
    this.cartService = cartService;
    this.orderService = orderService;
    this.commonService = commonService;
    this.possibleTransactionDays = possibleTransactionDays;
    this.possibleTransactionMonths = possibleTransactionMonths;
    this.startDate = startDate;
    this.startMonth = startMonth;
    this.analyticsFactory = analyticsFactory;
    this.brandedAnalyticsFactory = brandedAnalyticsFactory;
    this.envService = envService;
    this.amountChanged = false;

    this.selectableAmounts = [50, 100, 250, 500, 1000, 5000];

    // Bind methods to maintain 'this' context when called from child components
    this.changeFrequency = this.changeFrequency.bind(this);
    this.changeAmount = this.changeAmount.bind(this);
    this.changeCustomAmount = this.changeCustomAmount.bind(this);
    this.changeStartDay = this.changeStartDay.bind(this);
    this.suggestedAmount = this.suggestedAmount.bind(this);
  }

  $onInit() {
    this.initItemConfig();
    this.loadData();
    this.waitForFormInitialization();
    this.shouldShowForcedUserToLogoutError();

    this.$rootScope.$on(brandedCoverFeeCheckedEvent, () => {
      this.initItemConfig();
      //  Based on EP 8.1 JSON Object amount has been changed to uppercase
      if (this.selectableAmounts.includes(this.itemConfig.AMOUNT)) {
        this.changeAmount(this.itemConfig.AMOUNT, true);
      } else {
        this.changeCustomAmount(this.itemConfig.AMOUNT, true);
      }
    });
  }

  $onChanges(changes) {
    if (changes.submitted && changes.submitted.currentValue === true) {
      this.saveGiftToCart();
    }
  }

  initItemConfig() {
    this.itemConfig = this.itemConfig || {};

    //  Based on EP 8.1 JSON Object amount has been changed to uppercase
    const amount = parseFloat(this.itemConfig.AMOUNT);
    if (isNaN(amount)) {
      delete this.itemConfig.AMOUNT;
    } else {
      this.setAmount(amount);
    }

    if (inRange(parseInt(this.itemConfig.RECURRING_DAY_OF_MONTH, 10), 1, 29)) {
      this.itemConfig.RECURRING_DAY_OF_MONTH = padStart(
        this.itemConfig.RECURRING_DAY_OF_MONTH,
        2,
        '0',
      );
    } else {
      delete this.itemConfig.RECURRING_DAY_OF_MONTH;
    }

    if (inRange(parseInt(this.itemConfig.RECURRING_START_MONTH, 10), 1, 13)) {
      this.itemConfig.RECURRING_START_MONTH = padStart(
        this.itemConfig.RECURRING_START_MONTH,
        2,
        '0',
      );
    } else {
      delete this.itemConfig.RECURRING_START_MONTH;
    }
  }

  loadData() {
    this.loading = true;
    this.errorLoading = false;

    this.showRecipientComments = !!this.itemConfig.RECIPIENT_COMMENTS;
    this.showDSComments = !!this.itemConfig.DONATION_SERVICES_COMMENTS;

    const productLookupObservable = this.designationsService
      .productLookup(this.code)
      .do((productData) => {
        this.productData = productData;
        if (this.envService.read('isBrandedCheckout')) {
          this.brandedAnalyticsFactory.beginCheckout(this.productData);
        }
        this.setDefaultAmount();
        this.setDefaultFrequency();
        if (this.envService.read('isBrandedCheckout')) {
          this.filterChosenFrequencies();
        }
      });

    const nextDrawDateObservable = this.commonService
      .getNextDrawDate()
      .do((nextDrawDate) => {
        this.nextDrawDate = nextDrawDate;
        if (!this.itemConfig.RECURRING_DAY_OF_MONTH && this.nextDrawDate) {
          this.itemConfig.RECURRING_DAY_OF_MONTH = startDate(
            null,
            this.nextDrawDate,
          ).format('DD');
        }
        if (!this.itemConfig.RECURRING_START_MONTH && this.nextDrawDate) {
          this.itemConfig.RECURRING_START_MONTH = startDate(
            null,
            this.nextDrawDate,
          ).format('MM');
        }
      });

    const suggestedAmountsObservable = this.designationsService
      .suggestedAmounts(this.code, this.itemConfig)
      .do((suggestedAmounts) => {
        this.suggestedAmounts = suggestedAmounts.filter(
          (amount) => amount?.amount,
        );
        this.useSuggestedAmounts = !isEmpty(this.suggestedAmounts);
      });

    const givingLinksObservable = this.designationsService
      .givingLinks(this.code, this.itemConfig['campaign-page'])
      .do((givingLinks) => {
        this.givingLinks = givingLinks || [];
      });

    Observable.merge(
      productLookupObservable,
      nextDrawDateObservable,
      suggestedAmountsObservable,
      givingLinksObservable,
    ).subscribe(
      null,
      (error) => {
        this.errorLoading = true;
        this.onStateChange({ state: 'errorLoading' });
        this.$log.error('Error loading data for product config form', error);
        this.loading = false;
      },
      () => {
        this.analyticsFactory.giveGiftModal(this.productData);
        this.loading = false;
        // Show givingLinks if they exist and it isn't an edit
        if (this.givingLinks.length > 0 && !this.isEdit) {
          this.showGivingLinks = true;
          this.onStateChange({ state: 'givingLinks' });
        } else {
          this.onStateChange({ state: 'unsubmitted' });
        }
      },
    );
  }

  //  Based on EP 8.1 JSON Object amount has been changed to uppercase
  setDefaultAmount() {
    const amountOptions = isEmpty(this.suggestedAmounts)
      ? this.selectableAmounts
      : map(this.suggestedAmounts, 'amount');

    if (this.itemConfig.AMOUNT) {
      if (amountOptions.indexOf(this.itemConfig.AMOUNT) === -1) {
        this.changeCustomAmount(this.itemConfig.AMOUNT);
      }
    } else {
      this.setAmount(amountOptions[0]);
    }
  }

  setDefaultFrequency() {
    if (this.defaultFrequency) {
      const frequency = find(this.productData.frequencies, [
        'name',
        this.defaultFrequency,
      ]);
      if (frequency && frequency.selectAction) {
        this.changeFrequency(frequency);
      }
    }
  }

  waitForFormInitialization() {
    const unregister = this.$scope.$watch('$ctrl.itemConfigForm.amount', () => {
      if (this.itemConfigForm && this.itemConfigForm.amount) {
        unregister();
        this.addCustomValidators();
      }
    });
  }

  addCustomValidators() {
    this.itemConfigForm.amount.$parsers.push((value) =>
      value.replace('$', '').replace(',', ''),
    ); // Ignore a dollar sign and comma if included by the user
    this.itemConfigForm.amount.$validators.minimum = (value) => {
      return !this.customInputActive || value * 1.0 >= 1;
    };
    this.itemConfigForm.amount.$validators.maximum = (value) => {
      return !this.customInputActive || value * 1.0 < 10000000;
    };
    this.itemConfigForm.amount.$validators.pattern = (value) => {
      const regex = /^([0-9]*)(\.[0-9]{1,2})?$/;
      return !this.customInputActive || regex.test(value);
    };
  }

  frequencyOrder(f) {
    const order = ['NA', 'MON', 'QUARTERLY', 'ANNUAL'];
    return indexOf(order, f.name);
  }

  changeFrequency(product) {
    if (product.name === this.productData.frequency) {
      // Do nothing if same frequency is selected
      return;
    }

    this.errorAlreadyInCart = false;
    this.errorChangingFrequency = false;
    const lastFrequency = this.productData.frequency;
    this.productData.frequency = product.name;

    if (this.envService.read('isBrandedCheckout')) {
      this.itemConfig.frequency = product.display;
    }

    this.updateQueryParam({
      key: giveGiftParams.frequency,
      value: product.name,
    });
    if (product.selectAction) {
      this.changingFrequency = true;
      this.onStateChange({ state: 'changingFrequency' });
      this.designationsService
        .productLookup(product.selectAction, true)
        .subscribe(
          (data) => {
            this.itemConfigForm.$setDirty();
            this.productData = data;
            if (this.envService.read('isBrandedCheckout')) {
              this.filterChosenFrequencies();
            }
            this.changingFrequency = false;
            this.onStateChange({ state: 'unsubmitted' });
          },
          (error) => {
            this.$log.error(
              'Error loading new product when changing frequency',
              error,
            );
            this.errorChangingFrequency = true;
            this.productData.frequency = lastFrequency;
            this.updateQueryParam({
              key: giveGiftParams.frequency,
              value: lastFrequency,
            });
            this.changingFrequency = false;
            this.onStateChange({ state: 'unsubmitted' });
          },
        );
    }
  }

  filterChosenFrequencies() {
    let filteredFrequencies = this.productData.frequencies;
    if (this.hideQuarterly) {
      filteredFrequencies = filteredFrequencies.filter((value) => {
        return value.name !== 'QUARTERLY';
      });
    }
    if (this.hideAnnual) {
      filteredFrequencies = filteredFrequencies.filter((value) => {
        return value.name !== 'ANNUAL';
      });
    }
    this.productData.frequencies = filteredFrequencies;
  }

  changeAmount(amount, retainCoverFees) {
    this.itemConfigForm.$setDirty();
    this.checkAmountChanged(amount);
    this.setAmount(amount);
    this.customAmount = '';
    this.customInputActive = false;
    if (!retainCoverFees && this.amountChanged) {
      this.orderService.clearCoverFees();
    }
    this.updateQueryParam({ key: giveGiftParams.amount, value: amount });
  }

  changeCustomAmount(amount, retainCoverFees) {
    const amountAsNumber = parseFloat(amount);
    this.checkAmountChanged(amountAsNumber);
    this.setAmount(amountAsNumber);
    this.customAmount = amount;
    this.customInputActive = true;
    if (!retainCoverFees && this.amountChanged) {
      this.orderService.clearCoverFees();
    }
    this.updateQueryParam({ key: giveGiftParams.amount, value: amount });
  }

  checkAmountChanged(amount) {
    if (this.itemConfig.AMOUNT && amount) {
      this.amountChanged = this.itemConfig.AMOUNT !== amount;
    }
    if (!this.itemConfig.AMOUNT && amount) {
      this.amountChanged = true;
    }
  }

  changeStartDay(day, month) {
    this.errorAlreadyInCart = false;
    this.updateQueryParam({ key: giveGiftParams.day, value: day });
    this.updateQueryParam({ key: giveGiftParams.month, value: month });
  }

  /*
   * Set the itemConfig's amount and update priceWithFees. `itemConfig.AMOUNT` should not be updated
   * directly without using this helper.
   */
  setAmount(amount) {
    this.itemConfig.AMOUNT = amount;
    const amountWithFees = amount / FEE_DERIVATIVE;
    this.itemConfig.priceWithFees = this.$filter('currency')(
      amountWithFees,
      '$',
      2,
    );
  }

  saveGiftToCart() {
    this.itemConfigForm.$setSubmitted();
    this.submittingGift = false;
    this.errorAlreadyInCart = false;
    this.errorSavingGeneric = false;
    this.amountFormatError = '';
    if (!this.itemConfigForm.$valid) {
      return;
    }
    this.submittingGift = true;
    this.onStateChange({ state: 'submitting' });

    const data = this.omitIrrelevantData(this.itemConfig);
    const comment = data.DONATION_SERVICES_COMMENTS;
    const isTestingTransaction = comment
      ? comment.toLowerCase().includes('test')
      : false;
    this.brandedAnalyticsFactory.saveTestingTransaction(isTestingTransaction);
    this.analyticsFactory.saveTestingTransaction(
      this.productData,
      isTestingTransaction,
    );

    const savingObservable = this.isEdit
      ? this.cartService.editItem(this.uri, this.productData.uri, data)
      : this.cartService.addItem(
          this.productData.uri,
          data,
          this.disableSessionRestart,
        );

    savingObservable.subscribe(
      (data) => {
        if (this.isEdit) {
          if (this.amountChanged) {
            this.orderService.clearCoverFees();
          }
          this.$scope.$emit(cartUpdatedEvent);
        } else {
          this.$scope.$emit(giftAddedEvent);
          this.analyticsFactory.cartAdd(this.itemConfig, this.productData);
        }
        this.uri = data.self.uri;
        this.submittingGift = false;
        this.onStateChange({ state: 'submitted' });
      },
      (error) => {
        if (includes(error.data, 'already in the cart')) {
          this.errorAlreadyInCart = true;
          this.onStateChange({ state: 'errorAlreadyInCart' });
        } else if (
          error.data &&
          error.data.messages &&
          error.data.messages[0] &&
          error.data.messages[0].id === 'field.invalid.decimal.format'
        ) {
          this.amountFormatError = error.data.messages[0]['debug-message'];
          this.onStateChange({ state: 'errorSubmitting' });
        } else if (includes(error.data, 'decimal number')) {
          this.amountFormatError = error.data;
          this.onStateChange({ state: 'errorSubmitting' });
        } else {
          this.errorSavingGeneric = true;
          this.$log.error('Error adding or updating item in cart', error);
          this.onStateChange({ state: 'errorSubmitting' });
        }
        this.submittingGift = false;
      },
    );
  }

  omitIrrelevantData(itemConfig) {
    const data =
      this.productData.frequency === 'NA'
        ? omit(itemConfig, [
            'RECURRING_START_MONTH',
            'RECURRING_DAY_OF_MONTH',
            'jcr-title',
            'AMOUNT_WITH_FEES',
          ])
        : omit(itemConfig, ['jcr-title', 'AMOUNT_WITH_FEES']);
    // I tried using lodash.isEmpty instead of my own predicate, but for some reason it was deleting the AMOUNT value
    return omitBy(data, (value) => {
      return value === '';
    });
  }

  displayId() {
    if (!this.productData) {
      return '';
    }
    let value = `#${this.productData.designationNumber}`;
    if (
      this.productData.displayName !== this.itemConfig['jcr-title'] &&
      this.itemConfig['campaign-page']
    ) {
      value += ` - ${this.productData.displayName}`;
    }
    return value;
  }

  suggestedAmount(amount) {
    return this.$filter('currency')(
      amount,
      '$',
      `${amount}`.indexOf('.') > -1 ? 2 : 0,
    );
  }

  giveLink(url) {
    if (typeof url === 'undefined') {
      this.showGivingLinks = false;
      this.onStateChange({ state: 'unsubmitted' });
    } else {
      this.$window.location = url;
    }
  }

  shouldShowForcedUserToLogoutError() {
    this.errorForcedUserToLogout =
      !!this.$window.sessionStorage.getItem(forcedUserToLogout);
  }
}

export default angular
  .module(componentName, [
    'ordinal',
    'ngSanitize',
    designationsService.name,
    cartService.name,
    orderService.name,
    desigSrcDirective.name,
    showErrors.name,
    loading.name,
    analyticsFactory.name,
    brandedAnalyticsFactory.name,
    giftPanels.name,
    specialInstructions.name,
  ])
  .component(componentName, {
    controller: ProductConfigFormController,
    templateUrl: template,
    bindings: {
      code: '<',
      itemConfig: '<',
      isEdit: '<',
      uri: '<',
      defaultFrequency: '<',
      disableSessionRestart: '@',
      updateQueryParam: '&',
      submitted: '<',
      onStateChange: '&',
      useV3: '<',
      hideAnnual: '<',
      hideQuarterly: '<',
    },
  });

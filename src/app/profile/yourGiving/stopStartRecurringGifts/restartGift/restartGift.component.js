import angular from 'angular';
import template from './restartGift.tpl.html';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';

import map from 'lodash/map';
import flatten from 'lodash/flatten';
import values from 'lodash/values';

import donationsService, {
  RecurringGiftsType,
} from 'common/services/api/donations.service';
import profileService from 'common/services/api/profile.service';
import commonService from 'common/services/api/common.service';
import RecurringGiftModel from 'common/models/recurringGift.model';
import analyticsFactory from 'app/analytics/analytics.factory';

import suspendedGifts from './step1/suspendedGifts/suspendedGifts.component';
import suggestedRecipients from './step1/suggestedRecipients/suggestedRecipients.component';
import redirectGiftStep2 from '../redirectGift/step2/redirectGiftStep2.component';
import configureGifts from './step2/configureGifts/configureGifts.component';
import confirmGifts from './step3/confirmGifts/confirmGifts.component';
import { validPaymentMethods } from 'common/services/paymentHelpers/validPaymentMethods';
import addUpdatePaymentMethod from 'app/profile/yourGiving/editRecurringGifts/step0/addUpdatePaymentMethod.component';
import step0PaymentMethodList from 'app/profile/yourGiving/editRecurringGifts/step0/paymentMethodList.component';

import { scrollModalToTop } from 'common/services/modalState.service';

import paymentMethodForm from 'common/components/paymentMethods/paymentMethodForm/paymentMethodForm.component';

const componentName = 'restartGift';

class RestartGiftController {
  /* @ngInject */
  constructor(
    $log,
    donationsService,
    profileService,
    commonService,
    analyticsFactory,
  ) {
    this.$log = $log;
    this.donationsService = donationsService;
    this.profileService = profileService;
    this.commonService = commonService;
    this.analyticsFactory = analyticsFactory;
    this.scrollModalToTop = scrollModalToTop;
  }

  $onInit() {
    this.selectedGifts = {
      suspended: [],
      suggested: [],
      search: [],
    };
    this.loadPaymentMethods();
    this.step = 'loading';
  }

  loadPaymentMethods() {
    this.setLoading({ loading: true });
    return Observable.forkJoin([
      this.profileService.getPaymentMethods(),
      this.commonService.getNextDrawDate(),
    ]).subscribe(
      ([paymentMethods, nextDrawDate]) => {
        this.paymentMethods = paymentMethods;
        this.nextDrawDate = nextDrawDate;
        this.hasPaymentMethods = paymentMethods && paymentMethods.length > 0;
        if (!this.hasPaymentMethods) {
          this.step = 'add-update-payment-method';
          this.setLoading({ loading: false });
          return;
        }
        this.validPaymentMethods = validPaymentMethods(paymentMethods);
        this.hasValidPaymentMethods =
          this.validPaymentMethods && this.validPaymentMethods.length > 0;
        if (!this.hasValidPaymentMethods) {
          this.step = 'select-payment-method';
          this.setLoading({ loading: false });
          return;
        }
        RecurringGiftModel.paymentMethods = this.validPaymentMethods;
        RecurringGiftModel.nextDrawDate = this.nextDrawDate;
        this.loadGiftsAndRecipients();
      },
      (error) => {
        this.setLoading({ loading: false });
        this.error = true;
        this.$log.error('Error loading paymentMethods', error);
      },
    );
  }

  loadGiftsAndRecipients() {
    this.setLoading({ loading: true });
    Observable.forkJoin([
      this.donationsService.getRecurringGifts(
        RecurringGiftsType.suspended,
        true,
      ),
      this.donationsService.getSuggestedRecipients(),
    ]).subscribe(
      ([suspendedGifts, suggestedRecipients]) => {
        this.suspendedGifts = suspendedGifts || [];
        this.suggestedRecipients = map(suggestedRecipients || [], (recipient) =>
          new RecurringGiftModel(recipient).setDefaults(),
        );
        this.includeSuspendedGifts = !!this.suspendedGifts.length;
        this.includeSuggestedRecipients = !!this.suggestedRecipients.length;
        this.next();
      },
      (error) => {
        this.setLoading({ loading: false });
        this.error = true;
        this.$log.error('Error loading gifts and receipts', error);
      },
    );
  }

  next(selected, configured, paymentMethod) {
    this.setLoading({ loading: false });
    switch (this.step) {
      case 'suspended':
        if (angular.isDefined(selected))
          this.selectedGifts.suspended = selected;
        if (this.includeSuggestedRecipients) {
          this.step = 'suggested';
        } else if (
          !this.selectedGifts.suspended.length &&
          !this.selectedGifts.suggested.length
        ) {
          this.step = 'search';
        } else {
          this.configureGifts();
        }
        break;
      case 'suggested':
        if (angular.isDefined(selected))
          this.selectedGifts.suggested = selected;
        if (
          !this.selectedGifts.suspended.length &&
          !this.selectedGifts.suggested.length
        ) {
          this.step = 'search';
        } else {
          this.configureGifts();
        }
        break;
      case 'search':
        if (angular.isDefined(selected)) {
          selected = angular.isArray(selected) ? selected : [selected];
          this.selectedGifts.search = map(selected, (recipient) =>
            new RecurringGiftModel({
              'designation-name': recipient.designationName,
              'designation-number': recipient.designationNumber,
            }).setDefaults(),
          );
          this.configureGifts();
        }
        break;
      case 'configure':
        this.gifts = configured;
        this.step = 'confirm';
        break;
      case 'confirm':
        this.complete();
        break;
      case 'select-payment-method':
        this.paymentMethod = paymentMethod;
        this.step = 'add-update-payment-method';
        break;
      case 'add-update-payment-method':
        this.loadPaymentMethods();
        this.step = 'suspended';
        break;
      case 'loading':
      default:
        if (this.includeSuspendedGifts) {
          this.step = 'suspended';
        } else if (this.includeSuggestedRecipients) {
          this.step = 'suggested';
        } else {
          this.step = 'search';
        }
    }
    this.scrollModalToTop();
  }

  configureGifts() {
    this.gifts = map(flatten(values(this.selectedGifts)), (gift) =>
      gift.clone(),
    );
    this.step = 'configure';
  }

  previous() {
    switch (this.step) {
      // Fallthrough is intentional, simplifies code and is fully spec'd.
      case 'configure':
        if (
          !this.selectedGifts.suspended.length &&
          !this.selectedGifts.suggested.length
        ) {
          this.step = 'search';
          break;
        }
      // eslint-disable-next-line no-fallthrough
      case 'search':
        if (this.includeSuggestedRecipients) {
          this.step = 'suggested';
          break;
        }
      // eslint-disable-next-line no-fallthrough
      case 'suggested':
        if (this.includeSuspendedGifts) {
          this.step = 'suspended';
          break;
        }
      // eslint-disable-next-line no-fallthrough
      case 'suspended':
        this.changeState({ state: 'step-0' });
        break;
      case 'confirm':
        this.step = 'configure';
        break;
      case 'add-update-payment-method':
        if (this.hasPaymentMethods) {
          this.step = 'select-payment-method';
        } else {
          this.changeState({ state: 'step-0' });
        }
        break;
    }
    this.scrollModalToTop();
  }
}

export default angular
  .module(componentName, [
    commonService.name,
    donationsService.name,
    profileService.name,
    suspendedGifts.name,
    suggestedRecipients.name,
    redirectGiftStep2.name,
    configureGifts.name,
    confirmGifts.name,
    paymentMethodForm.name,
    addUpdatePaymentMethod.name,
    step0PaymentMethodList.name,
    analyticsFactory.name,
  ])
  .component(componentName, {
    controller: RestartGiftController,
    templateUrl: template,
    bindings: {
      changeState: '&',
      cancel: '&',
      setLoading: '&',
      complete: '&',
    },
  });

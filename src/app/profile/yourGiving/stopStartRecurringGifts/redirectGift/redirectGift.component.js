import angular from 'angular';
import template from './redirectGift.tpl.html';
import pick from 'lodash/pick';

import donationsService from 'common/services/api/donations.service';
import redirectGiftStep1 from './step1/redirectGiftStep1.component';
import redirectGiftStep2 from './step2/redirectGiftStep2.component';
import redirectGiftStep3 from './step3/redirectGiftStep3.component';
import retryModal from 'common/components/retryModal/retryModal.component';
import analyticsFactory from 'app/analytics/analytics.factory';

import { scrollModalToTop } from 'common/services/modalState.service';

const componentName = 'redirectGift';

class RedirectGiftController {
  /* @ngInject */
  constructor($log, donationsService, analyticsFactory) {
    this.$log = $log;
    this.donationsService = donationsService;
    this.analyticsFactory = analyticsFactory;
    this.scrollModalToTop = scrollModalToTop;
  }

  $onInit() {
    this.setLoading({ loading: true });
    this.loadRecurringGifts();
  }

  setStep(step) {
    this.step = step;
    this.scrollModalToTop();
  }

  previous() {
    switch (this.step) {
      case 'step-3':
        this.step = 'step-2';
        break;
      case 'step-2':
        this.step = 'step-1';
        break;
      case 'step-1':
      default:
        this.changeState({ state: 'step-0' });
    }
    this.scrollModalToTop();
  }

  loadRecurringGifts() {
    this.setLoading({ loading: true });
    this.loadingRecurringGiftsError = false;
    this.donationsService.getRecurringGifts().subscribe(
      (gifts) => {
        this.gifts = gifts;
        this.setLoading({ loading: false });
        this.setStep('step-1');
      },
      (error) => {
        this.setLoading({ loading: false });
        this.loadingRecurringGiftsError = true;
        this.$log.error('Error loading recurring gifts', error);
      },
    );
  }

  selectGift(gift) {
    this.selectedGift = gift;
    this.setStep('step-2');
  }

  selectResult(selected) {
    this.redirectedGift = this.selectedGift.clone();
    angular.forEach(
      pick(selected, ['designationName', 'designationNumber']),
      (value, key) => {
        this.redirectedGift[key] = value;
      },
    );
    this.setStep('step-3');
  }
}

export default angular
  .module(componentName, [
    donationsService.name,
    redirectGiftStep1.name,
    redirectGiftStep2.name,
    redirectGiftStep3.name,
    retryModal.name,
    analyticsFactory.name,
  ])
  .component(componentName, {
    controller: RedirectGiftController,
    templateUrl: template,
    bindings: {
      changeState: '&',
      cancel: '&',
      setLoading: '&',
      complete: '&',
    },
  });

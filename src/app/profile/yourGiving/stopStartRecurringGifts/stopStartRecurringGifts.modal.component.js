import angular from 'angular';
import template from './stopStartRecurringGifts.modal.tpl.html';

import stopStartStep0 from './step0/stopStartStep0.component';
import stopGift from './stopGift/stopGift.component';
import redirectGift from './redirectGift/redirectGift.component';
import restartGift from './restartGift/restartGift.component';
import analyticsFactory from 'app/analytics/analytics.factory';

import { scrollModalToTop } from 'common/services/modalState.service';

const componentName = 'stopStartRecurringGiftsModal';

class StopStartRecurringGiftsModalController {
  /* @ngInject */
  constructor($window, analyticsFactory) {
    this.$window = $window;
    this.analyticsFactory = analyticsFactory;
    this.scrollModalToTop = scrollModalToTop;
  }

  $onInit() {
    this.changeState('step-0');
  }

  changeState(state) {
    if (state === 'change') this.$window.location = '/payment-methods.html';
    if (state !== 'step-0') this.giftAction = state;
    this.state = state;
    this.scrollModalToTop();
  }

  setLoading(loading) {
    this.isLoading = !!loading;
  }
}

export default angular
  .module(componentName, [
    stopStartStep0.name,
    stopGift.name,
    redirectGift.name,
    restartGift.name,
    analyticsFactory.name,
  ])
  .component(componentName, {
    controller: StopStartRecurringGiftsModalController,
    templateUrl: template,
    bindings: {
      close: '&',
      dismiss: '&',
    },
  });

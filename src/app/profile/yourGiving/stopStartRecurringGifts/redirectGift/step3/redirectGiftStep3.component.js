import angular from 'angular';
import template from './redirectGiftStep3.tpl.html';
import commonService from 'common/services/api/common.service';
import donationsService from 'common/services/api/donations.service';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';
import giftDetailsView from 'common/components/giftViews/giftDetailsView/giftDetailsView.component';
import giftUpdateView from 'common/components/giftViews/giftUpdateView/giftUpdateView.component';

import analyticsFactory from 'app/analytics/analytics.factory';

const componentName = 'redirectGiftStep3';

class RedirectGiftStep3Controller {
  /* @ngInject */
  constructor($log, commonService, donationsService, analyticsFactory) {
    this.$log = $log;
    this.commonService = commonService;
    this.donationsService = donationsService;
    this.state = 'update';
    this.analyticsFactory = analyticsFactory;
  }

  submitGift() {
    this.hasError = false;
    this.setLoading({ loading: true });
    this.donationsService.updateRecurringGifts(this.gift).subscribe(
      () => {
        this.onComplete();
        this.analyticsFactory.setEvent('recurring donation redirected');
        this.analyticsFactory.editRecurringDonation(this.gift);
      },
      (error) => {
        this.hasError = true;
        this.setLoading({ loading: false });
        this.$log.error('Error redirecting a gift', error);
      },
    );
  }

  previous() {
    this.hasError = false;
    if (this.state === 'confirm') {
      this.state = 'update';
    } else {
      this.onPrevious();
    }
  }
}

export default angular
  .module(componentName, [
    commonService.name,
    donationsService.name,
    giftListItem.name,
    giftDetailsView.name,
    giftUpdateView.name,
    analyticsFactory.name,
  ])
  .component(componentName, {
    controller: RedirectGiftStep3Controller,
    templateUrl: template,
    bindings: {
      stopGift: '<',
      gift: '<',
      onComplete: '&',
      onCancel: '&',
      onPrevious: '&',
      setLoading: '&',
    },
  });

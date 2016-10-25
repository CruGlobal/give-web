import angular from 'angular';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';
import giftUpdateView from 'common/components/giftViews/giftUpdateView/giftUpdateView.component';
import loading from 'common/components/loading/loading.component';

import donationsService from 'common/services/api/donations.service';
import commonService from 'common/services/api/common.service';

import template from './editRecurringGifts.tpl';

let componentName = 'step1EditRecurringGifts';

class EditRecurringGiftsController {

  /* @ngInject */
  constructor($log, donationsService, commonService) {
    this.$log = $log;
    this.donationsService = donationsService;
    this.commonService = commonService;
  }

  $onInit(){
    this.loadGifts();
  }

  loadGifts(){
    if(!this.recurringGifts){
      this.loading = true;
      this.loadingError = false;
      Observable.forkJoin(this.donationsService.getRecurringGifts(), this.commonService.getNextDrawDate())
        .subscribe(([gifts, nextDrawDate]) => {
            this.recurringGifts = gifts;
            this.nextDrawDate = nextDrawDate;
            this.loading = false;
          },
          (error) => {
            this.$log.error('Error loading recurring gifts or nextDrawDate', error);
            this.loading = false;
            this.loadingError = true;
          });
    }
  }
}

export default angular
  .module(componentName, [
    template.name,
    giftListItem.name,
    giftUpdateView.name,
    loading.name,
    donationsService.name,
    commonService.name
  ])
  .component(componentName, {
    controller: EditRecurringGiftsController,
    templateUrl: template.name,
    bindings: {
      recurringGifts: '<',
      paymentMethods: '<',
      dismiss: '&',
      next: '&'
    }
  });

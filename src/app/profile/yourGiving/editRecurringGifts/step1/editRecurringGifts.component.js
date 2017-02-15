import angular from 'angular';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';
import giftUpdateView from 'common/components/giftViews/giftUpdateView/giftUpdateView.component';

import donationsService from 'common/services/api/donations.service';

import template from './editRecurringGifts.tpl';

let componentName = 'step1EditRecurringGifts';

class EditRecurringGiftsController {

  /* @ngInject */
  constructor($log, donationsService) {
    this.$log = $log;
    this.donationsService = donationsService;
  }

  $onInit(){
    this.loadGifts();
  }

  loadGifts(){
    if(!this.recurringGifts){
      this.loading = true;
      this.loadingError = false;
      this.donationsService.getRecurringGifts(undefined, true)
        .subscribe(gifts => {
            this.recurringGifts = gifts;
            this.loading = false;
          },
          error => {
            this.$log.error('Error loading recurring gifts', error);
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
    donationsService.name
  ])
  .component(componentName, {
    controller: EditRecurringGiftsController,
    templateUrl: template.name,
    bindings: {
      recurringGifts: '<',
      dismiss: '&',
      next: '&'
    }
  });

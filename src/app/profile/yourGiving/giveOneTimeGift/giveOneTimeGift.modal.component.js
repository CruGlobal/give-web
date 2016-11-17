import angular from 'angular';
import map from 'lodash/map';
import concat from 'lodash/concat';

import loadingComponent from 'common/components/loading/loading.component';
import step1SelectRecentRecipients from './step1/selectRecentRecipients.component';
import step1SearchRecipients from './step1/searchRecipients.component';
import step2EnterAmounts from './step2/enterAmounts.component';

import RecurringGiftModel from 'common/models/recurringGift.model';

import donationsService from 'common/services/api/donations.service';

import template from './giveOneTimeGift.modal.tpl';

let componentName = 'giveOneTimeGiftModal';

class GiveOneTimeGiftModalController {

  /* @ngInject */
  constructor($log, donationsService) {
    this.$log = $log;
    this.donationsService = donationsService;
    this.recentRecipients = [];
    this.selectedRecipients = [];
  }

  $onInit(){
    this.loadRecentRecipients();
  }

  loadRecentRecipients(){
    this.state = 'loadingRecentRecipients';
    this.donationsService.getRecentRecipients()
      .subscribe(recentRecipients => {
        this.recentRecipients = map(recentRecipients, gift => (new RecurringGiftModel(gift)).setDefaultsSingleGift());
        this.hasRecentRecipients = this.recentRecipients && this.recentRecipients.length > 0;
        this.next();
      }, (error) => {
        this.state = 'errorLoadingRecentRecipients';
        this.$log.error('Error loading recent recipients', error);
      });
  }

  next(selectedRecipients, search, additionalRecipients){
    switch(this.state){
      case 'loadingRecentRecipients':
        if(this.hasRecentRecipients){
          this.state = 'step1SelectRecentRecipients';
        }else{
          this.state = 'step1SearchRecipients';
        }
        break;
      case 'errorLoadingRecentRecipients':
        this.state = 'step1SearchRecipients';
        break;
      case 'step1SelectRecentRecipients':
        this.selectedRecipients = selectedRecipients || [];
        if(!search && this.selectedRecipients && this.selectedRecipients.length > 0) {
          this.state = 'step2EnterAmounts';
        }else{
          this.state = 'step1SearchRecipients';
        }
        break;
      case 'step1SearchRecipients':
        this.recentRecipients = concat(this.recentRecipients, additionalRecipients);
        this.hasRecentRecipients = this.recentRecipients && this.recentRecipients.length > 0;
        this.selectedRecipients = concat(this.selectedRecipients, additionalRecipients);
        this.state = 'step2EnterAmounts';
        break;
      case 'step2EnterAmounts':
        this.selectedRecipients = selectedRecipients;
        // TODO: add gifts to cart and open mini cart
        this.close();
        break;
    }
  }

  previous(){
    switch(this.state){
      case 'step2EnterAmounts':
        if(this.hasRecentRecipients){
          this.state = 'step1SelectRecentRecipients';
        }else{
          this.state = 'step1SearchRecipients';
        }
        break;
      case 'step1SearchRecipients':
        this.state = 'step1SelectRecentRecipients';
        break;
    }
  }

}

export default angular
  .module(componentName, [
    template.name,
    loadingComponent.name,
    step1SelectRecentRecipients.name,
    step1SearchRecipients.name,
    step2EnterAmounts.name,
    donationsService.name
  ])
  .component(componentName, {
    controller: GiveOneTimeGiftModalController,
    templateUrl: template.name,
    bindings: {
      close: '&',
      dismiss: '&'
    }
  });

import angular from 'angular';
import map from 'lodash/map';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';

import loadingComponent from 'common/components/loading/loading.component';
import step0AddUpdatePaymentMethod from './step0/addUpdatePaymentMethod.component';
import step0paymentMethodList from './step0/paymentMethodList.component';
import step1EditRecurringGifts from './step1/editRecurringGifts.component';
import step2AddRecentRecipients from './step2/addRecentRecipients.component';
import step3ConfigureRecentRecipients from './step3/configureRecentRecipients.component';
import step4ConfirmRecurringGifts from './step4/confirmRecurringGifts.component';

import RecurringGiftModel from 'common/models/recurringGift.model';

import profileService from 'common/services/api/profile.service';
import donationsService from 'common/services/api/donations.service';
import commonService from 'common/services/api/common.service';
import validPaymentMethods from 'common/services/paymentHelpers/validPaymentMethods';

import template from './editRecurringGifts.modal.tpl';

let componentName = 'editRecurringGiftsModal';

class EditRecurringGiftsModalController {

  /* @ngInject */
  constructor($log, profileService, donationsService, commonService) {
    this.$log = $log;
    this.profileService = profileService;
    this.donationsService = donationsService;
    this.commonService = commonService;
  }

  $onInit(){
    this.loadPaymentMethods();
    this.loadRecentRecipients();
  }

  loadPaymentMethods(){
    this.state = 'loading';
    Observable.forkJoin([
        this.profileService.getPaymentMethods(),
        this.commonService.getNextDrawDate()
      ])
      .subscribe(([paymentMethods, nextDrawDate]) => {
        this.paymentMethods = paymentMethods;
        this.nextDrawDate = nextDrawDate;
        this.hasPaymentMethods = paymentMethods && paymentMethods.length > 0;
        this.validPaymentMethods = validPaymentMethods(paymentMethods);
        this.hasValidPaymentMethods = this.validPaymentMethods && this.validPaymentMethods.length > 0;
        RecurringGiftModel.paymentMethods = this.validPaymentMethods;
        RecurringGiftModel.nextDrawDate = this.nextDrawDate;
        this.next();
      }, (error) => {
        this.state = 'error';
        this.$log.error('Error loading payment methods', error);
      });
  }

  loadRecentRecipients(){
    this.loadingRecentRecipients = true;
    this.donationsService.getSuggestedRecipients()
      .subscribe(recentRecipients => {
        this.recentRecipients = map(recentRecipients, gift => (new RecurringGiftModel(gift)).setDefaults());
        this.hasRecentRecipients = this.recentRecipients && this.recentRecipients.length > 0;
        this.loadingRecentRecipients = false;
      }, (error) => {
        this.loadingRecentRecipients = false;
        this.$log.error('Error loading recent recipients', error);
      });
  }

  next(paymentMethod, recurringGifts, additions){
    switch(this.state){
      case 'loading':
        if(this.hasValidPaymentMethods){
          this.state = 'step1EditRecurringGifts';
        }else if(this.paymentMethods && this.paymentMethods.length > 0){
          this.state = 'step0PaymentMethodList';
        }else{
          this.state = 'step0AddUpdatePaymentMethod';
        }
        break;
      case 'error':
        this.state = 'step0AddUpdatePaymentMethod';
        break;
      case 'step0PaymentMethodList':
        this.paymentMethod = paymentMethod;
        this.state = 'step0AddUpdatePaymentMethod';
        break;
      case 'step0AddUpdatePaymentMethod':
        this.loadPaymentMethods();
        break;
      case 'step1EditRecurringGifts':
        this.recurringGifts = recurringGifts;
        this.state = 'step2AddRecentRecipients';
        break;
      case 'step2AddRecentRecipients':
        this.additions = additions;
        if(this.additions && this.additions.length > 0) {
          this.state = 'step3ConfigureRecentRecipients';
        }else{
          this.state = 'step4Confirm';
        }
        break;
      case 'step3ConfigureRecentRecipients':
        this.additions = additions;
        this.state = 'step4Confirm';
        break;
      case 'step4Confirm':
        this.close();
        break;
    }
  }

  previous(){
    switch(this.state){
      case 'step4Confirm':
        if(this.additions && this.additions.length > 0){
          this.state = 'step3ConfigureRecentRecipients';
        }else{
          this.state = 'step1EditRecurringGifts';
        }
        break;
      case 'step3ConfigureRecentRecipients':
        this.state = 'step2AddRecentRecipients';
        break;
      case 'step2AddRecentRecipients':
        this.state = 'step1EditRecurringGifts';
        break;

      // Can't go from step 1 to step 0 as the user has a valid payment method by that point. As a result we don't need a case to transition from it

      case 'step0AddUpdatePaymentMethod':
        this.state = 'step0PaymentMethodList';
        break;
    }
  }

}

export default angular
  .module(componentName, [
    template.name,
    loadingComponent.name,
    step0AddUpdatePaymentMethod.name,
    step0paymentMethodList.name,
    step1EditRecurringGifts.name,
    step2AddRecentRecipients.name,
    step3ConfigureRecentRecipients.name,
    step4ConfirmRecurringGifts.name,
    profileService.name,
    donationsService.name,
    commonService.name
  ])
  .component(componentName, {
    controller: EditRecurringGiftsModalController,
    templateUrl: template.name,
    bindings: {
      close: '&',
      dismiss: '&'
    }
  });

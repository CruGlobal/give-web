import 'babel/external-helpers';
import angular from 'angular';
import concat from 'lodash/concat';
import map from 'lodash/map';
import { Observable } from 'rxjs/Observable';

import accountBenefits from './accountBenefits/accountBenefits.component';
import help from '../checkout/help/help.component';
import displayAddressComponent from 'common/components/display-address/display-address.component';
import displayRateTotals from 'common/components/displayRateTotals/displayRateTotals.component';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';
import analyticsFactory from 'app/analytics/analytics.factory';

import capitalizeFilter from 'common/filters/capitalize.filter';

import commonModule from 'common/common.module';
import orderService from 'common/services/api/order.service';
import profileService from 'common/services/api/profile.service';
import sessionService from 'common/services/session/session.service';
import sessionModalService from 'common/services/session/sessionModal.service';

import template from './thankYou.tpl';

let componentName = 'thankYou';

class ThankYouController{

  /* @ngInject */
  constructor(orderService, profileService, sessionModalService, analyticsFactory, $log){
    this.orderService = orderService;
    this.profileService = profileService;
    this.sessionModalService = sessionModalService;
    this.analyticsFactory = analyticsFactory;
    this.$log = $log;
  }

  $onInit(){
    Observable.of(this.loadLastPurchase(), this.loadEmail()).subscribe(null, null, () => {
      this.analyticsFactory.pageLoaded();
    });
  }

  loadLastPurchase(){
    this.loading = true;
    let lastPurchaseLink = this.orderService.retrieveLastPurchaseLink();
    if(!lastPurchaseLink){
      this.$log.error('Session storage does not contain lastPurchaseLink. Cannot load data for thank you component.');
      this.loadingError =  'lastPurchaseLink missing';
      this.loading = false;
      return;
    }
    this.profileService.getPurchase(lastPurchaseLink)
      .subscribe((data) => {
          this.purchase = data;

          // Display Account Benefits Modal when registration-state is NEW or MATCHED
          if(this.purchase.donorDetails['registration-state'] !== 'COMPLETED') {
            this.sessionModalService.accountBenefits().then(() => {
              this.sessionModalService.userMatch();
            });
          }

          // Map rate totals to match format from order endpoint
          this.rateTotals = concat(
            [{
              frequency: 'Single',
              total: this.purchase.rawData['monetary-total'][0].display,
              amount: this.purchase.rawData['monetary-total'][0].amount
            }],
            map(this.purchase.rateTotals, (rateTotal) => {
              return {
                frequency: rateTotal.recurrence.display,
                total: rateTotal.cost.display,
                amount: rateTotal.cost.amount
              };
            })
          );
          delete this.loadingError;
          this.loading = false;
        },
        (error) => {
          this.$log.error('Error loading purchase data for thank you component', error);
          this.loadingError =  'api error';
          this.loading = false;
        });
  }

  loadEmail(){
    this.profileService.getEmail()
      .subscribe((data) => {
        this.email = data;
      });
  }

}

export default angular
  .module(componentName, [
    template.name,
    commonModule.name,
    analyticsFactory.name,
    accountBenefits.name,
    help.name,
    displayAddressComponent.name,
    displayRateTotals.name,
    loadingOverlay.name,
    capitalizeFilter.name,
    orderService.name,
    profileService.name,
    sessionService.name,
    sessionModalService.name
  ])
  .component(componentName, {
    controller: ThankYouController,
    templateUrl: template.name
  });

import 'babel/external-helpers';
import angular from 'angular';
import concat from 'lodash/concat';
import map from 'lodash/map';

import accountBenefits from './accountBenefits/accountBenefits.component';
import help from '../checkout/help/help.component';
import displayAddressComponent from 'common/components/display-address/display-address.component';
import displayRateTotals from 'common/components/displayRateTotals/displayRateTotals.component';

import capitalizeFilter from 'common/filters/capitalize.filter';

import orderService from 'common/services/api/order.service';
import purchasesService from 'common/services/api/purchases.service';
import profileService from 'common/services/api/profile.service';
import sessionService from 'common/services/session/session.service';
import sessionModalService from 'common/services/session/sessionModal.service';
import formatAddressForTemplate from 'common/services/addressHelpers/formatAddressForTemplate';

import template from './thankYou.tpl';

let componentName = 'thankYou';

class ThankYouController{

  /* @ngInject */
  constructor(orderService, purchasesService, profileService, sessionModalService, $log){
    this.orderService = orderService;
    this.purchasesService = purchasesService;
    this.profileService = profileService;
    this.sessionModalService = sessionModalService;
    this.$log = $log;
  }

  $onInit(){
    this.loadLastPurchase();
    this.loadEmail();
  }

  loadLastPurchase(){
    let lastPurchaseLink = this.orderService.retrieveLastPurchaseLink();
    if(!lastPurchaseLink){
      // TODO: should we redirect away or show an error message?
      return;
    }
    this.purchasesService.getPurchase(lastPurchaseLink)
      .subscribe((data) => {
        this.purchase = data;
        this.mailingAddress = formatAddressForTemplate(this.purchase.donorDetails['mailing-address']);
        if(this.purchase.paymentMeans.self.type === 'elasticpath.purchases.purchase.paymentmeans'){ //only credit card type has billing address
          this.billingAddress = formatAddressForTemplate(this.purchase.paymentMeans['billing-address'].address);
        }

        // Display Account Benefits Modal when registration-state is NEW or MATCHED
        if(this.purchase.donorDetails['registration-state'] !== 'COMPLETED') {
          this.sessionModalService.accountBenefits().then(() => {
            //TODO: Do we need to check donormatches again after sign in/up?
            this.sessionModalService.userMatch();
          });
        }

        // Map rate totals to match format from order endpoint
        this.rateTotals = concat(
          [{
            frequency: 'Single',
            total: this.purchase.rawData['monetary-total'][0].display
          }],
          map(this.purchase.rateTotals, (rateTotal) => {
            return {
              frequency: rateTotal.recurrence.display,
              total: rateTotal.cost.display
            };
          })
        );
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
    accountBenefits.name,
    help.name,
    displayAddressComponent.name,
    displayRateTotals.name,
    capitalizeFilter.name,
    orderService.name,
    purchasesService.name,
    profileService.name,
    sessionService.name,
    sessionModalService.name
  ])
  .component(componentName, {
    controller: ThankYouController,
    templateUrl: template.name
  });

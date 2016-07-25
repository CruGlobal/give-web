import angular from 'angular';
import find from 'lodash/find';

import cartSummary from '../cart-summary/cart-summary.component';

import template from './step-1.tpl';

let componentName = 'checkoutStep1';

class Step1Controller{

  /* @ngInject */
  constructor($q, cartService){
    this.cartService = cartService;
    this.$q = $q;

    this.init();
  }

  submitDetails(valid){
    if(!valid){ return; }
    let details = this.donorDetails;

    var requests = [this.cartService.updateDonorDetails(details.self.uri, details)];
    if(details.email){
      requests.push(this.cartService.addEmail(details.email));
    }
    this.$q.all(requests).then(() => {
      //go to Step 2
    });
  }

  refreshRegions(country){
    country = find(this.countries, function(v){ return v['display-name'].toUpperCase() === country; });
    if(!country){ return; }

    this.cartService.getGeographies.regions(country.links[0].uri).then((response) => {
      this.regions = response;
    });
  }

  init(){
    this.cartService.getDonorDetails()
      .then((data) => {
        if(data['donor-type'] === ''){
          data['donor-type'] = 'individual';
        }
        this.donorDetails = data;
      });

    this.cartService.getGeographies.countries().then((response) => {
      this.countries = response;
    });
  }
}

export default angular
  .module(componentName, [
    template.name,
    cartSummary.name
  ])
  .component(componentName, {
    controller: Step1Controller,
    templateUrl: template.name,
    bindings: {
      changeStep: '&'
    }
  });

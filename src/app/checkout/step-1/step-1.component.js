import angular from 'angular';
import 'angular-messages';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import find from 'lodash/find';

import cartService from 'common/services/api/cart.service';

import template from './step-1.tpl';

let componentName = 'checkoutStep1';

class Step1Controller{

  /* @ngInject */
  constructor($window, cartService){
    this.cartService = cartService;
    this.$window = $window;

    this.init();
  }

  submitDetails(){
    if(!this.detailsForm.$valid){ this.$window.scrollTo(0, 0); return; }
    let details = this.donorDetails;

    var requests = [this.cartService.updateDonorDetails(details.self.uri, details)];
    if(details.email){
      requests.push(this.cartService.addEmail(details.email));
    }
    Observable.forkJoin(requests)
      .subscribe(() => {
        this.changeStep({newStep: 'payment'});
      });
  }

  refreshRegions(country){
    country = find(this.countries, function(v){ return v['name'] === country; });
    if(!country){ return; }

    this.cartService.getGeographies.regions(country.links[0].uri)
      .subscribe((data) => {
        this.regions = data;
      });
  }

  init(){
    this.cartService.getDonorDetails()
      .subscribe((data) => {
        if(data['donor-type'] === ''){
          data['donor-type'] = 'individual';
        }
        this.donorDetails = data;
      });

    this.cartService.getGeographies.countries()
      .subscribe((data) => {
        this.countries = data;
      });
  }
}

export default angular
  .module(componentName, [
    template.name,
    'ngMessages',
    cartService.name
  ])
  .component(componentName, {
    controller: Step1Controller,
    templateUrl: template.name,
    bindings: {
      changeStep: '&'
    }
  });

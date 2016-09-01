import angular from 'angular';
import 'angular-messages';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import find from 'lodash/find';

import orderService from 'common/services/api/order.service';
import geographiesService from 'common/services/api/geographies.service';

import template from './step-1.tpl';

let componentName = 'checkoutStep1';

class Step1Controller{

  /* @ngInject */
  constructor($window, orderService, geographiesService){
    this.$window = $window;
    this.orderService = orderService;
    this.geographiesService = geographiesService;

    this.init();
  }

  submitDetails(){
    if(!this.detailsForm.$valid){ this.$window.scrollTo(0, 0); return; }
    let details = this.donorDetails;
    this.submissionError = '';

    var requests = [this.orderService.updateDonorDetails(details)];
    if(details.email){
      requests.push(this.orderService.addEmail(details.email));
    }
    Observable.forkJoin(requests)
      .subscribe(() => {
        this.changeStep({newStep: 'payment'});
      }, (error) => {
        console.log('Error saving donor contact info info', error);
        this.submissionError = error.data;
        this.$window.scrollTo(0, 0);
      });
  }

  refreshRegions(country){
    country = find(this.countries, {name: country});
    if(!country){ return; }

    this.geographiesService.getRegions(country)
      .subscribe((data) => {
        this.regions = data;
      });
  }

  init(){
    this.orderService.getDonorDetails()
      .subscribe((data) => {
        if(data['donor-type'] === ''){
          data['donor-type'] = 'Household';
        }
        this.donorDetails = data;
      });

    this.geographiesService.getCountries()
      .subscribe((data) => {
        this.countries = data;
      });
  }
}

export default angular
  .module(componentName, [
    template.name,
    'ngMessages',
    orderService.name,
    geographiesService.name
  ])
  .component(componentName, {
    controller: Step1Controller,
    templateUrl: template.name,
    bindings: {
      changeStep: '&'
    }
  });

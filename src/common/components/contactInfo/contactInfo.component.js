import angular from 'angular';
import 'angular-messages';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import find from 'lodash/find';

import loadingComponent from 'common/components/loading/loading.component';

import orderService from 'common/services/api/order.service';
import geographiesService from 'common/services/api/geographies.service';

import template from './contactInfo.tpl';

let componentName = 'contactInfo';

class Step1Controller{

  /* @ngInject */
  constructor($log, orderService, geographiesService){
    this.$log = $log;
    this.orderService = orderService;
    this.geographiesService = geographiesService;

    this.donorDetails = {
      mailingAddress: {
        country: 'US'
      }
    };
  }

  $onInit(){
    this.loadDonorDetails();
    this.loadCountries();
  }

  $onChanges(changes) {
    if (changes.submitted.currentValue === true) {
      this.submitDetails();
    }
  }

  loadDonorDetails(){
    this.orderService.getDonorDetails()
      .subscribe((data) => {
        if(data['donor-type'] === ''){
          data['donor-type'] = 'Household';
        }
        this.donorDetails = data;
      });
  }

  loadCountries(){
    this.geographiesService.getCountries()
      .subscribe((data) => {
        this.countries = data;
        this.refreshRegions(this.donorDetails.mailingAddress.country);
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

  submitDetails(){
    this.detailsForm.$setSubmitted();
    if(this.detailsForm.$valid) {
      let details = this.donorDetails;
      this.submissionError = '';

      var requests = [this.orderService.updateDonorDetails(details)];
      if (details.email) {
        requests.push(this.orderService.addEmail(details.email));
      }
      Observable.forkJoin(requests)
        .subscribe(() => {
          this.onSubmit({success: true});
        }, (error) => {
          this.$log.warn('Error saving donor contact info', error);
          this.submissionError = error.data;
          this.onSubmit({success: false});
        });
    }else{
      this.onSubmit({success: false});
    }
  }
}

export default angular
  .module(componentName, [
    template.name,
    'ngMessages',
    loadingComponent.name,
    orderService.name,
    geographiesService.name
  ])
  .component(componentName, {
    controller: Step1Controller,
    templateUrl: template.name,
    bindings: {
      submitted: '<',
      onSubmit: '&'
    }
  });

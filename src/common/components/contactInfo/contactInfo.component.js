import angular from 'angular';
import 'angular-messages';
import get from 'lodash/get';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import loadingComponent from 'common/components/loading/loading.component';
import addressForm from 'common/components/addressForm/addressForm.component';

import orderService from 'common/services/api/order.service';

import template from './contactInfo.tpl';

let componentName = 'contactInfo';

class Step1Controller{

  /* @ngInject */
  constructor($log, orderService){
    this.$log = $log;
    this.orderService = orderService;

    this.donorDetails = {
      mailingAddress: {
        country: 'US'
      }
    };
  }

  $onInit(){
    this.loadDonorDetails();
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
        this.nameFieldsDisabled = !!get(this.donorDetails, ['name', 'given-name']) || !!get(this.donorDetails, ['name', 'family-name']);
        this.spouseNameFieldsDisabled = !!get(this.donorDetails, ['spouse-name', 'given-name']) || !!get(this.donorDetails, ['spouse-name', 'family-name']);
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
    addressForm.name,
    orderService.name
  ])
  .component(componentName, {
    controller: Step1Controller,
    templateUrl: template.name,
    bindings: {
      submitted: '<',
      onSubmit: '&'
    }
  });

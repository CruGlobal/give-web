import angular from 'angular';
import 'angular-messages';
import includes from 'lodash/includes';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import addressForm from 'common/components/addressForm/addressForm.component';

import orderService from 'common/services/api/order.service';
import sessionService, {Roles} from 'common/services/session/session.service';

import template from './contactInfo.tpl';

let componentName = 'contactInfo';

class Step1Controller{

  /* @ngInject */
  constructor($log, orderService, sessionService){
    this.$log = $log;
    this.orderService = orderService;
    this.sessionService = sessionService;

    this.donorDetails = {
      mailingAddress: {
        country: 'US'
      }
    };
  }

  $onInit(){
    this.loadDonorDetails();
    this.showTitle = this.sessionService.getRole() === Roles.public;
  }

  $onChanges(changes) {
    if (changes.submitted.currentValue === true) {
      this.submitDetails();
    }
  }

  loadDonorDetails(){
    this.loadingDonorDetailsError = false;
    this.loadingDonorDetails = true;
    this.orderService.getDonorDetails()
      .subscribe((data) => {
        if(data['donor-type'] === ''){
          data['donor-type'] = 'Household';
        }
        this.loadingDonorDetails = false;
        this.donorDetails = data;
        this.nameFieldsDisabled = this.donorDetails['registration-state'] === 'COMPLETED';
        if(!this.nameFieldsDisabled && includes([Roles.registered, Roles.identified], this.sessionService.getRole())) {
          // Pre-populate first, last and email from session if missing from donorDetails
          if(!this.donorDetails['name']['given-name'] && angular.isDefined(this.sessionService.session.first_name)) {
            this.donorDetails['name']['given-name'] = this.sessionService.session.first_name;
          }
          if(!this.donorDetails['name']['family-name'] && angular.isDefined(this.sessionService.session.last_name)) {
            this.donorDetails['name']['family-name'] = this.sessionService.session.last_name;
          }
          if(angular.isUndefined(this.donorDetails['email']) && angular.isDefined(this.sessionService.session.email)) {
            this.donorDetails['email'] = this.sessionService.session.email;
          }
        }
      },
      error => {
        this.loadingDonorDetails = false;
        this.loadingDonorDetailsError = true;
        this.$log.error('Error loading donorDetails.', error);
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
    addressForm.name,
    orderService.name,
    sessionService.name
  ])
  .component(componentName, {
    controller: Step1Controller,
    templateUrl: template.name,
    bindings: {
      submitted: '<',
      onSubmit: '&'
    }
  });

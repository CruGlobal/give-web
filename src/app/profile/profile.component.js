import angular from 'angular';

import template from './profile.tpl';

import profileService from 'common/services/api/profile.service';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';
import sessionEnforcerService, {EnforcerCallbacks, EnforcerModes} from 'common/services/session/sessionEnforcer.service';
import {Roles} from 'common/services/session/session.service';

let componentName = 'profile';

class ProfileController{

  constructor( $window, $location, $log, sessionEnforcerService, profileService ) {
    this.$window = $window;
    this.$log = $log;
    this.$location = $location;
    this.sessionEnforcerService = sessionEnforcerService;
    this.profileService = profileService;
  }

  $onInit() {
    // Enforce donor role view access manage-giving
    this.enforcerId = this.sessionEnforcerService([Roles.registered], {
      [EnforcerCallbacks.signIn]: () => {
        // Authentication success
      },
      [EnforcerCallbacks.cancel]: () => {
        // Authentication failure
        this.$window.location = '/';
      }
    }, EnforcerModes.donor);
    this.loadDonorDetails();
    this.loadEmail();
    this.loadPhoneNumbers();
  }

  loadDonorDetails() {
    this.donorDetialsLoading = true;
    this.profileService.getDonorDetails()
      .subscribe(
        donorDetails => {
          this.donorDetails = donorDetails;
          this.donorDetialsLoading = false;
        },
        error => {
          this.donorDetialsLoading = false;
          this.error = 'Failed loading profile information.';
          this.$log.error(this.error, error.data);
        }
      );
  }

  loadEmail() {
    this.emailLoading = true;
    this.profileService.getEmail()
      .subscribe(
        email => {
          this.email = email;
          this.emailLoading = false;
        },
        error => {
          this.error = 'Failed loading profile information.';
          this.emailLoading = false;
          this.$log.error(this.error, error.data);
        }
      );
  }

  loadPhoneNumbers() {
    this.phonesLoading = true;
    this.profileService.getPhoneNumbers()
      .subscribe(
        numbers => {
          this.phoneNumbers = numbers;
          this.phonesLoading = false;
        },
        error => {
          this.error = 'Failed loading profile information.';
          this.$log.error(this.error, error.data);
          this.phonesLoading = false;
        }
      );
  }

  addPhoneNumber(){
    this.phoneNumbers.push({
      'phone-number': '',
      'phone-number-type': 'Mobile',
      'primary': false
    });
  }
}

export default angular
  .module(componentName, [
    template.name,
    profileService.name,
    sessionEnforcerService.name,
    sessionEnforcerService.name,
    loadingOverlay.name
  ])
  .component(componentName, {
    controller: ProfileController,
    templateUrl: template.name
  });

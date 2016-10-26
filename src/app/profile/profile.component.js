import angular from 'angular';

import template from './profile.tpl';

import profileService from 'common/services/api/profile.service';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';
import sessionEnforcerService, {EnforcerCallbacks, EnforcerModes} from 'common/services/session/sessionEnforcer.service';
import {Roles} from 'common/services/session/session.service';
import formatAddressForTemplate from 'common/services/addressHelpers/formatAddressForTemplate';
import showErrors from 'common/filters/showErrors.filter';

import pull from 'lodash/pull';
import find from 'lodash/find';

let componentName = 'profile';

class ProfileController {

  constructor($window, $location, $log, sessionEnforcerService, profileService) {
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
        this.loadDonorDetails();
        this.loadMailingAddress();
        this.loadEmail();
        this.loadPhoneNumbers();
      },
      [EnforcerCallbacks.cancel]: () => {
        // Authentication failure
        this.$window.location = '/';
      }
    }, EnforcerModes.donor);
    this.loadDonorDetails();
    this.loadMailingAddress();
    this.loadEmail();
    this.loadPhoneNumbers();
  }

  loadDonorDetails() {
    this.donorDetialsLoading = true;
    this.profileService.getProfileDonorDetails()
      .subscribe(
        donorDetails => {
          console.log(donorDetails);
          this.donorDetails = donorDetails;
          this.donorDetialsLoading = false;
        },
        error => {
          this.donorDetialsLoading = false;
          this.donorDetailsError = 'Failed loading profile details.';
          this.$log.error(this.donorDetailsError, error.data);
        }
      );
  }

  updateDonorDetails(){
    this.donorDetialsLoading = true;
    console.log(this.donorDetails);
    this.profileService.updateProfileDonorDetails(this.donorDetails)
      .subscribe(
        () => {
          this.donorDetialsLoading = false;
          this.donorDetailsForm.$setPristine();
        },
        error => {
          this.donorDetialsLoading = false;
          this.donorDetailsError = 'Failed updating profile details.';
          this.$log(this.donorDetailsError, error.data);
        }
      )
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
          this.emailAddressError = 'Failed loading email.';
          this.emailLoading = false;
          this.$log.error(this.emailAddressError, error.data);
        }
      );
  }

  updateEmail() {
    let email = {
      email: this.email
    };
    this.emailLoading = true;
    this.profileService.updateEmail(email)
      .subscribe(
        data => {
          this.email = data.email;
          this.emailLoading = false;
          this.emailAddressForm.$setPristine();
        },
        error => {
          this.emailAddressError = 'Failed updating email address.';
          this.$log.error(this.emailAddressError, error);
          this.emailLoading = false;
        }
      );
  }

  loadPhoneNumbers() {
    this.phonesLoading = true;
    this.profileService.getPhoneNumbers()
      .subscribe(
        data => {
          this.phoneNumbers = data || [];
          this.phonesLoading = false;
        },
        error => {
          this.phoneNumberError = 'Failed loading phone numbers.';
          this.$log.error(this.phoneNumberError, error.data);
          this.phonesLoading = false;
        }
      );
  }

  addPhoneNumber() {
    this.phoneNumbers.push({
      'phone-number': '',
      'phone-number-type': 'Mobile',
      'primary': false
    });
  }

  updatePhoneNumbers(){
    angular.forEach(this.phoneNumbers, (item) => {
      this.phonesLoading = true;
      if(item.self && item.delete == undefined) { // update existing phone number
        this.profileService.updatePhoneNumber(item)
          .subscribe(
            () => {
              this.phonesLoading = false;
              this.resetPhoneNumberForms();
            },
            error => {
              this.phoneNumberError = 'Failed updating phone numbers.';
              this.$log.error(this.phoneNumberError, error.data);
              this.phonesLoading = false;
            }
          );
      } else if(item.self && item.delete) { // delete existing phone number
        this.profileService.deletePhoneNumber(item)
          .subscribe(
            () => {
              this.phonesLoading = false;
              pull(this.phoneNumbers, item);
              this.resetPhoneNumberForms();
            },
            error => {
              this.phoneNumberError = 'Failed deleting phone numbers.';
              this.$log.error(this.phoneNumberError, error.data);
              this.phonesLoading = false;
            }
          );
      } else if(!item.self && !item.delete){ // add new phone number
        this.profileService.addPhoneNumber(item)
          .subscribe(
            data => {
              this.phonesLoading = false;
              pull(this.phoneNumbers, item);
              this.phoneNumbers.push(data);
              this.resetPhoneNumberForms();
            },
            error => {
              this.phoneNumberError = 'Failed adding phone numbers.';
              this.$log.error(this.phoneNumberError, error.data);
              this.phonesLoading = false;
            }
          );
      }
    });
  }

  deletePhoneNumber(phone, form) {
    phone.delete = true;
    if(!form) return;
    if(phone.self) { // set existing phone number for a deletion
      form.$setDirty();
    } else { // reset validations
      form.$setValidity();
      form.$setPristine();
    }
  }

  invalidPhoneNumbers() {
    let hasInvalid = false;
    angular.forEach(this.phoneNumberForms, (form) => {
      if(form && form.$invalid) {
        hasInvalid = true;
        return;
      }
    });
    return hasInvalid;
  }

  dirtyPhoneNumbers() {
    let hasDirty = false;
    angular.forEach(this.phoneNumberForms, (form) => {
      if(form && form.$dirty) {
        hasDirty = true;
        return;
      }
    });
    return hasDirty;
  }

  resetPhoneNumberForms() {
    angular.forEach(this.phoneNumberForms, (form) => {
      if(form)form.$setPristine();
    });
  }

  loadMailingAddress(uri) {
    this.mailingAddressLoading = true;
    this.profileService.getMailingAddress(uri)
      .subscribe(
        data => {
          if(uri) {
            this.mailingAddressLoading = false;
            data.address = formatAddressForTemplate(data.address);
            this.mailingAddress = data;
          } else {
            let mailingAddress = find(data.links, (link) => {
              return link.rel == 'mailingaddress';
            });
            this.loadMailingAddress(mailingAddress.uri);
          }
        },
        error => {
          this.mailingAddressLoading = false;
          this.mailingAddressError = 'Failed loading mailing address.';
          this.$log.error(this.mailingAddressError, error.data);
        }
      )
  }

  updateMailingAddress() {
    this.mailingAddressLoading = true;
    this.profileService.updateMailingAddress(this.mailingAddress)
      .subscribe(
        () => {
          this.mailingAddressLoading = false;
          this.mailingAddressForm.$setPristine();
        },
        error => {
          this.mailingAddressLoading = false;
          this.mailingAddressError = 'Failed loading mailing address.';
          this.$log.error(this.mailingAddressError, error.data);
        }
      )
  }

  addSpouse() {
    this.donorDetails['spouse-name'] = {};
    this.donorDetailsForm.$dirty = true;
  }

  notReadyToSubmit() {
    return this.mailingAddressForm.$invalid || this.emailAddressForm.$invalid || this.invalidPhoneNumbers() || this.donorDetailsForm.$invalid ||
      (!this.mailingAddressForm.$dirty && !this.emailAddressForm.$dirty && !this.dirtyPhoneNumbers() && !this.donorDetailsForm.$dirty);
  }

  onSubmit(){
    if(this.donorDetailsForm.$dirty && this.donorDetailsForm.$valid) {
      this.updateDonorDetails();
    }
    if(this.emailAddressForm.$dirty && this.emailAddressForm.$valid) {
      this.updateEmail();
    }
    if(this.dirtyPhoneNumbers() && !this.invalidPhoneNumbers()) {
      this.updatePhoneNumbers();
    }
    if(this.mailingAddressForm.$dirty && this.mailingAddressForm.$valid) {
      this.updateMailingAddress();
    }
  }

}

export default angular
  .module(componentName, [
    template.name,
    profileService.name,
    sessionEnforcerService.name,
    loadingOverlay.name,
    showErrors.name
  ])
  .component(componentName, {
    controller: ProfileController,
    templateUrl: template.name
  });

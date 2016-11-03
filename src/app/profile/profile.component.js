import angular from 'angular';

import template from './profile.tpl';

import profileService from 'common/services/api/profile.service';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';
import sessionEnforcerService, {EnforcerCallbacks, EnforcerModes} from 'common/services/session/sessionEnforcer.service';
import {Roles} from 'common/services/session/session.service';
import formatAddressForTemplate from 'common/services/addressHelpers/formatAddressForTemplate';
import showErrors from 'common/filters/showErrors.filter';

import pull from 'lodash/pull';

let componentName = 'profile';

class ProfileController {

  constructor($window, $location, $log, sessionEnforcerService, profileService) {
    this.$window = $window;
    this.$log = $log;
    this.$location = $location;
    this.sessionEnforcerService = sessionEnforcerService;
    this.profileService = profileService;
    this.phoneNumbers = [];
  }

  $onInit() {
    // Enforce donor role view access manage-giving
    this.enforcerId = this.sessionEnforcerService([Roles.registered], {
      [EnforcerCallbacks.signIn]: () => {
        // Authentication success
        this.loadDonorDetails();
        this.loadMailingAddress();
        this.loadEmail();
      },
      [EnforcerCallbacks.cancel]: () => {
        // Authentication failure
        this.$window.location = '/';
      }
    }, EnforcerModes.donor);
  }

  loadDonorDetails() {
    this.donorDetialsLoading = true;
    this.phonesLoading = true;
    this.profileService.getProfileDonorDetails()
      .subscribe(
        donorDetails => {
          this.donorDetails = donorDetails;
          this.hasSpouse = this.donorDetails['spouse-name']['family-name'] ? true : false;
          this.donorDetialsLoading = false;
          this.loadPhoneNumbers(); //  phone number's owner output depends on donor details
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
    this.profileService.updateProfileDonorDetails(this.donorDetails)
      .subscribe(
        () => {
          this.donorDetialsLoading = false;
          this.donorDetailsForm.$setPristine();
          this.success = true;
        },
        error => {
          this.donorDetialsLoading = false;
          this.donorDetailsError = 'Failed updating profile details.';
          this.$log.error(this.donorDetailsError, error.data);
        },
        () => {
          if(this.spouseEmailForm && this.spouseEmailForm.$dirty && this.spouseEmailForm.$valid) {
            this.updateEmail(true);
          }
        }
      );
  }

  loadEmail() {
    this.emailLoading = true;
    this.profileService.getEmails()
      .subscribe(
        emails => {
          this.donorEmail = emails ? emails[0] : '';
          this.spouseEmail = emails ? emails[1] : '';
          this.emailLoading = false;
        },
        error => {
          this.emailAddressError = 'Failed loading email.';
          this.emailLoading = false;
          this.$log.error(this.emailAddressError, error.data);
        }
      );
  }

  updateEmail(spouse) {
    let email =  spouse ? this.spouseEmail : this.donorEmail;
    this.emailLoading = true;
    this.profileService.updateEmail(email,spouse)
      .subscribe(
        data => {
          if(spouse) {
            this.spouseEmail = data;
            this.spouseEmailForm.$setPristine();
          } else {
            this.donorEmail = data;
            this.donorEmailForm.$setPristine();
          }
          this.success = true;
          this.emailLoading = false;
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
          this.phonesLoading = false;
          angular.forEach(data, (item) => {
            item.ownerChanged = false;
            this.phoneNumbers.push(item);
          });
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
      'primary': false,
      'spouse': false
    });
  }

  phoneOwner(spouse) {
    return spouse ? this.donorDetails['spouse-name']['given-name'] : this.donorDetails.name['given-name'];
  }

  updatePhoneNumbers(){
    for(let i=0;i<this.phoneNumbers.length;i++) {
      let item = this.phoneNumbers[i];
      this.phonesLoading = true;

      if(item.ownerChanged) { // switch of phone owner (set to delete phone and add it again with new owner)
        item.delete = true;
        this.phoneNumbers.push({
          'phone-number': item['phone-number'],
          'phone-number-type': item['phone-number-type'],
          'primary': false,
          'spouse': item.spouse
        });
      }
      if(item.self && item.delete == undefined) { // update existing phone number
        this.profileService.updatePhoneNumber(item)
          .subscribe(
            () => {
              this.resetPhoneNumberForms();
              this.success = true;
              this.phonesLoading = false;
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
              pull(this.phoneNumbers, item);
              this.resetPhoneNumberForms();
              this.success = true;
              this.phonesLoading = false;
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
              data.spouse = item.spouse;
              this.resetPhoneNumberForms();
              this.success = true;
              item['phone-number'] = data['phone-number'];
              this.phonesLoading = false;
            },
            error => {
              this.phoneNumberError = 'Failed adding phone numbers.';
              this.$log.error(this.phoneNumberError, error.data);
              this.phonesLoading = false;
            }
          );
      }
    }
  }

  deletePhoneNumber(phone, index) {
    phone.delete = true;
    if(phone.self) { // set existing phone number for a deletion
      this.phoneNumberForms[index].$setDirty();
    } else { // reset validations
      this.phoneNumberForms[index].$setValidity();
      this.phoneNumberForms[index].$setPristine();
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

  loadMailingAddress() {
    this.mailingAddressLoading = true;
    this.profileService.getMailingAddress()
      .subscribe(
        data => {
          data.address = formatAddressForTemplate(data.address);
          this.mailingAddress = data;
          this.mailingAddressLoading = false;
        },
        error => {
          this.mailingAddressLoading = false;
          this.mailingAddressError = 'Failed loading mailing address.';
          this.$log.error(this.mailingAddressError, error.data);
        }
      );
  }

  updateMailingAddress() {
    this.mailingAddressLoading = true;
    this.mailingAddress.name = this.donorDetails.name;
    this.profileService.updateMailingAddress(this.mailingAddress)
      .subscribe(
        () => {
          this.mailingAddressLoading = false;
          this.mailingAddressForm.$setPristine();
          this.success = true;
        },
        error => {
          this.mailingAddressLoading = false;
          this.mailingAddressError = 'Failed loading mailing address.';
          this.$log.error(this.mailingAddressError, error.data);
        }
      );
  }

  saveSpouse() {
    this.donorDetialsLoading = true;
    let path = this.donorDetails.self.uri.replace('selfservicedonordetails', 'donordetails') + '/spousedetails';
    this.profileService.addSpouse(path, this.donorDetails['spouse-name'])
      .subscribe(
        () => {
          this.addingSpouse = false;
          this.hasSpouse = true;
          this.donorDetialsLoading = false;
        },
        error => {
          this.donorDetailsError = 'Failed saving spouse info. ';
          this.$log.error(error.data, this.donorDetailsError);
          this.donorDetialsLoading = false;
        },
        () => {
          if(this.spouseDetailsForm.title.$dirty || this.spouseDetailsForm.suffix.$dirty) {
            this.updateDonorDetails();
          }
        }
      );
  }

  invalid() {
    return this.mailingAddressForm.$invalid ||
      this.donorEmailForm.$invalid ||
      this.invalidPhoneNumbers() ||
      this.donorDetailsForm.$invalid ||
      (this.spouseEmailForm ? this.spouseEmailForm.$invalid : false) ||
      (this.addingSpouse ? this.spouseDetailsForm.$invalid : false);
  }

  hasError() {
    return this.donorDetailsError || this.emailAddressError || this.phoneNumberError || this.mailingAddressError;
  }

  touched() {
    return this.mailingAddressForm.$dirty ||
      this.donorEmailForm.$dirty ||
      this.dirtyPhoneNumbers() ||
      this.donorDetailsForm.$dirty ||
      (this.addingSpouse || this.hasSpouse ? this.spouseEmailForm.$dirty : false) ||
      (this.addingSpouse || this.hasSpouse ? this.spouseDetailsForm.$dirty : false);
  }

  loading() {
    return this.phonesLoading || this.mailingAddressLoading || this.donorDetialsLoading || this.emailLoading;
  }

  onSubmit(){
    this.donorDetailsError = '';
    this.emailAddressError = '';
    this.phoneNumberError = '';
    this.mailingAddressError = '';
    this.success = false;
    if((this.donorDetailsForm.$dirty && this.donorDetailsForm.$valid && !this.addingSpouse) || (this.spouseDetailsForm.$dirty && this.spouseDetailsForm.$valid && !this.addingSpouse)) {
      this.updateDonorDetails();
    }
    // if spouse is being created we need to make sure that email is created after spouse details are created
    if(this.spouseEmailForm && this.spouseEmailForm.$dirty && this.spouseEmailForm.$valid && this.addingSpouse) {
      this.emailLoading = true;
    }
    if(this.spouseEmailForm && this.spouseEmailForm.$dirty && this.spouseEmailForm.$valid && this.hasSpouse) {
      this.updateEmail(true);
    }
    if(this.spouseDetailsForm && this.spouseDetailsForm.$dirty && this.spouseDetailsForm.$valid && this.addingSpouse) {
      this.saveSpouse();
    }
    if(this.donorEmailForm.$dirty && this.donorEmailForm.$valid) {
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

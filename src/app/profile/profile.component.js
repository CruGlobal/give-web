import angular from 'angular'
import 'angular-messages'
import pull from 'lodash/pull'
import assign from 'lodash/assign'
import pickBy from 'lodash/pickBy'
import omit from 'lodash/omit'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/forkJoin'
import 'rxjs/add/operator/do'
import { phoneNumberRegex } from 'common/app.constants'
import template from './profile.tpl.html'
import profileService from 'common/services/api/profile.service'
import addressForm from 'common/components/addressForm/addressForm.component'
import sessionEnforcerService, {
  EnforcerCallbacks,
  EnforcerModes
} from 'common/services/session/sessionEnforcer.service'
import { Roles, SignOutEvent } from 'common/services/session/session.service'
import showErrors from 'common/filters/showErrors.filter'
import commonModule from 'common/common.module'
import { titles, legacyTitles } from './titles.fixture'

const componentName = 'profile'

class ProfileController {
  /* @ngInject */
  constructor ($rootScope, $window, $location, $log, $scope, sessionEnforcerService, envService, profileService, analyticsFactory) {
    this.$rootScope = $rootScope
    this.$window = $window
    this.$location = $location
    this.$log = $log
    this.$scope = $scope
    this.sessionEnforcerService = sessionEnforcerService
    this.profileService = profileService
    this.analyticsFactory = analyticsFactory
    this.phoneNumbers = []
    this.donorDetailsLoading = true
    this.emailLoading = true
    this.phonesLoading = true
    this.mailingAddressLoading = true
    this.acsUrl = envService.read('acsUrl')
  }

  $onInit () {
    // Enforce donor role view access manage-giving
    this.enforcerId = this.sessionEnforcerService([Roles.registered], {
      [EnforcerCallbacks.signIn]: () => {
        // Authentication success
        this.loadDonorDetails()
        this.loadMailingAddress()
        this.loadEmail()
        this.loadPhoneNumbers()
      },
      [EnforcerCallbacks.cancel]: () => {
        // Authentication failure
        this.$window.location = '/'
      }
    }, EnforcerModes.donor)

    this.$rootScope.$on(SignOutEvent, (event) => this.signedOut(event))

    this.syncPhoneValidators()

    this.analyticsFactory.pageLoaded()
  }

  $onDestroy () {
    // Destroy enforcer
    this.sessionEnforcerService.cancel(this.enforcerId)
  }

  signedOut (event) {
    if (!event.defaultPrevented) {
      event.preventDefault()
      this.$window.location = '/'
    }
  }

  loadDonorDetails () {
    this.donorDetailsLoading = true
    this.profileService.getProfileDonorDetails()
      .subscribe(
        donorDetails => {
          this.donorDetails = donorDetails
          this.hasSpouse = !!this.donorDetails['spouse-name']['family-name']
          this.initTitles()
          this.setPKeys()
          this.donorDetailsLoading = false
        },
        error => {
          this.donorDetailsLoading = false
          this.donorDetailsError = 'loading'
          this.$log.error('Failed loading profile details', error)
        }
      )
  }

  initTitles () {
    this.availableTitles = assign(
      { '': '' },
      pickBy(legacyTitles, (val, key) => key === this.donorDetails['spouse-name'].title || key === this.donorDetails.name.title),
      titles
    )
  }

  updateDonorDetails () {
    this.donorDetailsLoading = true
    const updatedDetails = this.addingSpouse
      ? omit(this.donorDetails, 'spouse-name') // Adding a spouse is handled by saveSpouse
      : this.donorDetails
    this.profileService.updateProfileDonorDetails(updatedDetails)
      .subscribe(
        () => {
          this.donorDetailsLoading = false
          this.donorDetailsForm.$setPristine()
          if (this.spouseDetailsForm) this.spouseDetailsForm.$setPristine()
          this.success = true
        },
        error => {
          this.donorDetailsLoading = false
          this.donorDetailsError = 'updating'
          this.$log.error('Failed updating profile details', error)
        },
        () => {
          if (this.spouseEmailForm && this.spouseEmailForm.$dirty && this.spouseEmailForm.$valid) {
            this.updateEmail(true)
          }
        }
      )
  }

  loadEmail () {
    this.emailLoading = true
    this.profileService.getEmails()
      .subscribe(
        emails => {
          this.donorEmail = emails ? emails[0] : { email: '' }
          this.spouseEmail = emails ? emails[1] : { email: '' }
          this.emailLoading = false
        },
        error => {
          this.emailAddressError = 'loading'
          this.emailLoading = false
          this.$log.error('Failed loading email.', error)
        }
      )
  }

  updateEmail (spouse) {
    const email = spouse ? this.spouseEmail : this.donorEmail
    this.emailLoading = true
    this.profileService.updateEmail(email, spouse)
      .subscribe(
        data => {
          if (spouse) {
            this.spouseEmail = data
            this.spouseEmailForm.$setPristine()
          } else {
            this.donorEmail = data
            this.donorEmailForm.$setPristine()
          }
          this.success = true
          this.emailLoading = false
          this.loadDonorDetails()
        },
        error => {
          this.emailAddressError = 'updating'
          this.$log.error('Failed updating email address.', error)
          this.emailLoading = false
        }
      )
  }

  setPKeys () {
    this.profilePKey = this.donorDetails['acs-profile-pkey']
    this.spousePKey = this.donorDetails['acs-spouse-profile-pkey']
  }

  linkToAdobeCampaign (pKey) {
    if (pKey) {
      window.open(`${this.acsUrl}${pKey}`)
    }
  }

  syncPhoneValidators () {
    this.$scope.$watchCollection('$ctrl.phoneNumberForms', forms => {
      angular.forEach(forms, form => {
        if (form && form.phoneNumber && form.phoneNumber.$validators) {
          form.phoneNumber.$validators.phone = number => phoneNumberRegex.test(number)
        }
      })
    })
  }

  loadPhoneNumbers () {
    this.phonesLoading = true
    this.profileService.getPhoneNumbers()
      .subscribe(
        data => {
          this.phoneNumbers = []
          this.phonesLoading = false
          angular.forEach(data, (item) => {
            item.ownerChanged = false
            this.phoneNumbers.push(item)
          })
        },
        error => {
          this.phoneNumberError = 'loading'
          this.$log.error('Failed loading phone numbers', error)
          this.phonesLoading = false
        }
      )
  }

  addPhoneNumber () {
    this.phoneNumbers.push({
      'phone-number': '',
      'phone-number-type': 'Mobile',
      primary: false,
      'is-spouse': false
    })
  }

  updatePhoneNumbers () {
    const requests = []
    for (let i = 0; i < this.phoneNumbers.length; i++) {
      const item = this.phoneNumbers[i]
      this.phonesLoading = true

      if (this.phoneNumberForms[i] && !this.phoneNumberForms[i].$dirty) continue

      if (item.ownerChanged) { // switch of phone owner (set to delete phone and add it again with new owner)
        item.delete = true
        this.phoneNumbers.push({
          'phone-number': item['phone-number'],
          'phone-number-type': item['phone-number-type'],
          primary: false,
          'is-spouse': item['is-spouse']
        })
      }
      if (item.self && item.delete === undefined) { // update existing phone number
        requests.push(this.profileService.updatePhoneNumber(item))
      } else if (item.self && item.delete) { // delete existing phone number
        requests.push(this.profileService.deletePhoneNumber(item)
          .do(() => {
            pull(this.phoneNumbers, item)
          })
        )
      } else if (!item.self && !item.delete) { // add new phone number
        requests.push(this.profileService.addPhoneNumber(item)
          .do(data => {
            assign(item, data)
          })
        )
      }
      Observable.forkJoin(requests)
        .subscribe(null,
          error => {
            if (error && error.data === 'Failed to create phone number because it already exists.') {
              this.phoneNumberError = 'duplicate'
            } else {
              this.phoneNumberError = 'updating'
            }
            this.$log.error('Error updating phone numbers', error)
            this.phonesLoading = false
          },
          () => {
            this.resetPhoneNumberForms()
            this.success = true
            this.phonesLoading = false
          }
        )
    }
  }

  deletePhoneNumber (phone, index) {
    phone.delete = true
    if (phone.self) { // set existing phone number for a deletion
      this.phoneNumberForms[index].$setDirty()
    } else { // reset validations
      this.phoneNumberForms[index].phoneNumber.$setValidity()
      this.phoneNumberForms[index].$setPristine()
    }
  }

  invalidPhoneNumbers () {
    let hasInvalid = false
    angular.forEach(this.phoneNumberForms, (form) => {
      if (form && form.$invalid) {
        hasInvalid = true
      }
    })
    return hasInvalid
  }

  dirtyPhoneNumbers () {
    let hasDirty = false
    angular.forEach(this.phoneNumberForms, (form) => {
      if (form && form.$dirty) {
        hasDirty = true
      }
    })
    return hasDirty
  }

  resetPhoneNumberForms () {
    angular.forEach(this.phoneNumberForms, (form) => {
      if (form) form.$setPristine()
    })
  }

  loadMailingAddress () {
    this.mailingAddressLoading = true
    this.profileService.getMailingAddress()
      .subscribe(
        data => {
          this.mailingAddress = data
          this.mailingAddressLoading = false
        },
        error => {
          this.mailingAddressLoading = false
          this.mailingAddressError = 'loading'
          this.$log.error('Failed loading mailing address.', error)
        }
      )
  }

  updateMailingAddress () {
    this.mailingAddressLoading = true
    this.mailingAddress.name = this.donorDetails.name
    this.profileService.updateMailingAddress(this.mailingAddress)
      .subscribe(
        () => {
          this.mailingAddressLoading = false
          this.mailingAddressForm.$setPristine()
          this.success = true
        },
        error => {
          this.mailingAddressLoading = false
          this.mailingAddressError = 'updating'
          this.$log.error('Failed loading mailing address', error)
        }
      )
  }

  saveSpouse () {
    this.donorDetailsLoading = true
    const path = this.donorDetails.self.uri.replace('selfservicedonordetails', 'donordetails') + '/spousedetails'
    this.profileService.addSpouse(path, this.donorDetails['spouse-name'])
      .subscribe(
        () => {
          this.addingSpouse = false
          this.hasSpouse = true
          this.donorDetailsLoading = false
        },
        error => {
          this.donorDetailsError = 'saving spouse'
          this.$log.error('Failed saving spouse info. ', error)
          this.donorDetailsLoading = false
        },
        () => {
          if (this.spouseDetailsForm.title.$dirty || this.spouseDetailsForm.suffix.$dirty) {
            this.updateDonorDetails()
          } else if (this.spouseEmailForm && this.spouseEmailForm.$dirty && this.spouseEmailForm.$valid) {
            this.updateEmail(true)
          }
        }
      )
  }

  invalid () {
    return this.mailingAddressForm.$invalid ||
      this.donorEmailForm.$invalid ||
      this.invalidPhoneNumbers() ||
      this.donorDetailsForm.$invalid ||
      (this.spouseEmailForm ? this.spouseEmailForm.$invalid : false) ||
      (this.addingSpouse ? this.spouseDetailsForm.$invalid : false)
  }

  hasError () {
    return this.donorDetailsError || this.emailAddressError || this.phoneNumberError || this.mailingAddressError
  }

  touched () {
    return this.mailingAddressForm.$dirty ||
      this.donorEmailForm.$dirty ||
      this.dirtyPhoneNumbers() ||
      this.donorDetailsForm.$dirty ||
      (this.addingSpouse || this.hasSpouse ? this.spouseEmailForm && this.spouseEmailForm.$dirty : false) ||
      (this.addingSpouse || this.hasSpouse ? this.spouseDetailsForm && this.spouseDetailsForm.$dirty : false)
  }

  loading () {
    return this.phonesLoading || this.mailingAddressLoading || this.donorDetailsLoading || this.emailLoading
  }

  onSubmit () {
    this.donorDetailsError = ''
    this.emailAddressError = ''
    this.phoneNumberError = ''
    this.mailingAddressError = ''
    this.success = false
    if (this.donorDetailsForm.$dirty && this.donorDetailsForm.$valid || this.spouseDetailsForm.$dirty && this.spouseDetailsForm.$valid && !this.addingSpouse) /* eslint-disable-line no-mixed-operators */ {
      this.updateDonorDetails()
    }
    // if spouse is being created we need to make sure that email is created after spouse details are created
    if (this.spouseEmailForm && this.spouseEmailForm.$dirty && this.spouseEmailForm.$valid && this.addingSpouse) {
      this.emailLoading = true
    }
    if (this.spouseEmailForm && this.spouseEmailForm.$dirty && this.spouseEmailForm.$valid && this.hasSpouse) {
      this.updateEmail(true)
    }
    if (this.spouseDetailsForm && this.spouseDetailsForm.$dirty && this.spouseDetailsForm.$valid && this.addingSpouse) {
      this.saveSpouse()
    }
    if (this.donorEmailForm.$dirty && this.donorEmailForm.$valid) {
      this.updateEmail()
    }
    if (this.dirtyPhoneNumbers() && !this.invalidPhoneNumbers()) {
      this.updatePhoneNumbers()
    }
    if (this.mailingAddressForm.$dirty && this.mailingAddressForm.$valid) {
      this.updateMailingAddress()
    }
    this.$window.scrollTo(0, 0)
  }
}

export default angular
  .module(componentName, [
    'environment',
    profileService.name,
    'ngMessages',
    sessionEnforcerService.name,
    showErrors.name,
    addressForm.name,
    commonModule.name
  ])
  .component(componentName, {
    controller: ProfileController,
    templateUrl: template
  })

import angular from 'angular'
import 'angular-mocks'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'
import clone from 'lodash/clone'
import { SignOutEvent } from 'common/services/session/session.service'
import { titles } from './titles.fixture'
import module from './profile.component'

describe('ProfileComponent', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl

  beforeEach(inject((_$componentController_) => {
    $ctrl = _$componentController_(module.name, {
      $window: { location: '/profile.html' }
    }, {
      donorEmailForm: {
        $setPristine: jest.fn(),
        $dirty: true,
        $invalid: false,
        $valid: true
      },
      spouseEmailForm: {
        $setPristine: jest.fn(),
        $dirty: true,
        $invalid: false,
        $valid: true
      },
      mailingAddressForm: {
        $setPristine: jest.fn(),
        $dirty: true,
        $invalid: false,
        $valid: true
      },
      donorDetailsForm: {
        $setPristine: jest.fn(),
        $dirty: true,
        $invalid: false,
        $valid: true
      },
      spouseDetailsForm: {
        $setPristine: jest.fn(),
        $dirty: true,
        $invalid: false,
        $valid: true,
        title: {
          $dirty: true
        },
        suffix: {
          $dirty: true
        }
      },
      phoneNumberForms: [{
        $setPristine: jest.fn(),
        $setDirty: jest.fn(),
        $dirty: true,
        $invalid: false,
        $valid: true,
        phoneNumber: {
          $setValidity: jest.fn()
        }
      }]
    })
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
    expect($ctrl.$window).toBeDefined()
    expect($ctrl.$log).toBeDefined()
    expect($ctrl.$location).toBeDefined()
    expect($ctrl.$rootScope).toBeDefined()
    expect($ctrl.sessionEnforcerService).toBeDefined()
    expect($ctrl.profileService).toBeDefined()
  })

  describe('$onInit()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'loadDonorDetails').mockImplementation(() => {})
      jest.spyOn($ctrl, 'loadMailingAddress').mockImplementation(() => {})
      jest.spyOn($ctrl, 'loadEmail').mockImplementation(() => {})
      jest.spyOn($ctrl, 'loadPhoneNumbers').mockImplementation(() => {})
      jest.spyOn($ctrl, 'syncPhoneValidators').mockImplementation(() => {})
      jest.spyOn($ctrl, 'sessionEnforcerService').mockImplementation(() => {})
      jest.spyOn($ctrl.$rootScope, '$on').mockImplementation(() => {})
      jest.spyOn($ctrl, 'signedOut').mockImplementation(() => {})
    })

    it('should call syncPhoneValidators', () => {
      $ctrl.$onInit()

      expect($ctrl.syncPhoneValidators).toHaveBeenCalled()
    })

    it('adds listener for sign-out event', () => {
      $ctrl.$onInit()

      expect($ctrl.$rootScope.$on).toHaveBeenCalledWith(SignOutEvent, expect.any(Function))
      $ctrl.$rootScope.$on.mock.calls[0][1]()

      expect($ctrl.signedOut).toHaveBeenCalled()
    })

    describe('sessionEnforcerService success', () => {
      it('executes success callback', () => {
        $ctrl.$onInit()
        $ctrl.sessionEnforcerService.mock.calls[0][1]['sign-in']()

        expect($ctrl.loadDonorDetails).toHaveBeenCalled()
        expect($ctrl.loadMailingAddress).toHaveBeenCalled()
        expect($ctrl.loadEmail).toHaveBeenCalled()
        expect($ctrl.loadPhoneNumbers).toHaveBeenCalled()
      })
    })

    describe('sessionEnforcerService failure', () => {
      it('executes failure callback', () => {
        $ctrl.$onInit()
        $ctrl.sessionEnforcerService.mock.calls[0][1]['cancel']()

        expect($ctrl.$window.location).toEqual('/')
      })
    })
  })

  describe('$onDestroy()', () => {
    it('cleans up the component', () => {
      jest.spyOn($ctrl.sessionEnforcerService, 'cancel').mockImplementation(() => {})

      $ctrl.enforcerId = '1234567890'
      $ctrl.$onDestroy()

      expect($ctrl.sessionEnforcerService.cancel).toHaveBeenCalledWith('1234567890')
    })
  })

  describe('signedOut( event )', () => {
    describe('default prevented', () => {
      it('does nothing', () => {
        $ctrl.signedOut({ defaultPrevented: true })

        expect($ctrl.$window.location).toEqual('/profile.html')
      })
    })

    describe('default not prevented', () => {
      it('navigates to \'\/\'', () => {
        const spy = jest.fn()
        $ctrl.signedOut({ defaultPrevented: false, preventDefault: spy })

        expect(spy).toHaveBeenCalled()
        expect($ctrl.$window.location).toEqual('/')
      })
    })
  })

  describe('loadDonorDetails()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'initTitles').mockImplementation(() => {})
      jest.spyOn($ctrl, 'setPKeys').mockImplementation(() => {})
    })

    it('should load donor details on $onInit() and have a spouse info', () => {
      const data = {
        'spouse-name': {
          'family-name': 'abc'
        }
      }
      jest.spyOn($ctrl.profileService, 'getProfileDonorDetails').mockReturnValue(Observable.of(data))
      $ctrl.loadDonorDetails()

      expect($ctrl.donorDetails).toBe(data)
      expect($ctrl.hasSpouse).toBe(true)
      expect($ctrl.profileService.getProfileDonorDetails).toHaveBeenCalled()
      expect($ctrl.initTitles).toHaveBeenCalled()
      expect($ctrl.setPKeys).toHaveBeenCalled()
    })

    it('should load donor details on $onInit() without spouse info', () => {
      const data = {
        'spouse-name': {
          'family-name': undefined
        }
      }
      jest.spyOn($ctrl.profileService, 'getProfileDonorDetails').mockReturnValue(Observable.of(data))
      $ctrl.loadDonorDetails()

      expect($ctrl.hasSpouse).toBe(false)
      expect($ctrl.initTitles).toHaveBeenCalled()
      expect($ctrl.setPKeys).toHaveBeenCalled()
    })

    it('should handle and error of loading donor details on $onInit()', () => {
      jest.spyOn($ctrl.profileService, 'getProfileDonorDetails').mockReturnValue(Observable.throw({
        data: 'some error'
      }))
      $ctrl.loadDonorDetails()

      expect($ctrl.donorDetailsError).toBe('loading')
      expect($ctrl.profileService.getProfileDonorDetails).toHaveBeenCalled()
      expect($ctrl.initTitles).not.toHaveBeenCalled()
      expect($ctrl.setPKeys).not.toHaveBeenCalled()
    })
  })

  describe('initTitles()', () => {
    let expectedTitles;
    beforeEach(() => {
      $ctrl.donorDetails = {
        name: {},
        'spouse-name': {}
      }
      expectedTitles = angular.copy(titles)
      expectedTitles[''] = ''
    })

    it('should load all the normal titles', () => {
      $ctrl.initTitles()

      expect($ctrl.availableTitles).toEqual(expectedTitles)
    })

    it('should additional leacy titles if they are in use in donorDetails', () => {
      $ctrl.donorDetails.name.title = 'Alderman'
      $ctrl.donorDetails['spouse-name'].title = 'Prof'
      $ctrl.initTitles()
      expectedTitles.Alderman = 'Alderman'
      expectedTitles.Prof = 'Professor'

      expect($ctrl.availableTitles).toEqual(expectedTitles)
    })
  })

  describe('updateDonorDetails()', () => {
    let donorDetails;
    beforeEach(() => {
      donorDetails = {
        name: {
          'family-name': 'Lname',
          'given-name': 'Fname'
        },
        'spouse-name': {
          'family-name': 'SLname',
          'given-name': 'SFname'
        }
      }
    })

    it('should update donor details', () => {
      $ctrl.donorDetails = donorDetails
      jest.spyOn($ctrl.profileService, 'updateProfileDonorDetails').mockReturnValue(Observable.of(''))
      jest.spyOn($ctrl, 'updateEmail').mockImplementation(() => {})
      $ctrl.updateDonorDetails()

      expect($ctrl.profileService.updateProfileDonorDetails).toHaveBeenCalledWith(donorDetails)
      expect($ctrl.donorDetailsForm.$setPristine).toHaveBeenCalled()
      expect($ctrl.updateEmail).toHaveBeenCalled()
    })

    it('should update donor details while adding a spouse', () => {
      $ctrl.donorDetails = donorDetails
      $ctrl.addingSpouse = true
      jest.spyOn($ctrl.profileService, 'updateProfileDonorDetails').mockReturnValue(Observable.of(''))
      jest.spyOn($ctrl, 'updateEmail').mockImplementation(() => {})
      $ctrl.updateDonorDetails()

      expect($ctrl.profileService.updateProfileDonorDetails).toHaveBeenCalledWith({
        name: {
          'family-name': 'Lname',
          'given-name': 'Fname'
        }
      })

      expect($ctrl.donorDetailsForm.$setPristine).toHaveBeenCalled()
      expect($ctrl.updateEmail).toHaveBeenCalled()
    })

    it('should handle and error of updating donor details', () => {
      jest.spyOn($ctrl.profileService, 'updateProfileDonorDetails').mockReturnValue(Observable.throw({
        data: 'some error'
      }))
      $ctrl.updateDonorDetails()

      expect($ctrl.donorDetailsError).toBe('updating')
      expect($ctrl.profileService.updateProfileDonorDetails).toHaveBeenCalled()
    })
  })

  describe('loadMailingAddress()', () => {
    it('should load mailing address on $onInit()', () => {
      const data = {
        address: {
          country: 'US',
          streetAddress: '123 First St',
          extendedAddress: '',
          locality: 'Sacramento',
          region: 'CA'
        }
      }
      jest.spyOn($ctrl.profileService, 'getMailingAddress').mockReturnValue(Observable.of(data))
      $ctrl.loadMailingAddress()

      expect($ctrl.profileService.getMailingAddress).toHaveBeenCalled()
    })

    it('should handle and error of loading mailing address on $onInit()', () => {
      jest.spyOn($ctrl.profileService, 'getMailingAddress').mockReturnValue(Observable.throw({
        data: 'some error'
      }))
      $ctrl.loadMailingAddress()

      expect($ctrl.mailingAddressError).toBe('loading')
      expect($ctrl.profileService.getMailingAddress).toHaveBeenCalled()
    })
  })

  describe('loadEmail()', () => {
    it('should load email on $onInit()', () => {
      const data = [{ email: 'donor@email.com' }, { email: 'spouse@email.com' }]

      jest.spyOn($ctrl.profileService, 'getEmails').mockReturnValue(Observable.of(data))
      $ctrl.loadEmail()

      expect($ctrl.donorEmail).toEqual({ email: 'donor@email.com' })
      expect($ctrl.spouseEmail).toEqual({ email: 'spouse@email.com' })
      expect($ctrl.profileService.getEmails).toHaveBeenCalled()
    })

    it('should load email on $onInit() and handle empty response', () => {
      jest.spyOn($ctrl.profileService, 'getEmails').mockReturnValue(Observable.of(undefined))
      $ctrl.loadEmail()

      expect($ctrl.donorEmail).toEqual({ email: '' })
      expect($ctrl.spouseEmail).toEqual({ email: '' })
      expect($ctrl.profileService.getEmails).toHaveBeenCalled()
    })

    it('should handle and error of loading email on $onInit()', () => {
      jest.spyOn($ctrl.profileService, 'getEmails').mockReturnValue(Observable.throw({
        data: 'some error'
      }))
      $ctrl.loadEmail()

      expect($ctrl.emailAddressError).toBe('loading')
      expect($ctrl.profileService.getEmails).toHaveBeenCalled()
    })
  })

  describe('updateEmail()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'loadDonorDetails').mockImplementation(() => {})
    })

    it('should update donor email', () => {
      jest.spyOn($ctrl.profileService, 'updateEmail').mockReturnValue(Observable.of({ email: 'new email' }))
      $ctrl.updateEmail(false)

      expect($ctrl.donorEmail).toEqual({ email: 'new email' })
      expect($ctrl.profileService.updateEmail).toHaveBeenCalled()
      expect($ctrl.loadDonorDetails).toHaveBeenCalled()
    })

    it('should update spouse email', () => {
      jest.spyOn($ctrl.profileService, 'updateEmail').mockReturnValue(Observable.of({ email: 'new email' }))
      $ctrl.updateEmail(true)

      expect($ctrl.spouseEmail).toEqual({ email: 'new email' })
      expect($ctrl.profileService.updateEmail).toHaveBeenCalled()
      expect($ctrl.loadDonorDetails).toHaveBeenCalled()
    })

    it('should handle and error of updating email', () => {
      jest.spyOn($ctrl.profileService, 'updateEmail').mockReturnValue(Observable.throw({
        data: 'some error'
      }))
      $ctrl.updateEmail()

      expect($ctrl.emailAddressError).toBe('updating')
      expect($ctrl.profileService.updateEmail).toHaveBeenCalled()
      expect($ctrl.loadDonorDetails).not.toHaveBeenCalled()
    })
  })

  describe('setPKeys()', () => {
    const primaryPKey = '123456';
    const spousePKey = '654321';

    it('should set PKey for primary email', () => {
      $ctrl.donorDetails = {
        'acs-profile-pkey': primaryPKey,
        'acs-spouse-profile-pkey': undefined,
      }

      $ctrl.setPKeys()

      expect($ctrl.profilePKey).toEqual(primaryPKey)
      expect($ctrl.spousePKey).toEqual(undefined)
    })

    it('should set PKey for spouse email', () => {
      $ctrl.donorDetails = {
        'acs-profile-pkey': undefined,
        'acs-spouse-profile-pkey': spousePKey,
      }

      $ctrl.setPKeys()

      expect($ctrl.profilePKey).toEqual(undefined)
      expect($ctrl.spousePKey).toEqual(spousePKey)
    })

    it('should set PKey for both primary and spouse emails' , () => {
      $ctrl.donorDetails = {
        'acs-profile-pkey': primaryPKey,
        'acs-spouse-profile-pkey': spousePKey,
      }

      $ctrl.setPKeys()

      expect($ctrl.profilePKey).toEqual(primaryPKey)
      expect($ctrl.spousePKey).toEqual(spousePKey)
    })

    it('should set PKey to undefined for both primary and spouse emails', () => {
      $ctrl.donorDetails = {
        'acs-profile-pkey': undefined,
        'acs-spouse-profile-pkey': undefined,
      }

      $ctrl.setPKeys()

      expect($ctrl.profilePKey).toEqual(undefined)
      expect($ctrl.spousePKey).toEqual(undefined)
    })
  })

  describe('linkToAdobeCampaign()', () => {
    beforeEach(() => {
      jest.spyOn(window, 'open').mockImplementation(() => {})
    })

    it('should open tab if pKey is present', () => {
      $ctrl.linkToAdobeCampaign('123456')

      expect(window.open).toHaveBeenCalledWith('https://cru-mkt-stage1.adobe-campaign.com/lp/LP63?_uuid=f1938f90-38ea-41a6-baad-9ac133f6d2ec&service=%404k83N_C5RZnLNvwz7waA2SwyzIuP6ATcN8vJjmT5km0iZPYKUUYk54sthkZjj-hltAuOKDYocuEi5Pxv8BSICoA4uppcvU_STKCzjv9RzLpE4hqj&pkey=123456')
    })

    it('should not open tab if pKey is undefined', () => {
      $ctrl.linkToAdobeCampaign(undefined)

      expect(window.open).not.toHaveBeenCalled()
    })
  })

  describe('syncPhoneValidators()', () => {
    it('should add phone number validators to inputs', () => {
      $ctrl.phoneNumberForms = {}
      $ctrl.syncPhoneValidators()
      $ctrl.$scope.$apply()

      expect($ctrl.phoneNumberForms).toEqual({})
      $ctrl.phoneNumberForms[0] = {
        phoneNumber: {
          $validators: {}
        }
      }
      $ctrl.$scope.$apply()

      expect($ctrl.phoneNumberForms[0].phoneNumber.$validators.phone('541-967-0010')).toEqual(true)
      expect($ctrl.phoneNumberForms[0].phoneNumber.$validators.phone('123-abc-7890')).toEqual(false)
    })
  })

  describe('loadPhoneNumbers()', () => {
    it('should load phone numbers on $onInit()', () => {
      jest.spyOn($ctrl.profileService, 'getPhoneNumbers').mockReturnValue(Observable.of([{}]))
      $ctrl.loadPhoneNumbers()

      expect($ctrl.phoneNumbers).toEqual([{ ownerChanged: false }])
      expect($ctrl.profileService.getPhoneNumbers).toHaveBeenCalled()
    })

    it('should handle and error of loading phone numbers on $onInit()', () => {
      jest.spyOn($ctrl.profileService, 'getPhoneNumbers').mockReturnValue(Observable.throw({
        data: 'some error'
      }))
      $ctrl.loadPhoneNumbers()

      expect($ctrl.phoneNumberError).toBe('loading')
      expect($ctrl.profileService.getPhoneNumbers).toHaveBeenCalled()
    })

    it('should properly handle cache', () => {
      const onlyPhoneNumber = {
        'phone-number': '555-555-5555',
        'phone-number-type': 'Mobile',
        primary: true,
        'is-spouse': false
      }
      jest.spyOn($ctrl.profileService, 'getPhoneNumbers').mockReturnValue(Observable.of([onlyPhoneNumber]))
      $ctrl.phoneNumbers = [onlyPhoneNumber]
      $ctrl.loadPhoneNumbers()
      expect($ctrl.phoneNumbers.length).toEqual(1)
    })
  })

  describe('addPhoneNumber()', () => {
    it('should add blank phone number to the list', () => {
      $ctrl.phoneNumbers = []
      $ctrl.addPhoneNumber()

      expect($ctrl.phoneNumbers.length).toBe(1)
    })
  })

  describe('updatePhoneNumbers()', () => {
    it('should set phone number for the change of owner', () => {
      $ctrl.phoneNumbers = [
        {
          ownerChanged: true // existing phone number to switch owner
        }
      ]
      $ctrl.updatePhoneNumbers()

      expect($ctrl.phoneNumbers.length).toBe(2)
      expect($ctrl.phoneNumbers[0].delete).toBe(true)
    })

    it('should update phone number', () => {
      $ctrl.phoneNumbers = [
        {
          self: {
            uri: ''
          } // existing phone number to update
        }
      ]
      jest.spyOn($ctrl.profileService, 'updatePhoneNumber').mockReturnValue(Observable.of('data'))
      jest.spyOn($ctrl, 'resetPhoneNumberForms').mockImplementation(() => {})
      $ctrl.updatePhoneNumbers()

      expect($ctrl.profileService.updatePhoneNumber).toHaveBeenCalled()
      expect($ctrl.resetPhoneNumberForms).toHaveBeenCalled()
    })

    it('should fail updating phone number', () => {
      $ctrl.phoneNumbers = [
        {
          self: {
            uri: ''
          } // existing phone number to update
        }
      ]
      jest.spyOn($ctrl.profileService, 'updatePhoneNumber').mockReturnValue(Observable.throw({
        data: 'some error'
      }))
      $ctrl.updatePhoneNumbers()

      expect($ctrl.profileService.updatePhoneNumber).toHaveBeenCalled()
      expect($ctrl.phoneNumberError).toBe('updating')
    })

    it('should delete phone number', () => {
      $ctrl.phoneNumbers = [
        {
          self: {
            uri: ''
          },
          delete: true
        }
      ]
      jest.spyOn($ctrl.profileService, 'deletePhoneNumber').mockReturnValue(Observable.of('data'))
      jest.spyOn($ctrl, 'resetPhoneNumberForms').mockImplementation(() => {})
      $ctrl.updatePhoneNumbers()

      expect($ctrl.profileService.deletePhoneNumber).toHaveBeenCalled()
      expect($ctrl.resetPhoneNumberForms).toHaveBeenCalled()
    })

    it('should fail deleting phone number', () => {
      $ctrl.phoneNumbers = [
        {
          self: {
            uri: ''
          },
          delete: true
        }
      ]
      jest.spyOn($ctrl.profileService, 'deletePhoneNumber').mockReturnValue(Observable.throw({
        data: 'some error'
      }))
      $ctrl.updatePhoneNumbers()

      expect($ctrl.profileService.deletePhoneNumber).toHaveBeenCalled()
      expect($ctrl.phoneNumberError).toBe('updating')
    })

    it('should add phone number', () => {
      let addedNumbers
      $ctrl.phoneNumbers = [
        {
          self: false,
          delete: false
        }
      ]
      jest.spyOn($ctrl.profileService, 'addPhoneNumber').mockImplementation(phoneNumbers => {
        addedNumbers = clone(phoneNumbers)
        return Observable.of({
          self: '<new link>',
          'phone-number': '444'
        })
      })
      jest.spyOn($ctrl, 'resetPhoneNumberForms').mockImplementation(() => {})
      $ctrl.updatePhoneNumbers()

      expect($ctrl.profileService.addPhoneNumber).toHaveBeenCalled()
      expect(addedNumbers).toEqual({
        self: false,
        delete: false
      })

      expect($ctrl.resetPhoneNumberForms).toHaveBeenCalled()
      expect($ctrl.phoneNumbers).toEqual([
        {
          self: '<new link>',
          'phone-number': '444',
          delete: false
        }
      ])
    })

    it('should fail adding phone number', () => {
      $ctrl.phoneNumbers = [
        {
          self: false,
          delete: false
        }
      ]
      jest.spyOn($ctrl.profileService, 'addPhoneNumber').mockReturnValue(Observable.throw({
        data: 'some error'
      }))
      $ctrl.updatePhoneNumbers()

      expect($ctrl.profileService.addPhoneNumber).toHaveBeenCalled()
      expect($ctrl.phoneNumberError).toBe('updating')
    })

    it('should handle duplicate phone number error', () => {
      $ctrl.phoneNumbers = [
        {
          self: false,
          delete: false
        }
      ]
      jest.spyOn($ctrl.profileService, 'addPhoneNumber').mockReturnValue(Observable.throw({
        data: 'Failed to create phone number because it already exists.'
      }))
      $ctrl.updatePhoneNumbers()

      expect($ctrl.profileService.addPhoneNumber).toHaveBeenCalled()
      expect($ctrl.phoneNumberError).toBe('duplicate')
    })
  })

  describe('deletePhoneNumber()', () => {
    it('should delete phone number from a local list', () => {
      const phone = {
        delete: false
      }
      $ctrl.deletePhoneNumber(phone, 0)

      expect($ctrl.phoneNumberForms[0].phoneNumber.$setValidity).toHaveBeenCalled()
      expect($ctrl.phoneNumberForms[0].$setPristine).toHaveBeenCalled()

      phone.self = {}
      $ctrl.deletePhoneNumber(phone, 0)

      expect($ctrl.phoneNumberForms[0].$setDirty).toHaveBeenCalled()
    })
  })

  describe('invalidPhoneNumbers()', () => {
    it('should return true if at least one phone number form is invalid', () => {
      expect($ctrl.invalidPhoneNumbers()).toBe(false)
      $ctrl.phoneNumberForms[0].$invalid = true

      expect($ctrl.invalidPhoneNumbers()).toBe(true)
    })
  })

  describe('dirtyPhoneNumbers()', () => {
    it('should return true if at least one phone number is $dirty', () => {
      expect($ctrl.dirtyPhoneNumbers()).toBe(true)
      $ctrl.phoneNumberForms[0].$dirty = false

      expect($ctrl.dirtyPhoneNumbers()).toBe(false)
    })
  })

  describe('resetPhoneNumberForms()', () => {
    it('should reset phone number forms after update', () => {
      $ctrl.resetPhoneNumberForms()

      expect($ctrl.phoneNumberForms[0].$setPristine).toHaveBeenCalled()
    })
  })

  describe('updateMailingAddress()', () => {
    beforeEach(() => {
      $ctrl.donorDetails = {
        name: {}
      }
      $ctrl.mailingAddress = {
        name: {}
      }
    })

    it('should update mailing address', () => {
      jest.spyOn($ctrl.profileService, 'updateMailingAddress').mockReturnValue(Observable.of('data'))
      $ctrl.updateMailingAddress()

      expect($ctrl.mailingAddressForm.$setPristine).toHaveBeenCalled()
    })

    it('should fail updating mailing address', () => {
      jest.spyOn($ctrl.profileService, 'updateMailingAddress').mockReturnValue(Observable.throw({
        data: 'some error'
      }))
      $ctrl.updateMailingAddress()

      expect($ctrl.mailingAddressError).toBe('updating')
    })
  })

  describe('saveSpouse()', () => {
    beforeEach(() => {
      $ctrl.donorDetails = {
        self: {
          uri: '/selfservicedonordetails/crugive'
        },
        'spouse-name': {
          'given-name': 'Sarah'
        }
      }
    })

    it('should save spouse info', () => {
      jest.spyOn($ctrl, 'updateDonorDetails').mockImplementation(() => {})
      jest.spyOn($ctrl.profileService, 'addSpouse').mockReturnValue(Observable.of('data'))
      $ctrl.saveSpouse()

      expect($ctrl.profileService.addSpouse).toHaveBeenCalledWith('/donordetails/crugive/spousedetails', $ctrl.donorDetails['spouse-name'])
      expect($ctrl.updateDonorDetails).toHaveBeenCalled()

      $ctrl.spouseDetailsForm.title.$dirty = false
      $ctrl.saveSpouse()

      expect($ctrl.updateDonorDetails).toHaveBeenCalled()
    })

    it('should handle fail of saving spouse info', () => {
      jest.spyOn($ctrl.profileService, 'addSpouse').mockReturnValue(Observable.throw({
        data: 'some error'
      }))
      $ctrl.saveSpouse()

      expect($ctrl.donorDetailsError).toBe('saving spouse')
    })
  })

  describe('hasError()', () => {
    it('should return true if there has been an error after hitting end points', () => {
      $ctrl.donorDetailsError = false
      $ctrl.emailAddressError = false
      $ctrl.mailingAddressError = false
      $ctrl.phoneNumberError = false

      expect($ctrl.hasError()).toBe(false)

      $ctrl.phoneNumberError = true

      expect($ctrl.hasError()).toBe(true)
    })
  })

  describe('invalid()', () => {
    it('should return true if form data is invalid', () => {
      expect($ctrl.touched()).toBe(true)
      $ctrl.donorEmailForm.$invalid = false
      $ctrl.spouseEmailForm.$invalid = false
      $ctrl.donorDetailsForm.$invalid = false
      $ctrl.spouseDetailsForm.$invalid = false
      $ctrl.mailingAddressForm.$invalid = false
      $ctrl.phoneNumberForms[0].$invalid = false
      $ctrl.addingSpouse = true

      expect($ctrl.invalid()).toBe(false)

      $ctrl.mailingAddressForm.$invalid = true

      expect($ctrl.invalid()).toBe(true)

      $ctrl.spouseEmailForm = false
      $ctrl.addingSpouse = false
      $ctrl.mailingAddressForm.$invalid = false

      expect($ctrl.invalid()).toBe(false)
    })
  })

  describe('touched()', () => {
    it('should return true if form data has changed', () => {
      expect($ctrl.touched()).toBe(true)
      $ctrl.donorEmailForm.$dirty = false
      $ctrl.spouseEmailForm.$dirty = false
      $ctrl.donorDetailsForm.$dirty = false
      $ctrl.spouseDetailsForm.$dirty = false
      $ctrl.mailingAddressForm.$dirty = false
      $ctrl.phoneNumberForms[0].$dirty = false
      $ctrl.addingSpouse = true
      $ctrl.hasSpouse = true

      expect($ctrl.touched()).toBe(false)

      $ctrl.addingSpouse = false
      $ctrl.hasSpouse = false

      expect($ctrl.touched()).toBe(false)
    })
  })

  describe('loading()', () => {
    it('should return true if any of the forms is loading', () => {
      $ctrl.donorDetailsLoading = false
      $ctrl.emailLoading = false
      $ctrl.mailingAddressLoading = false
      $ctrl.phonesLoading = false

      expect($ctrl.loading()).toBe(false)

      $ctrl.mailingAddressLoading = true

      expect($ctrl.loading()).toBe(true)
    })
  })

  describe('onSubmit()', () => {
    it('should submit if forms are ready', () => {
      jest.spyOn($ctrl, 'updateDonorDetails').mockImplementation(() => {})
      jest.spyOn($ctrl, 'updateEmail').mockImplementation(() => {})
      jest.spyOn($ctrl, 'saveSpouse').mockImplementation(() => {})
      jest.spyOn($ctrl, 'updatePhoneNumbers').mockImplementation(() => {})
      jest.spyOn($ctrl, 'updateMailingAddress').mockImplementation(() => {})
      $ctrl.$window.scrollTo = jest.fn()
      $ctrl.donorEmailForm.$dirty = true
      $ctrl.spouseEmailForm.$dirty = true
      $ctrl.donorDetailsForm.$dirty = true
      $ctrl.spouseDetailsForm.$dirty = true
      $ctrl.mailingAddressForm.$dirty = true
      $ctrl.phoneNumberForms[0].$dirty = true
      $ctrl.addingSpouse = undefined
      $ctrl.spouseDetailsForm.$valid = true
      $ctrl.onSubmit()

      expect($ctrl.updateDonorDetails).toHaveBeenCalled()
      expect($ctrl.updateEmail).toHaveBeenCalled()
      expect($ctrl.updatePhoneNumbers).toHaveBeenCalled()
      expect($ctrl.updateMailingAddress).toHaveBeenCalled()
      expect($ctrl.$window.scrollTo).toHaveBeenCalled()

      // $ctrl.donorDetailsForm.$dirty = false;
      $ctrl.addingSpouse = true
      $ctrl.hasSpouse = true
      $ctrl.onSubmit()

      expect($ctrl.updateEmail).toHaveBeenCalledWith(true)
      expect($ctrl.saveSpouse).toHaveBeenCalled()
    })
  })
})

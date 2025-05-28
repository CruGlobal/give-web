import angular from 'angular'
import 'angular-mocks'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import cloneDeep from 'lodash/cloneDeep'
import { Sessions, SignInEvent } from 'common/services/session/session.service'
import { cortexRole } from 'common/services/session/fixtures/cortex-role'
import { cruProfile } from 'common/services/session/fixtures/cru-profile'

import module from './contactInfo.component.js'

describe('contactInfo', function () {
  beforeEach(angular.mock.module(module.name))
  var self = {}

  beforeEach(inject(function ($componentController) {
    self.controller = $componentController(module.name, {}, {
      detailsForm: {
        $valid: false,
        $setSubmitted: jest.fn()
      },
      onSubmit: jest.fn()
    })
  }))

  describe('$onInit', () => {
    it('should load the necessary data', () => {
      jest.spyOn(self.controller, 'loadDonorDetails').mockImplementation(() => {})
      jest.spyOn(self.controller, 'waitForFormInitialization').mockImplementation(() => {})
      self.controller.$onInit()

      expect(self.controller.loadDonorDetails).toHaveBeenCalled()
      expect(self.controller.waitForFormInitialization).toHaveBeenCalled()
    })

    it('should call loadDonorDetails on sign in', () => {
      jest.spyOn(self.controller, 'loadDonorDetails').mockImplementation(() => {})
      self.controller.$onInit()

      expect(self.controller.loadDonorDetails).toHaveBeenCalled()
      self.controller.loadDonorDetails.mockClear()
      self.controller.$scope.$broadcast(SignInEvent)

      expect(self.controller.loadDonorDetails).toHaveBeenCalled()
    })
  })

  describe('$onChanges', () => {
    it('should call submitDetails when submitted changes true', () => {
      jest.spyOn(self.controller, 'submitDetails').mockImplementation(() => {})
      self.controller.$onChanges({
        submitted: {
          currentValue: true
        }
      })

      expect(self.controller.submitDetails).toHaveBeenCalled()
    })
  })

  describe('waitForFormInitialization()', () => {
    it('should wait for the form to become available and then call addCustomValidators()', (done) => {
      jest.spyOn(self.controller, 'addCustomValidators').mockImplementation(() => {})
      delete self.controller.detailsForm
      self.controller.waitForFormInitialization()
      self.controller.$scope.$digest()

      expect(self.controller.addCustomValidators).not.toHaveBeenCalled()
      self.controller.detailsForm = {
        phoneNumber: {}
      }
      self.controller.$scope.$digest()

      expect(self.controller.addCustomValidators).toHaveBeenCalled()
      done()
    })
  })

  describe('addCustomValidators()', () => {
    it('should create validators', () => {
      self.controller.detailsForm.phoneNumber = {
        $validators: {}
      }
      self.controller.addCustomValidators()

      expect(self.controller.detailsForm.phoneNumber.$validators.phone('541-967-0010')).toEqual(true)
      expect(self.controller.detailsForm.phoneNumber.$validators.phone('')).toEqual(true)
      expect(self.controller.detailsForm.phoneNumber.$validators.phone('123-abc-7890')).toEqual(false)
    })
  })

  describe('loadDonorDetails', () => {
    beforeEach(() => {
      jest.spyOn(self.controller, 'loadRadioStations').mockImplementation(() => {})
    })

    it('should get the donor\'s details', () => {
      jest.spyOn(self.controller.orderService, 'getDonorDetails').mockImplementation(() => Observable.of({ 'donor-type': 'Organization', 'spouse-name': {}, staff: false }))
      self.controller.loadDonorDetails()

      expect(self.controller.orderService.getDonorDetails).toHaveBeenCalled()
      expect(self.controller.loadingDonorDetailsError).toEqual(false)
      expect(self.controller.loadingDonorDetails).toEqual(false)
      expect(self.controller.donorDetails).toEqual({ 'donor-type': 'Organization', 'spouse-name': {}, staff: false })
      expect(self.controller.nameFieldsDisabled).toEqual(false)
      expect(self.controller.spouseFieldsDisabled).toEqual(false)
    })

    it('should disable name fields if the user\'s registration state is completed', () => {
      jest.spyOn(self.controller.orderService, 'spouseEditableForOrder').mockReturnValue(false)
      const donorDetails = {
        'donor-type': 'Organization',
        name: {
          'given-name': 'Joe',
          'family-name': 'Smith'
        },
        'spouse-name': {
          'given-name': 'Julie',
          'family-name': 'Smith'
        },
        email: 'joe.smith@example.com',
        'registration-state': 'COMPLETED'
      }
      jest.spyOn(self.controller.orderService, 'getDonorDetails').mockImplementation(() => Observable.of(donorDetails))
      self.controller.loadDonorDetails()

      expect(self.controller.loadingDonorDetailsError).toEqual(false)
      expect(self.controller.loadingDonorDetails).toEqual(false)
      expect(self.controller.orderService.getDonorDetails).toHaveBeenCalled()
      expect(self.controller.donorDetails).toEqual(donorDetails)
      expect(self.controller.nameFieldsDisabled).toEqual(true)
      expect(self.controller.spouseFieldsDisabled).toEqual(true)
      expect(self.controller.orderService.spouseEditableForOrder).toHaveBeenCalledWith(donorDetails)
      expect(self.controller.loadRadioStations).toHaveBeenCalled()
    })

    it('should set the donor type if it is an empty string', () => {
      jest.spyOn(self.controller.orderService, 'getDonorDetails').mockImplementation(() => Observable.of({ 'donor-type': '', 'spouse-name': {} }))
      self.controller.loadDonorDetails()

      expect(self.controller.orderService.getDonorDetails).toHaveBeenCalled()
      expect(self.controller.donorDetails).toEqual({ 'donor-type': 'Household', 'spouse-name': {} })
    })

    describe('pre-populate from session', () => {
      let $cookies
      beforeEach(inject((_$cookies_, $rootScope) => {
        $cookies = _$cookies_
        $cookies.put(Sessions.role, cortexRole.registered)
        $cookies.put(Sessions.profile, cruProfile)
        $rootScope.$digest()
      }))

      afterEach(() => {
        $cookies.remove(Sessions.role)
        $cookies.remove(Sessions.profile)
      })

      it('should set given, family and name to session values', () => {
        jest.spyOn(self.controller.orderService, 'getDonorDetails').mockImplementation(() => Observable.of({
          'donor-type': 'Household',
          name: {
            'given-name': '',
            'family-name': ''
          },
          'spouse-name': {},
          email: undefined,
          'registration-state': 'NEW'
        }))
        self.controller.loadDonorDetails()

        expect(self.controller.orderService.getDonorDetails).toHaveBeenCalled()
        expect(self.controller.donorDetails).toEqual({
          'donor-type': 'Household',
          name: {
            'given-name': 'Charles',
            'family-name': 'Xavier'
          },
          'spouse-name': {},
          email: 'professorx@xavier.edu',
          'registration-state': 'NEW'
        })
      })
    })

    it('should override details if passed in', () => {
      jest.spyOn(self.controller.orderService, 'getDonorDetails').mockImplementation(() => Observable.of({ 'spouse-name': {} }))
      self.controller.loadDonorDetails({ email: 'steve@cru.org' })

      expect(self.controller.orderService.getDonorDetails).toHaveBeenCalled()
      expect(self.controller.donorDetails.email).toEqual('steve@cru.org')
    })

    it('should log an error on failure', () => {
      jest.spyOn(self.controller.orderService, 'getDonorDetails').mockReturnValue(Observable.throw('some error'))
      self.controller.loadDonorDetails()

      expect(self.controller.loadingDonorDetailsError).toEqual(true)
      expect(self.controller.loadingDonorDetails).toEqual(false)
      expect(self.controller.$log.error.logs[0]).toEqual(['Error loading donorDetails.', 'some error'])
    })

    describe('pre-populate with overrideDonorDetails', () => {
      const overrideDonorDetails = {
        name: {
          title: 'Mr',
          'given-name': 'Test First Name',
          'middle-initial': 'initial',
          'family-name': 'Test Last Name',
          suffix: ''
        },
        mailingAddress: {
          country: 'US',
          streetAddress: '1111 Street Name',
          extendedAddress: 'Apartment 2',
          locality: 'City',
          region: 'Georgia',
          postalCode: '12345',
        },
        email: 'test@cru.org'
      }
      const initDonorDetails = {
        'donor-type': 'Organization',
        name: {
          title: '',
          'given-name': 'Joe',
          'middle-initial': '',
          'family-name': 'Smith',
          suffix: ''
        },
        'spouse-name': {
          'given-name': 'Julie',
          'family-name': 'Smith'
        },
        mailingAddress: {
          country: 'US',
        },
        email: 'joe.smith@example.com',
        'registration-state': 'COMPLETED'
      }

      beforeEach(() => {
        jest.spyOn(self.controller.orderService, 'getDonorDetails').mockImplementation(() => Observable.of(cloneDeep(initDonorDetails)))
        jest.spyOn(self.controller, 'waitForFormInitialization').mockImplementation(() => {})
      })

      it('should overwrite donorDetails with overrideDonorDetails on intital load', () => {
        self.controller.$window.sessionStorage.removeItem('initialLoadComplete')
        self.controller.donorDetails = overrideDonorDetails
        self.controller.$onInit()

        expect(self.controller.donorDetails.name['title']).toEqual('Mr')
        expect(self.controller.donorDetails.name['given-name']).toEqual('Test First Name')
        expect(self.controller.donorDetails.name['middle-initial']).toEqual('initial')
        expect(self.controller.donorDetails.name['family-name']).toEqual('Test Last Name')
        expect(self.controller.donorDetails.name.suffix).toEqual('')

        expect(self.controller.donorDetails.email).toEqual('test@cru.org')

        expect(self.controller.donorDetails['donor-type']).toEqual('Organization')
        expect(self.controller.donorDetails['spouse-name']['given-name']).toEqual('Julie')
        expect(self.controller.donorDetails['spouse-name']['family-name']).toEqual('Smith')

        expect(self.controller.donorDetails.mailingAddress.country).toEqual('US')
        expect(self.controller.donorDetails.mailingAddress.streetAddress).toEqual('1111 Street Name')
        expect(self.controller.donorDetails.mailingAddress.extendedAddress).toEqual('Apartment 2')
        expect(self.controller.donorDetails.mailingAddress.locality).toEqual('City')
        expect(self.controller.donorDetails.mailingAddress.region).toEqual('Georgia')
        expect(self.controller.donorDetails.mailingAddress.postalCode).toEqual('12345')

        expect(self.controller.$window.sessionStorage.getItem('initialLoadComplete')).toEqual('true')
      })

      it('should not use overrideDonorDetails if initialLoadComplete is set', () => {
        self.controller.$window.sessionStorage.setItem('initialLoadComplete', 'true')
        self.controller.donorDetails = overrideDonorDetails
        self.controller.$onInit()

        expect(self.controller.donorDetails.name['title']).toEqual('')
        expect(self.controller.donorDetails.name['given-name']).toEqual('Joe')
        expect(self.controller.donorDetails.name['middle-initial']).toEqual('')
        expect(self.controller.donorDetails.name['family-name']).toEqual('Smith')
        expect(self.controller.donorDetails.name.suffix).toEqual('')

        expect(self.controller.donorDetails.email).toEqual('joe.smith@example.com')
        expect(self.controller.donorDetails['donor-type']).toEqual('Organization')

        expect(self.controller.donorDetails['spouse-name']['given-name']).toEqual('Julie')
        expect(self.controller.donorDetails['spouse-name']['family-name']).toEqual('Smith')

        expect(self.controller.donorDetails.mailingAddress.country).toEqual('US')
        expect(self.controller.donorDetails.mailingAddress.streetAddress).toBeUndefined()
        expect(self.controller.donorDetails.mailingAddress.extendedAddress).toBeUndefined()
        expect(self.controller.donorDetails.mailingAddress.locality).toBeUndefined()
        expect(self.controller.donorDetails.mailingAddress.region).toBeUndefined()
        expect(self.controller.donorDetails.mailingAddress.postalCode).toBeUndefined()
      })

      it('should use donorDetails if overrideDonorDetails are not defined', () => {
        self.controller.donorDetails = {
          mailingAddress: {
            country: 'US'
          }
        }
        self.controller.loadDonorDetails()

        expect(self.controller.donorDetails.name['title']).toEqual('')
        expect(self.controller.donorDetails.name['given-name']).toEqual('Joe')
        expect(self.controller.donorDetails.name['middle-initial']).toEqual('')
        expect(self.controller.donorDetails.name['family-name']).toEqual('Smith')
        expect(self.controller.donorDetails.name.suffix).toEqual('')

        expect(self.controller.donorDetails.email).toEqual('joe.smith@example.com')
        expect(self.controller.donorDetails['donor-type']).toEqual('Organization')

        expect(self.controller.donorDetails['spouse-name']['given-name']).toEqual('Julie')
        expect(self.controller.donorDetails['spouse-name']['family-name']).toEqual('Smith')

        expect(self.controller.donorDetails.mailingAddress.country).toEqual('US')
        expect(self.controller.donorDetails.mailingAddress.streetAddress).toBeUndefined()
      })
    })
  })

  describe('loadRadioStations', () => {
    const postalCode = '33333';
    const radioStationApiUrl = 'https://api.domain.com/getStations'
    const radioStations = { WXYZ: 'Radio Station' }

    beforeEach(() => {
      self.controller.radioStationApiUrl = radioStationApiUrl
      self.controller.requestRadioStation = true
    })

    it('should not load if not requesting radio station', () => {
      self.controller.radioStationApiUrl = undefined
      self.controller.requestRadioStation = false
      self.controller.donorDetails = { mailingAddress: { postalCode } }

      jest.spyOn(self.controller.radioStationsService, 'getRadioStations').mockImplementation(() => Observable.of([]))
      self.controller.loadRadioStations()

      expect(self.controller.radioStationsService.getRadioStations).not.toHaveBeenCalled()
      expect(self.controller.radioStations).toBeUndefined()
    })

    it('should not load if no postal code selected', () => {
      self.controller.donorDetails = { mailingAddress: { } }

      jest.spyOn(self.controller.radioStationsService, 'getRadioStations').mockImplementation(() => Observable.of([]))
      self.controller.loadRadioStations()

      expect(self.controller.radioStationsService.getRadioStations).not.toHaveBeenCalled()
      expect(self.controller.radioStations).toBeUndefined()
    })

    it('should load if requesting radio station and postal code selected', () => {
      self.controller.donorDetails = { mailingAddress: { postalCode } }

      jest.spyOn(self.controller.radioStationsService, 'getRadioStations').mockImplementation(() => Observable.of(radioStations))
      self.controller.loadRadioStations()

      expect(self.controller.radioStationsService.getRadioStations).toHaveBeenCalledWith(radioStationApiUrl, postalCode)
      expect(self.controller.radioStations).toEqual(radioStations)
    })

    it('should log error on failure', () => {
      self.controller.donorDetails = { mailingAddress: { postalCode } }

      jest.spyOn(self.controller.radioStationsService, 'getRadioStations').mockImplementation(() => Observable.throw('some error'))
      self.controller.loadRadioStations()

      expect(self.controller.radioStationsService.getRadioStations).toHaveBeenCalledWith(radioStationApiUrl, postalCode)
      expect(self.controller.radioStations).toBeUndefined()
      expect(self.controller.$log.error.logs[0]).toEqual(['Error loading radio stations.', 'some error'])
    })

    it('should prepopulate the radio station name previously selected', () => {
      self.controller.donorDetails = { mailingAddress: { postalCode } }

      jest.spyOn(self.controller.radioStationsService, 'getRadioStations').mockImplementation(() => Observable.of(radioStations))
      jest.spyOn(self.controller.orderService, 'retrieveRadioStationName').mockReturnValue('Radio Station')
      self.controller.loadRadioStations()

      expect(self.controller.radioStationName).toEqual('Radio Station')
    })
  })

  describe('onSelectRadioStation', () => {
    const radioStations = { WXYZ: 'Radio Station', ZYXW: 'Another Station' }

    it('should find selected radio station in list', () => {
      self.controller.radioStations = radioStations
      self.controller.radioStationName = Object.values(radioStations)[0]

      self.controller.onSelectRadioStation()

      expect(self.controller.radioStationData).toEqual({ WXYZ: 'Radio Station' })
    })
  })

  describe('submitDetails', () => {
    const radioStationData = { WXYZ: 'Radio Station' }

    it('should call onSubmit binding if there are errors', () => {
      self.controller.detailsForm.$valid = false
      jest.spyOn(self.controller.orderService, 'updateDonorDetails').mockImplementation(() => {})
      jest.spyOn(self.controller.orderService, 'addEmail').mockImplementation(() => {})
      jest.spyOn(self.controller.orderService, 'storeRadioStationData').mockImplementation(() => {})
      self.controller.submitDetails()

      expect(self.controller.detailsForm.$setSubmitted).toHaveBeenCalled()
      expect(self.controller.orderService.updateDonorDetails).not.toHaveBeenCalled()
      expect(self.controller.orderService.addEmail).not.toHaveBeenCalled()
      expect(self.controller.orderService.storeRadioStationData).not.toHaveBeenCalled()
      expect(self.controller.onSubmit).toHaveBeenCalledWith({ success: false })
    })

    it('should save donor details and email', () => {
      self.controller.detailsForm.$valid = true
      self.controller.donorDetails = {
        'given-name': 'Fname',
        email: 'someone@asdf.com',
        emailFormUri: '/emails/crugive',
        'donor-type': 'Staff'
      }

      jest.spyOn(self.controller.orderService, 'updateDonorDetails').mockReturnValue(Observable.of('donor details success'))
      jest.spyOn(self.controller.orderService, 'addEmail').mockReturnValue(Observable.of('email success'))
      jest.spyOn(self.controller.analyticsFactory, 'checkoutStepOptionEvent').mockImplementation(() => {})
      jest.spyOn(self.controller.orderService, 'storeRadioStationData').mockImplementation(() => {})
      self.controller.submitDetails()

      expect(self.controller.detailsForm.$setSubmitted).toHaveBeenCalled()
      expect(self.controller.orderService.updateDonorDetails).toHaveBeenCalledWith({
        'given-name': 'Fname',
        email: 'someone@asdf.com',
        emailFormUri: '/emails/crugive',
        'donor-type': 'Staff'
      })
      expect(self.controller.orderService.addEmail).toHaveBeenCalledWith('someone@asdf.com', '/emails/crugive')
      expect(self.controller.onSubmit).toHaveBeenCalledWith({ success: true })
      expect(self.controller.analyticsFactory.checkoutStepOptionEvent).toHaveBeenCalledWith( self.controller.donorDetails['donor-type'], 'contact')
    })

    it('should save radio station', () => {
      self.controller.detailsForm.$valid = true
      self.controller.donorDetails = {
        'given-name': 'Fname',
        'donor-type': 'Staff'
      }
      self.controller.radioStationData = radioStationData

      jest.spyOn(self.controller.orderService, 'updateDonorDetails').mockReturnValue(Observable.of('donor details success'))
      jest.spyOn(self.controller.analyticsFactory, 'checkoutStepOptionEvent').mockImplementation(() => {})
      jest.spyOn(self.controller.orderService, 'storeRadioStationData').mockImplementation(() => {})
      self.controller.submitDetails()

      expect(self.controller.orderService.storeRadioStationData).toHaveBeenCalledWith(radioStationData)
    })

    it('should handle an error saving donor details', () => {
      self.controller.detailsForm.$valid = true
      self.controller.donorDetails = {
        'given-name': 'Fname'
      }
      jest.spyOn(self.controller.orderService, 'updateDonorDetails').mockReturnValue(Observable.throw({ data: 'donor details error' }))
      self.controller.submitDetails()

      expect(self.controller.detailsForm.$setSubmitted).toHaveBeenCalled()
      expect(self.controller.orderService.updateDonorDetails).toHaveBeenCalledWith({
        'given-name': 'Fname'
      })

      expect(self.controller.$log.warn.logs[0]).toEqual(['Error saving donor contact info', { data: 'donor details error' }])
      expect(self.controller.submissionError).toEqual('donor details error')
      expect(self.controller.onSubmit).toHaveBeenCalledWith({ success: false })
    })

    it('should handle an error saving email', () => {
      self.controller.detailsForm.$valid = true
      self.controller.donorDetails = {
        'given-name': 'Fname',
        email: 'a@a',
        emailFormUri: '/emails/crugive'
      }
      jest.spyOn(self.controller.orderService, 'updateDonorDetails').mockReturnValue(Observable.of('success'))
      jest.spyOn(self.controller.orderService, 'addEmail').mockReturnValue(Observable.throw({ data: 'Invalid email address: a@a' }))
      self.controller.submitDetails()

      expect(self.controller.detailsForm.$setSubmitted).toHaveBeenCalled()
      expect(self.controller.orderService.updateDonorDetails).toHaveBeenCalledWith({
        'given-name': 'Fname',
        email: 'a@a',
        emailFormUri: '/emails/crugive'
      })

      expect(self.controller.orderService.addEmail).toHaveBeenCalledWith('a@a', '/emails/crugive')
      expect(self.controller.$log.warn.logs[0]).toEqual(['Error saving donor contact info', { data: 'Invalid email address: a@a' }])
      expect(self.controller.submissionError).toEqual('Invalid email address')
      expect(self.controller.onSubmit).toHaveBeenCalledWith({ success: false })
    })

    it('should clear out spouse name', () => {
      self.controller.detailsForm.$valid = true
      self.controller.showSpouseDetails = true
      self.controller.donorDetails = {
        'given-name': 'Fname',
        email: 'someone@asdf.com',
        emailFormUri: '/emails/crugive',
        'donor-type': 'Staff',
        'spouse-name': {
          'given-name': 'Spouse',
          'family-name': 'Name'
        }
      }

      jest.spyOn(self.controller.orderService, 'updateDonorDetails').mockReturnValue(Observable.of('donor details success'))
      jest.spyOn(self.controller.orderService, 'addEmail').mockReturnValue(Observable.of('email success'))
      jest.spyOn(self.controller.analyticsFactory, 'checkoutStepOptionEvent').mockImplementation(() => {})

      self.controller.toggleSpouseDetails()
      self.controller.submitDetails()

      expect(self.controller.orderService.updateDonorDetails).toHaveBeenCalledWith({
        'given-name': 'Fname',
        email: 'someone@asdf.com',
        emailFormUri: '/emails/crugive',
        'donor-type': 'Staff',
        'spouse-name': {
          'given-name': null,
          'family-name': null
        }
      })
    })
  })
})

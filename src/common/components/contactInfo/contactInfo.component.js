import angular from 'angular';
import 'angular-messages';
import assign from 'lodash/assign';
import pick from 'lodash/pick';
import includes from 'lodash/includes';
import startsWith from 'lodash/startsWith';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import { phoneNumberRegex } from 'common/app.constants';

import addressForm from 'common/components/addressForm/addressForm.component';
import emailField from './emailField/emailField.component';

import orderService from 'common/services/api/order.service';
import radioStationsService from 'common/services/api/radioStations.service';
import sessionService, {
  SignInEvent,
  Roles,
} from 'common/services/session/session.service';

import analyticsFactory from 'app/analytics/analytics.factory';

import template from './contactInfo.tpl.html';
import uibTooltip from 'angular-ui-bootstrap/src/tooltip';

const componentName = 'contactInfo';

class Step1Controller {
  /* @ngInject */
  constructor(
    $log,
    $scope,
    $window,
    orderService,
    radioStationsService,
    sessionService,
    analyticsFactory,
  ) {
    this.$log = $log;
    this.$scope = $scope;
    this.$window = $window;
    this.orderService = orderService;
    this.radioStationsService = radioStationsService;
    this.sessionService = sessionService;
    this.analyticsFactory = analyticsFactory;
    this.showSpouseDetails = false;
  }

  $onInit() {
    const donorDetailsDefaults = angular.copy(this.donorDetails);

    // init address to populate 'US state' dropdown
    this.donorDetails = {
      mailingAddress: {
        country: 'US',
      },
    };

    this.requestRadioStation = !!this.radioStationApiUrl;

    this.loadDonorDetails(donorDetailsDefaults);
    this.waitForFormInitialization();

    this.$scope.$on(SignInEvent, () => {
      this.loadDonorDetails();
    });
  }

  $onChanges(changes) {
    if (changes.submitted.currentValue === true) {
      this.submitDetails();
    }
  }

  waitForFormInitialization() {
    const unregister = this.$scope.$watch('$ctrl.detailsForm', () => {
      if (this.detailsForm) {
        unregister();
        this.addCustomValidators();
      }
    });
  }

  addCustomValidators() {
    this.detailsForm.phoneNumber.$validators.phone = (number) => {
      return !number || phoneNumberRegex.test(number);
    };
  }

  loadDonorDetails(overrideDonorDetails) {
    this.loadingDonorDetailsError = false;
    this.loadingDonorDetails = true;
    this.orderService.getDonorDetails().subscribe(
      (data) => {
        if (data['donor-type'] === '') {
          data['donor-type'] = 'Household';
        }
        this.loadingDonorDetails = false;
        this.donorDetails = data;
        this.nameFieldsDisabled =
          this.donorDetails['registration-state'] === 'COMPLETED';
        this.spouseFieldsDisabled = !this.orderService.spouseEditableForOrder(
          this.donorDetails,
        );
        if (
          !this.nameFieldsDisabled &&
          includes(
            [Roles.registered, Roles.identified],
            this.sessionService.getRole(),
          )
        ) {
          // Pre-populate first, last and email from session if missing from donorDetails
          if (
            !this.donorDetails.name['given-name'] &&
            angular.isDefined(this.sessionService.session.first_name)
          ) {
            this.donorDetails.name['given-name'] =
              this.sessionService.session.first_name;
          }
          if (
            !this.donorDetails.name['family-name'] &&
            angular.isDefined(this.sessionService.session.last_name)
          ) {
            this.donorDetails.name['family-name'] =
              this.sessionService.session.last_name;
          }
          if (
            angular.isUndefined(this.donorDetails.email) &&
            angular.isDefined(this.sessionService.session.email)
          ) {
            this.donorDetails.email = this.sessionService.session.email;
          }
        }

        if (overrideDonorDetails) {
          const initialLoad = !this.$window.sessionStorage.getItem(
            'initialLoadComplete',
          );
          if (initialLoad) {
            assign(
              this.donorDetails,
              pick(overrideDonorDetails, [
                'donor-type',
                'name',
                'organization-name',
                'phone-number',
                'spouse-name',
                'mailingAddress',
                'email',
              ]),
            );
            this.$window.sessionStorage.setItem('initialLoadComplete', 'true');
          }
        }

        const checkoutSavedData = this.sessionService.session.checkoutSavedData;
        if (checkoutSavedData) {
          assign(
            this.donorDetails,
            pick(checkoutSavedData, [
              'name',
              'mailingAddress',
              'donor-type',
              'organization-name',
              'phone-number',
              'spouse-name',
            ]),
          );
          if (
            !!this.donorDetails['spouse-name']['given-name'] ||
            !!this.donorDetails['spouse-name']['family-name']
          ) {
            this.spouseFieldsDisabled = false;
          }
        }
        this.loadRadioStations();
      },
      (error) => {
        this.loadingDonorDetails = false;
        this.loadingDonorDetailsError = true;
        this.$log.error('Error loading donorDetails.', error);
      },
    );
  }

  toggleSpouseDetails() {
    if (this.showSpouseDetails) {
      this.donorDetails['spouse-name'] = {
        'given-name': null,
        'family-name': null,
      };
    }
    this.showSpouseDetails = !this.showSpouseDetails;
  }

  loadRadioStations() {
    const postalCode = this.donorDetails.mailingAddress.postalCode;

    if (this.requestRadioStation && postalCode) {
      this.loadingRadioStationsError = false;

      this.radioStationsService
        .getRadioStations(this.radioStationApiUrl, postalCode)
        .subscribe(
          (data) => {
            this.radioStations = data;
            this.radioStationName =
              this.orderService.retrieveRadioStationName();
          },
          (error) => {
            this.loadingRadioStationsError = true;
            this.$log.error('Error loading radio stations.', error);
          },
        );
    }
  }

  onSelectRadioStation() {
    this.radioStationData = Object.fromEntries(
      Object.entries(this.radioStations).filter(
        ([stationCallLetters, stationName]) =>
          stationName === this.radioStationName,
      ),
    );
  }

  submitDetails() {
    this.detailsForm.$setSubmitted();
    if (this.detailsForm.$valid) {
      const details = this.donorDetails;
      this.submissionError = '';

      // Clear the saved checkout data
      this.sessionService.clearCheckoutSavedData();

      const requests = [this.orderService.updateDonorDetails(details)];
      if (details.email) {
        requests.push(
          this.orderService.addEmail(details.email, details.emailFormUri),
        );
      }
      if (this.radioStationData) {
        this.orderService.storeRadioStationData(this.radioStationData);
      }

      Observable.forkJoin(requests).subscribe(
        () => {
          this.onSubmit({ success: true });
          this.analyticsFactory.checkoutStepOptionEvent(
            this.donorDetails['donor-type'],
            'contact',
          );
        },
        (error) => {
          this.$log.warn('Error saving donor contact info', error);
          this.submissionError = error && error.data;
          if (startsWith(this.submissionError, 'Invalid email address:')) {
            this.submissionError = 'Invalid email address';
          }
          this.onSubmit({ success: false });
        },
      );
    } else {
      this.analyticsFactory.handleCheckoutFormErrors(this.detailsForm);
      this.onSubmit({ success: false });
    }
  }
}

export default angular
  .module(componentName, [
    'ngMessages',
    addressForm.name,
    emailField.name,
    orderService.name,
    radioStationsService.name,
    sessionService.name,
    analyticsFactory.name,
    uibTooltip,
  ])
  .component(componentName, {
    controller: Step1Controller,
    templateUrl: template,
    bindings: {
      submitted: '<',
      donorDetails: '=?',
      onSubmit: '&',
      radioStationApiUrl: '<',
      useV3: '<',
    },
  });

import angular from 'angular';
import { datadogRum } from '@datadog/browser-rum';
import commonModule from 'common/common.module';
import showErrors from 'common/filters/showErrors.filter';
import sessionService, { Roles } from 'common/services/session/session.service';
import sessionModalService from 'common/services/session/sessionModal.service';
import orderService from 'common/services/api/order.service';
import verificationService from 'common/services/api/verification.service';
import template from './oktaAuthCallback.tpl.html';

const componentName = 'oktaAuthCallback';
export const unknownErrorMessage =
  'Failed to authenticate user when redirecting from Okta. Please try to sign in again.';

// Okta's response params must not follow the donor to checkout, where they would reach RUM and analytics.
export function checkoutUrlWithoutOktaParams(search) {
  const params = new URLSearchParams(search);
  ['code', 'state', 'interaction_code', 'error', 'error_description'].forEach(
    (param) => params.delete(param),
  );
  const query = params.toString();
  return query ? `/checkout.html?${query}` : '/checkout.html';
}

class OktaAuthCallbackController {
  /* @ngInject */
  constructor(
    $log,
    $window,
    sessionService,
    sessionModalService,
    orderService,
    verificationService,
  ) {
    this.$log = $log;
    this.$window = $window;
    this.sessionService = sessionService;
    this.sessionModalService = sessionModalService;
    this.orderService = orderService;
    this.verificationService = verificationService;
    this.datadogRum = datadogRum;
  }

  $onInit() {
    this.initializeVariables();
    if (this.sessionService.isOktaRedirectReplay()) {
      this.handleReplayedCallback();
      return;
    }
    this.sessionService.handleOktaRedirect().subscribe({
      next: (data) => this.onSignInSuccess(data),
      error: (error) => this.onSignInFailure(error),
    });
  }

  $onDestroy() {
    if (angular.isDefined(this.verificationServiceSubscription)) {
      this.verificationServiceSubscription.unsubscribe();
    }
  }

  initializeVariables() {
    this.isReadyToRedirect = false;
    this.errorMessage = '';
  }

  onSignInSuccess(data) {
    // handleOktaRedirect emits `false` when the page loads without an Okta
    // login redirect in the URL (direct navigation, refresh, bookmark, back
    // button, etc). Redirect to the sign-in page instead of showing an error
    // message.
    if (data === false) {
      this.redirectToSignInPage();
      return;
    }
    if (!data) {
      this.onSignInFailure(data);
      return;
    }
    this.orderService.getDonorDetails().subscribe((data) => {
      const registrationState = data['registration-state'];
      if (registrationState === 'NEW') {
        const isValid = this.areRequiredFieldsFilled(data);
        if (isValid) {
          this.postDonorMatches();
        } else {
          this.openContactInfoModalThenRedirect();
        }
      } else if (registrationState === 'MATCHED') {
        this.openUserMatchModalThenRedirect();
      } else {
        this.redirectToLocationPriorToLogin();
      }
    });
  }

  openUserMatchModalThenRedirect() {
    this.sessionModalService.userMatch().then(() => {
      this.redirectToLocationPriorToLogin();
    });
  }

  openContactInfoModalThenRedirect() {
    this.sessionModalService
      .registerAccount({ dismissable: false })
      .then(() => {
        this.redirectToLocationPriorToLogin();
      });
  }

  postDonorMatches() {
    if (angular.isDefined(this.verificationServiceSubscription)) {
      this.verificationServiceSubscription.unsubscribe();
    }
    this.verificationServiceSubscription = this.verificationService
      .postDonorMatches()
      .subscribe({
        next: () => this.openUserMatchModalThenRedirect(),
        error: () => this.openContactInfoModalThenRedirect(),
      });
  }

  areRequiredFieldsFilled(donorDetails) {
    const requiredFields = [
      'name.given-name',
      'name.family-name',
      'email',
      'donor-type',
      'mailingAddress.country',
      'mailingAddress.streetAddress',
    ];

    if (donorDetails['donor-type'] === 'Organization') {
      requiredFields.push('organization-name');
    }
    if (donorDetails.mailingAddress.country === 'US') {
      requiredFields.push(
        'mailingAddress.locality',
        'mailingAddress.region',
        'mailingAddress.postalCode',
      );
    }

    return requiredFields.every((field) => {
      // Split the field name into individual keys to handle nested objects.
      // For example, 'mailingAddress.streetAddress' becomes ['mailingAddress', 'streetAddress'].
      const keys = field.split('.');
      // Check if each key's value returns a truthy value.
      // If any property is falsy, the reduce function returns a falsy value,
      // and the every method returns false.
      return keys.reduce((obj, key) => obj && obj[key], donorDetails);
    });
  }

  onSignInFailure(error) {
    const errorMessage =
      error instanceof Error ? error.message : unknownErrorMessage;
    this.$log.error(errorMessage, error);
    this.sessionService.clearRedirectLocation();
    this.errorMessage = errorMessage;
  }

  // A callback whose sign-in already finished, usually reached with the Back button. Not an error.
  handleReplayedCallback() {
    const signedIn = this.sessionService.getRole() === Roles.registered;
    this.datadogRum.addAction('okta-callback-replay', {
      signedIn,
      navigationType: this.getNavigationType(),
    });
    if (signedIn) {
      this.$window.location.replace(
        this.sessionService.getSignInStartLocation() ||
          checkoutUrlWithoutOktaParams(this.$window.location.search),
      );
    } else {
      this.redirectToSignInPage();
    }
  }

  getNavigationType() {
    return (
      this.$window.performance?.getEntriesByType?.('navigation')?.[0]?.type ||
      'unknown'
    );
  }

  redirectToLocationPriorToLogin() {
    this.isReadyToRedirect = true;
    const previousLocation = this.sessionService.getRedirectLocation();
    if (previousLocation) {
      this.sessionService.clearRedirectLocation();
      this.$window.location.replace(previousLocation);
    } else {
      this.$window.location.replace(`/checkout.html${window.location.search}`);
    }
  }

  redirectToSignInPage() {
    this.$window.location.replace('/sign-in.html');
  }
}

export default angular
  .module(componentName, [
    commonModule.name,
    sessionService.name,
    sessionModalService.name,
    orderService.name,
    verificationService.name,
    showErrors.name,
  ])
  .component(componentName, {
    controller: OktaAuthCallbackController,
    templateUrl: template,
  });

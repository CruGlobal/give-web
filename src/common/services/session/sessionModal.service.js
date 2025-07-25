import angular from 'angular';
import modalStateService from 'common/services/modalState.service';
import sessionModalComponent from './sessionModal.component';
import sessionModalWindowTemplate from './sessionModalWindow.tpl.html';
import analyticsFactory from 'app/analytics/analytics.factory';
import uibModal from 'angular-ui-bootstrap/src/modal';

const serviceName = 'sessionModalService';

const SessionModalService = /* @ngInject */ function (
  $uibModal,
  $log,
  modalStateService,
  analyticsFactory,
) {
  let currentModal;

  function openModal(type, options, replace) {
    if (angular.isDefined(currentModal)) {
      if (replace === true) {
        currentModal.dismiss('replaced');
      } else {
        $log.error('Attempted to open more than 1 modal');
        return false;
      }
    }
    type = angular.isDefined(type) ? type : 'register-account';
    options = angular.isObject(options) ? options : {};
    const modalOptions = angular.merge(
      {},
      {
        component: sessionModalComponent.name,
        windowTemplateUrl: sessionModalWindowTemplate,
        ariaLabelledBy: 'session-modal-title',
        resolve: {
          state: () => type,
        },
      },
      options,
    );
    currentModal = $uibModal.open(modalOptions);
    currentModal.type = type;
    currentModal.result.finally(() => {
      // Clear the modal name when modals close
      modalStateService.name(null);

      // Destroy current modal
      currentModal = undefined;
    });

    if (options.dismissAnalyticsEvent) {
      currentModal.result.then(angular.noop, () => {
        analyticsFactory.track(options.dismissAnalyticsEvent);
      });
    }

    if (options.openAnalyticsEvent) {
      currentModal.opened.then(() => {
        analyticsFactory.track(options.openAnalyticsEvent);
      }, angular.noop);
    }

    return currentModal;
  }

  return {
    open: openModal,
    currentModal: () => currentModal,
    signIn: (lastPurchaseId) =>
      openModal('register-account', {
        resolve: {
          lastPurchaseId: () => lastPurchaseId,
        },
        backdrop: 'static',
        keyboard: false,
        openAnalyticsEvent: 'ga-sign-in',
        dismissAnalyticsEvent: 'ga-sign-in-exit',
      }).result,
    userMatch: () =>
      openModal('user-match', {
        backdrop: 'static',
        openAnalyticsEvent: 'ga-registration-match-is-this-you',
        dismissAnalyticsEvent: 'ga-registration-exit',
      }).result,
    accountBenefits: (lastPurchaseId) =>
      openModal('account-benefits', {
        resolve: { lastPurchaseId: () => lastPurchaseId },
        size: 'sm',
      }).result,
    registerAccount: ({
      lastPurchaseId,
      dismissable = true,
      signUp = false,
    } = {}) =>
      openModal('register-account', {
        resolve: {
          lastPurchaseId: () => lastPurchaseId,
          hideCloseButton: () => !dismissable,
          registerAccountSignUp: () => signUp,
        },
        backdrop: 'static',
        keyboard: false,
      }).result,
  };
};

export default angular
  .module(serviceName, [
    uibModal,
    modalStateService.name,
    sessionModalComponent.name,
    analyticsFactory.name,
  ])
  .factory(serviceName, SessionModalService);

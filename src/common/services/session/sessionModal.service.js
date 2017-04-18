import angular from 'angular';
import 'angular-ui-bootstrap';
import modalStateService from 'common/services/modalState.service';
import sessionModalController from './sessionModal.controller';
import sessionModalTemplate from './sessionModal.tpl.html';
import sessionModalWindowTemplate from './sessionModalWindow.tpl.html';
import analyticsFactory from 'app/analytics/analytics.factory';

let serviceName = 'sessionModalService';

/*@ngInject*/
function SessionModalService( $uibModal, $log, modalStateService, analyticsFactory ) {
  let currentModal;

  function openModal( type, options, replace ) {
    if ( angular.isDefined( currentModal ) ) {
      if ( replace === true ) {
        currentModal.dismiss( 'replaced' );
      }
      else {
        $log.error( 'Attempted to open more than 1 modal' );
        return false;
      }
    }
    type = angular.isDefined( type ) ? type : 'sign-in';
    options = angular.isObject( options ) ? options : {};
    let modalOptions = angular.merge( {}, {
      templateUrl:       sessionModalTemplate,
      controller:        sessionModalController.name,
      controllerAs:      '$ctrl',
      size:              'sm',
      windowTemplateUrl: sessionModalWindowTemplate,
      resolve:           {
        state: () => type
      }
    }, options );
    currentModal = $uibModal.open( modalOptions );
    currentModal.result
      .finally( () => {
        // Clear the modal name when modals close
        modalStateService.name( null );

        // Destroy current modal
        currentModal = undefined;
      } );

    if(options.dismissAnalyticsEvent){
      currentModal.result
        .then( angular.noop, () => {
          analyticsFactory.track(options.dismissAnalyticsEvent);
        } );
    }

    if(options.openAnalyticsEvent){
      currentModal.opened.then( () => {
          analyticsFactory.track(options.openAnalyticsEvent);
        }, angular.noop );
    }

    return currentModal;
  }

  return {
    open:            openModal,
    currentModal:    () => currentModal,
    signIn:          (lastPurchaseId) => openModal( 'sign-in', {
      resolve: { lastPurchaseId: () => lastPurchaseId },
      openAnalyticsEvent: 'aa-sign-in',
      dismissAnalyticsEvent: 'aa-sign-in-exit'
    } ).result,
    signUp:          () => openModal( 'sign-up' ).result,
    forgotPassword:  () => openModal( 'forgot-password' ).result,
    resetPassword:   () => openModal( 'reset-password', {backdrop: 'static'} ).result,
    userMatch:       () => openModal( 'user-match', {
      backdrop: 'static',
      openAnalyticsEvent: 'aa-registration-match-is-this-you',
      dismissAnalyticsEvent: 'aa-registration-exit'
    } ).result,
    contactInfo:     () => openModal( 'contact-info', {size: '', backdrop: 'static'} ).result,
    accountBenefits: (lastPurchaseId) => openModal( 'account-benefits', { resolve: { lastPurchaseId: () => lastPurchaseId } } ).result,
    registerAccount: () => openModal( 'register-account', {backdrop: 'static', keyboard: false} ).result
  };
}

export default angular
  .module( serviceName, [
    'ui.bootstrap',
    modalStateService.name,
    sessionModalController.name,
    analyticsFactory.name
  ] )
  .factory( serviceName, SessionModalService )
  .config( function ( modalStateServiceProvider ) {
    modalStateServiceProvider.registerModal(
      'reset-password',
      /*@ngInject*/
      function ( sessionModalService ) {
        sessionModalService.resetPassword();
      } );
  } );

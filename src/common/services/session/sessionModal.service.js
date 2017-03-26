import angular from 'angular';
import 'angular-ui-bootstrap';
import modalStateService from 'common/services/modalState.service';
import sessionModalController from './sessionModal.controller';
import sessionModalTemplate from './sessionModal.tpl.html';
import sessionModalWindowTemplate from './sessionModalWindow.tpl.html';

let serviceName = 'sessionModalService';

/*@ngInject*/
function SessionModalService( $uibModal, $log, modalStateService ) {
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
    var modalOptions = angular.merge( {}, {
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
    return currentModal;
  }

  return {
    open:            openModal,
    currentModal:    () => currentModal,
    signIn:          () => openModal( 'sign-in' ).result,
    signUp:          () => openModal( 'sign-up' ).result,
    forgotPassword:  () => openModal( 'forgot-password' ).result,
    resetPassword:   () => openModal( 'reset-password', {backdrop: 'static'} ).result,
    userMatch:       () => openModal( 'user-match', {backdrop: 'static'} ).result,
    contactInfo:     () => openModal( 'contact-info', {size: '', backdrop: 'static'} ).result,
    accountBenefits: () => openModal( 'account-benefits' ).result,
    registerAccount: () => openModal( 'register-account', {backdrop: 'static', keyboard: false} ).result
  };
}

export default angular
  .module( serviceName, [
    'ui.bootstrap',
    modalStateService.name,
    sessionModalController.name
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

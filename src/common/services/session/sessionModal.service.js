import angular from 'angular';
import 'angular-bootstrap';
import modalStateService from 'common/services/modalState.service';
import sessionModalController from './sessionModal.controller';
import sessionModalTemplate from './sessionModal.tpl';
import sessionModalWindowTemplate from './sessionModalWindow.tpl';

let serviceName = 'sessionModalService';

/*@ngInject*/
function SessionModalService( $uibModal, modalStateService ) {

  function openModal( type, options ) {
    type = angular.isDefined( type ) ? type : 'sign-in';
    options = angular.isObject( options ) ? options : {};
    var modalOptions = angular.merge( {}, {
      templateUrl:       sessionModalTemplate.name,
      controller:        sessionModalController.name,
      controllerAs:      '$ctrl',
      size:              'sm',
      windowTemplateUrl: sessionModalWindowTemplate.name,
      resolve:           {
        state: () => type
      }
    }, options );
    let modalInstance = $uibModal.open( modalOptions );
    modalInstance.result
      .finally( () => {
        // Clear the modal name when modals close
        modalStateService.name( null );
      } );
    return modalInstance;
  }

  return {
    open:           openModal,
    signIn:         () => openModal( 'sign-in' ).result,
    signUp:         () => openModal( 'sign-up' ).result,
    forgotPassword: () => openModal( 'forgot-password' ).result,
    resetPassword:  () => openModal( 'reset-password', {backdrop: 'static'} ).result
  };
}

export default angular
  .module( serviceName, [
    'ui.bootstrap',
    modalStateService.name,
    sessionModalController.name,
    sessionModalTemplate.name,
    sessionModalWindowTemplate.name
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

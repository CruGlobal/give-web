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
    return $uibModal
      .open( modalOptions )
      .result
      .finally( () => {
        // Clear the modal name and params when modals close
        modalStateService.setName();
        modalStateService.setParams();
      } );
  }

  return {
    open:           openModal,
    signIn:         () => openModal( 'sign-in' ),
    signUp:         () => openModal( 'sign-up' ),
    forgotPassword: () => openModal( 'forgot-password' ),
    resetPassword:  () => openModal( 'reset-password', {backdrop: 'static'} )
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

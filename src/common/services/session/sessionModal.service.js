import angular from 'angular';
import 'angular-bootstrap';
import sessionModalController from './sessionModal.controller';
import sessionModalTemplate from './sessionModal.tpl';

let serviceName = 'sessionModalService';

/*@ngInject*/
function sessionModal( $uibModal ) {

  function openModal( type, options ) {
    type = angular.isDefined( type ) ? type : 'sign-in';
    options = angular.isObject( options ) ? options : {};
    var modalOptions = angular.merge( {}, {
      templateUrl:  sessionModalTemplate.name,
      controller:   sessionModalController.name,
      controllerAs: '$ctrl',
      size:         'sm',
      resolve:      {
        state: () => type
      }
    }, options );
    return $uibModal
      .open( modalOptions )
      .result;
  }

  return {
    open:   openModal,
    signIn: () => openModal( 'sign-in' ),
    signUp: () => openModal( 'sign-up' )
  };
}

export default angular
  .module( serviceName, [
    'ui.bootstrap',
    sessionModalController.name,
    sessionModalTemplate.name
  ] )
  .factory( serviceName, sessionModal );

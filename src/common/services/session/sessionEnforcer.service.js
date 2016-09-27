import angular from 'angular';
import includes from 'lodash/includes';
import filter from 'lodash/filter';
import pick from 'lodash/pick';
import sessionService from 'common/services/session/session.service';
import sessionModalService from 'common/services/session/sessionModal.service';

let serviceName = 'sessionEnforcerService';

/*@ngInject*/
function SessionEnforcerService( sessionService, sessionModalService ) {
  let enforcers = {}, modal;

  function enforceRoles( roles, callbacks ) {
    if ( !angular.isArray( roles ) ) return false;
    callbacks = angular.isDefined( callbacks ) ? callbacks : {};
    let id = Date.now().toString();
    enforcers[id] = angular.merge( {}, {roles: roles}, pick( callbacks, ['sign-in', 'cancel', 'change'] ) );

    // Enforce new roles on current session
    sessionChanged();
    return id;
  }

  enforceRoles.cancel = function ( id ) {
    if ( id in enforcers ) {
      delete enforcers[id];
      return true;
    }
    return false;
  };

  // Watch for changes to session
  sessionService.sessionSubject.subscribe( sessionChanged );

  function sessionChanged() {
    let role = sessionService.getRole(),
      enforced = filter( enforcers, ( enforcer ) => {
        return !includes( enforcer.roles, role );
      } );
    if ( enforced.length ) {
      angular.forEach( enforced, ( enforcer ) => {
        if ( angular.isFunction( enforcer['change'] ) ) enforcer['change']( role );
      } );

      if ( angular.isUndefined( modal ) ) {
        modal = sessionModalService.open( 'sign-in', {backdrop: 'static', keyboard: false} );
        modal.result
          .then( () => {
            angular.forEach( enforced, ( enforcer ) => {
              if ( angular.isFunction( enforcer['sign-in'] ) ) enforcer['sign-in']();
            } );
          }, () => {
            angular.forEach( enforced, ( enforcer ) => {
              if ( angular.isFunction( enforcer['cancel'] ) ) enforcer['cancel']();
            } );
          } );
        modal.result
          .finally( () => {
            modal = undefined;
          } );
      }
    }
  }

  return enforceRoles;
}

export default angular
  .module( serviceName, [
    sessionService.name,
    sessionModalService.name
  ] )
  .factory( serviceName, SessionEnforcerService );

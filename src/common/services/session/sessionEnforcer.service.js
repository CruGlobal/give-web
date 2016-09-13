import angular from 'angular';
import includes from 'lodash/includes';
import filter from 'lodash/filter';
import sessionService from 'common/services/session/session.service';
import sessionModalService from 'common/services/session/sessionModal.service';

let serviceName = 'sessionEnforcerService';

/*@ngInject*/
function SessionEnforcerService( sessionService, sessionModalService ) {
  let enforcers = {};

  function enforceRoles( roles, success, failure ) {
    if ( !angular.isArray( roles ) ) return false;
    let id = Date.now().toString();
    enforcers[id] = {
      roles:   roles,
      success: angular.isFunction( success ) ? success : angular.noop,
      failure: angular.isFunction( failure ) ? failure : angular.noop
    };

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
      sessionModalService
        .open( 'sign-in', {backdrop: 'static', keyboard: false} )
        .result
        .then( () => {
          angular.forEach( enforced, ( enforcer ) => {
            enforcer.success();
          } );
        }, () => {
          angular.forEach( enforced, ( enforcer ) => {
            enforcer.failure();
          } );
        } );
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

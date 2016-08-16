import angular from 'angular';
import 'angular-cookies';
import jwtDecode from 'jwt-decode';

import casApiService from '../casApi.service';

let serviceName = 'sessionService';

/*@ngInject*/
function session( $log, $cookies, $rootScope, casApiService ) {
  var session = {
    role:   'PUBLIC',
    cortex: {}
  };

  // Set initial session on load
  updateCurrentSession( $cookies.get( 'cortex-session' ) );

  // Watch cortex-session cookie for changes and update existing session variable
  // eslint-disable-next-line angular/on-watch
  $rootScope.$watch( () => $cookies.get( 'cortex-session' ), updateCurrentSession );

  return {
    current: session,
    signIn:  signIn
  };

  function signIn( username, password ) {
    return casApiService.post( {
      path: 'login',
      data: {
        username: username,
        password: password
      }
    } );
  }

  function updateCurrentSession( encoded_value ) {
    var cortexSession = {};
    if ( angular.isDefined( encoded_value ) ) {
      cortexSession = jwtDecode( encoded_value );
    }
    // Update role based on new token_hash, default to PUBLIC if missing
    session.role = angular.isDefined( cortexSession.token_hash ) ? cortexSession.token_hash.role : 'PUBLIC';
    // Copy new session into current session object
    angular.copy( cortexSession, session.cortex );
  }
}

export default angular
  .module( serviceName, [
    'ngCookies',
    casApiService.name
  ] )
  .factory( serviceName, session );

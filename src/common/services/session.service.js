import angular from 'angular';
import 'angular-environment';
import 'angular-cookies';
import jwtDecode from 'jwt-decode';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/map';

import appConfig from 'common/app.config';

let serviceName = 'sessionService';

/*@ngInject*/
function session( $cookies, $rootScope, $http, envService ) {
  var session = {
    role:   'PUBLIC',
    cortex: {}
  };

  // Set initial session on load
  updateCurrentSession( $cookies.get( 'cortex-session' ) );

  // Watch cortex-session cookie for changes and update existing session variable
  // eslint-disable-next-line angular/on-watch
  $rootScope.$watch( () => $cookies.get( 'cortex-session' ), updateCurrentSession );

  // Return sessionService public interface
  return {
    current: session,
    signIn:  signIn
  };

  /* Public Methods */

  function signIn( username, password ) {
    return Observable.from( $http( {
      method:          'POST',
      url:             casApiUrl( '/login' ),
      data:            {
        username: username,
        password: password
      },
      withCredentials: true
    } ) )
      .map( ( response ) => {
        return response.data;
      } );
  }

  /* Private Methods */

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

  function casApiUrl( path ) {
    var apiUrl = envService.read( 'apiUrl' ) + '/cas';
    if ( angular.isArray( path ) ) {
      return apiUrl + '/' + path.join( '/' );
    }
    return apiUrl + (path.charAt( 0 ) === '/' ? path : '/' + path);
  }
}

export default angular
  .module( serviceName, [
    'ngCookies',
    'environment',
    appConfig.name
  ] )
  .factory( serviceName, session );

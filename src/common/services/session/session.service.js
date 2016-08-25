import angular from 'angular';
import 'angular-cookies';
import 'angular-environment';
import jwtDecode from 'jwt-decode';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/map';

import appConfig from 'common/app.config';

let serviceName = 'sessionService';

/*@ngInject*/
function session( $cookies, $rootScope, $http, $q, envService ) {
  var session = {},
    sessionSubject = new BehaviorSubject( session );

  // Set initial session on load
  updateCurrentSession( $cookies.get( 'cortex-session' ) );

  // Watch cortex-session cookie for changes and update existing session variable
  // This only detects changes made by $http or other angular services, not the browser expiring the cookie.
  // eslint-disable-next-line angular/on-watch
  $rootScope.$watch( () => $cookies.get( 'cortex-session' ), updateCurrentSession );

  // Return sessionService public interface
  return {
    session:        session,
    sessionSubject: sessionSubject,
    getRole:        currentRole,
    signIn:         signIn,
    signOut:        signOut,
    signUp:         signUp
  };

  /* Public Methods */
  function signIn( username, password ) {
    return Observable
      .from( $http( {
        method:          'POST',
        url:             casApiUrl( '/login' ),
        data:            {
          username: username,
          password: password
        },
        withCredentials: true
      } ) )
      .map( ( response ) => response.data );
  }

  function signOut() {
    // https://github.com/CruGlobal/cortex_gateway/wiki/Logout
    return $http( {
      method:          'DELETE',
      url:             casApiUrl( '/logout' ),
      withCredentials: true
    } );
  }

  function signUp( email, password, first_name, last_name ) {
    // https://github.com/CruGlobal/cortex_gateway/wiki/Create-User
    return Observable
      .from( $http( {
        method:          'POST',
        url:             casApiUrl( '/register' ),
        withCredentials: true,
        data:            {
          email:     email,
          password:  password,
          firstName: first_name,
          lastName:  last_name
        }
      } ) )
      .map( ( response ) => response.data );
  }

  /* Private Methods */
  function updateCurrentSession( encoded_value ) {
    var cortexSession = {};
    if ( angular.isDefined( encoded_value ) ) {
      cortexSession = jwtDecode( encoded_value );
    }
    // Copy new session into current session object
    angular.copy( cortexSession, session );
    // Update sessionSubject with new value
    sessionSubject.next( session );
  }

  function currentRole() {
    if ( angular.isDefined( session.token_hash ) ) {
      if ( session.token_hash.role === 'PUBLIC' ) {
        return 'PUBLIC';
      }
      // Expired cookies are undefined
      if ( angular.isUndefined( $cookies.get( 'give-session' ) ) ) {
        return 'IDENTIFIED';
      }
      return session.token_hash.role;
    }
    return 'PUBLIC';
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

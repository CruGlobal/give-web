import angular from 'angular';
import 'angular-cookies';
import jwtDecode from 'jwt-decode';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/finally';

import {updateRollbarPerson} from 'common/rollbar.config.js';

import appConfig from 'common/app.config';

let serviceName = 'sessionService';
export let Roles = {
  public:     'PUBLIC',
  identified: 'IDENTIFIED',
  registered: 'REGISTERED'
};

export let Sessions = {
  role:    'cortex-role',
  give:    'give-session',
  profile: 'cru-profile'
};

export let SignInEvent = 'SessionSignedIn';
export let SignOutEvent = 'SessionSignedOut';

/*@ngInject*/
function session( $cookies, $rootScope, $http, $timeout, envService ) {
  let session = {},
    sessionSubject = new BehaviorSubject( session ),
    sessionTimeout,
    maximumTimeout = 30 * 1000;

  // Set initial session on load
  updateCurrentSession( $cookies.get( Sessions.role ) );

  // Watch cortex-session cookie for changes and update existing session variable
  // This only detects changes made by $http or other angular services, not the browser expiring the cookie.
  // eslint-disable-next-line angular/on-watch
  $rootScope.$watch( () => $cookies.get( Sessions.role ), updateCurrentSession );

  // Return sessionService public interface
  return {
    session:          session,
    sessionSubject:   sessionSubject,
    getRole:          currentRole,
    signIn:           signIn,
    signOut:          signOut,
    signUp:           signUp,
    forgotPassword:   forgotPassword,
    resetPassword:    resetPassword,
    downgradeToGuest: downgradeToGuest
  };

  /* Public Methods */
  function signIn( username, password, lastPurchaseId ) {
    let data = {
      username: username,
      password: password
    };
    // Only send lastPurchaseId if present and currently public
    if(angular.isDefined(lastPurchaseId) && currentRole() === Roles.public)
      data.lastPurchaseId = lastPurchaseId;
    return Observable
      .from( $http( {
        method:          'POST',
        url:             casApiUrl( '/login' ),
        data:            data,
        withCredentials: true
      } ) )
      .map( ( response ) => response.data )
      .finally(() => {
        $rootScope.$broadcast( SignInEvent );
      });
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

  function forgotPassword( email, passwordResetUrl ) {
    // https://github.com/CruGlobal/cortex_gateway/wiki/Send-Forgot-Password-Email
    return Observable
      .from( $http( {
        method:          'POST',
        url:             casApiUrl( '/send_forgot_password_email' ),
        withCredentials: true,
        data:            {
          email:            email,
          passwordResetUrl: passwordResetUrl
        }
      } ) )
      .map( ( response ) => response.data );
  }

  function resetPassword( email, password, resetKey ) {
    // https://github.com/CruGlobal/cortex_gateway/wiki/Set-Password-By-Reset-Key
    return Observable
      .from( $http( {
        method:          'POST',
        url:             casApiUrl( '/reset_password' ),
        withCredentials: true,
        data:            {
          email:    email,
          password: password,
          resetKey: resetKey
        }
      } ) )
      .map( ( response ) => response.data );
  }

  function downgradeToGuest( skipEvent = false ) {
    let observable = currentRole() == Roles.public ?
      Observable.throw( 'must be IDENTIFIED' ) :
      Observable
        .from( $http( {
          method:          'POST',
          url:             casApiUrl( '/downgrade' ),
          withCredentials: true,
          data:            {}
        } ) )
        .map( ( response ) => response.data );
    return skipEvent ? observable : observable.finally( () => {
      $rootScope.$broadcast( SignOutEvent );
    } );
  }

  /* Private Methods */
  function updateCurrentSession( encoded_value ) {
    let cortexRole = {}, cruProfile = {};
    if ( angular.isDefined( encoded_value ) ) {
      cortexRole = jwtDecode( encoded_value );
    }

    if( angular.isDefined( $cookies.get( Sessions.profile ) ) ) {
      cruProfile = jwtDecode( $cookies.get( Sessions.profile ) );
    }

    // Set give-session expiration timeout if defined
    let timeout = giveSessionExpiration();
    if ( angular.isDefined( timeout ) ) setSessionTimeout( timeout );

    // Copy new session into current session object
    let newSession = angular.merge( {}, cortexRole, cruProfile );
    angular.copy( newSession, session );

    // Update sessionSubject with new value
    sessionSubject.next( session );

    updateRollbarPerson( session );
  }

  function setSessionTimeout( timeout ) {
    // Cancel current session timeout
    if ( angular.isDefined( sessionTimeout ) ) {
      $timeout.cancel( sessionTimeout );
      sessionTimeout = undefined;
    }

    // Set sessionTimeout for MIN(maximumTimeout, timeout)
    sessionTimeout = $timeout( timeout < maximumTimeout ? timeout : maximumTimeout );
    sessionTimeout.then( () => {
      sessionTimeout = undefined;
      let expiration = giveSessionExpiration();
      if ( angular.isUndefined( expiration ) ) {
        // Give session has expired
        updateCurrentSession( $cookies.get( Sessions.role ) );
      } else {
        setSessionTimeout( expiration );
      }
    }, angular.noop );
  }

  function giveSessionExpiration() {
    let encodedGiveSession = $cookies.get( Sessions.give );
    // Give session has expired if not defined
    if ( angular.isUndefined( encodedGiveSession ) ) return undefined;
    let giveSession = jwtDecode( encodedGiveSession ),
      timeout = new Date( giveSession.exp * 1000 ) - Date.now();
    if ( timeout <= 0 ) {
      // Give session still exists but has expired (some browsers may not delete expired cookies)
      $cookies.remove( Sessions.give, {path: '/', domain: '.cru.org'} );
      return undefined;
    }
    return timeout;
  }

  function currentRole() {
    if ( angular.isDefined( session.role ) ) {
      if ( session.role === Roles.public ) {
        return Roles.public;
      }
      // Expired cookies are undefined
      if ( angular.isUndefined( $cookies.get( Sessions.give ) ) ) {
        return Roles.identified;
      }
      return session.role;
    }
    return Roles.public;
  }

  function casApiUrl( path ) {
    var apiUrl = envService.read( 'apiUrl' ) + '/cas';
    return apiUrl + path;
  }
}

export default angular
  .module( serviceName, [
    'ngCookies',
    appConfig.name
  ] )
  .factory( serviceName, session );

import angular from 'angular'
import 'angular-cookies'
import jwtDecode from 'jwt-decode'
import moment from 'moment'
import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import OktaSignIn from '@okta/okta-signin-widget'
import 'rxjs/add/observable/from'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/finally'

import { updateRollbarPerson } from 'common/rollbar.config.js'

import appConfig from 'common/app.config'
/* eslint-disable camelcase */
const serviceName = 'sessionService'
export const Roles = {
  public: 'PUBLIC',
  identified: 'IDENTIFIED',
  registered: 'REGISTERED'
}

export const Sessions = {
  role: 'cortex-role',
  give: 'give-session',
  profile: 'cru-profile'
}

export const locationOnLogin = 'locationOnLogin'
export const locationSearchOnLogin = 'locationSearchOnLogin'
export const checkoutSavedDataCookieName = 'checkoutSavedData'
export const forcedUserToLogout = 'forcedUserToLogout'
export const cookieDomain = '.cru.org'

export const SignInEvent = 'SessionSignedIn'
export const SignOutEvent = 'SessionSignedOut'
export const LoginOktaOnlyEvent = 'loginAsOktaOnlyUser'

const session = /* @ngInject */ function ($cookies, $rootScope, $http, $timeout, $window, $location, envService) {
  const session = {}
  const sessionSubject = new BehaviorSubject(session)
  let sessionTimeout
  const maximumTimeout = 30 * 1000

  const oktaSignInWidgetDefaultOptions = {
    baseUrl: envService.read('oktaUrl'),
    clientId: envService.read('oktaClientId'),
    issuer: envService.read('oktaUrl'),
    redirectUri: `${window.location.origin}/okta-auth-callback.html`,
    scopes: ['openid', 'email', 'profile'],
    authParams: {
      grantType: ['refresh_token', 'authorization_code'],
      display: 'page',
      pkce: true,
      responseType: ['code']
    },
    useInteractionCodeFlow: true // Enable Interaction Code flow
  }
  const oktaSignInWidget = new OktaSignIn(oktaSignInWidgetDefaultOptions)
  const { authClient } = oktaSignInWidget

  // Set initial session on load
  updateCurrentSession()

  // Remove session data if present
  removeForcedUserToLogoutSessionData()

  // Watch cortex-session cookie for changes and update existing session variable
  // This only detects changes made by $http or other angular services, not the browser expiring the cookie.
  $rootScope.$watch(() => $cookies.get(Sessions.role), updateCurrentSession)

  // Return sessionService public interface
  return {
    session: session,
    sessionSubject: sessionSubject,
    authClient: authClient, // Exposed for tests only
    oktaSignInWidgetDefaultOptions,
    clearCheckoutSavedData: clearCheckoutSavedData,
    downgradeToGuest: downgradeToGuest,
    getRole: currentRole,
    getOktaUrl: getOktaUrl,
    handleOktaRedirect: handleOktaRedirect,
    getLocationOnLogin: getLocationOnLogin,
    isOktaRedirecting: isOktaRedirecting,
    oktaIsUserAuthenticated: oktaIsUserAuthenticated,
    updateCurrentProfile: updateCurrentProfile,
    updateCheckoutSavedData: updateCheckoutSavedData,
    removeOktaRedirectIndicator: removeOktaRedirectIndicator,
    removeLocationOnLogin: removeLocationOnLogin,
    signIn: signIn,
    signOut: signOut,
    signOutWithoutRedirectToOkta: signOutWithoutRedirectToOkta
  }

  function handleOktaRedirect (lastPurchaseId) {
    if (authClient.isLoginRedirect()) {
      return new Observable(observer => {
        authClient.token.parseFromUrl()
          .then((tokenResponse) => {
            authClient.tokenManager.setTokens(tokenResponse.tokens)
            return signIn(lastPurchaseId).subscribe({
              next: result => {
                observer.next(result)
                observer.complete()
              },
              error: err => {
                observer.error(err)
              }
            })
          })
          .catch(err => {
            observer.error(err)
          })
      })
    } else {
      return Observable.of(false)
    }
  }

  function signIn (lastPurchaseId) {
    session.isOktaRedirecting = true
    return new Observable(observer => {
      internalSignIn(lastPurchaseId)
        .finally(() => {
          $rootScope.$broadcast(SignInEvent)
        })
        .subscribe({
          next: response => {
            const data = response ? response.data : response
            observer.next(data)
            observer.complete()
          },
          error: err => {
            observer.error(err)
          }
        })
    })
  }

  function internalSignIn (lastPurchaseId) {
    return new Observable(observer => {
      authClient.isAuthenticated()
        .then(isAuthenticated => {
          if (!isAuthenticated) {
            setRedirectingOnLogin()
            return authClient.token.getWithRedirect()
          }
          return authClient.tokenManager.getTokens()
        })
        .then(tokens => {
          if (!tokens) {
            return
          }
          const data = { access_token: tokens.accessToken.accessToken }
          // Only send lastPurchaseId if present and currently public
          if (angular.isDefined(lastPurchaseId) && currentRole() === Roles.public) {
            data.lastPurchaseId = lastPurchaseId
          }
          // Add marketing search queries back to URL once returned from Okta
          const locationSearch = $window.sessionStorage.getItem(locationSearchOnLogin) || ''
          if (locationSearch) {
          // eslint-disable-next-line
            const searchQueries = locationSearch.split(/\?|\&/);
            $window.sessionStorage.removeItem(locationSearchOnLogin)
            searchQueries.forEach((searchQuery) => {
              const [search, value] = searchQuery.split('=')
              if (search && value) {
                $location.search(search, value)
              }
            })
          }
          removeOktaRedirectIndicator()
          return $http({
            method: 'POST',
            url: oktaApiUrl('login'),
            data: data,
            withCredentials: true
          })
        })
        .then(response => {
          observer.next(response)
          observer.complete()
        })
        .catch(err => {
          observer.error(err)
        })
    })
  }

  function oktaIsUserAuthenticated () {
    return Observable.from(authClient.isAuthenticated())
  }

  function signOut (redirectHome = true) {
    return new Observable(observer => {
      internalSignOut(redirectHome).subscribe({
        next: response => {
          observer.next(response)
          observer.complete()
        },
        error: err => {
          observer.error(err)
        }
      })
    })
  }

  function internalSignOut (redirectHome = true) {
    return new Observable(observer => {
      const oktaSignOut = () => {
        // Add session data so on return to page we can show an explanation to the user about what happened.
        if (!redirectHome) {
          $window.sessionStorage.setItem(forcedUserToLogout, true)
          // Save location we need to redirect the user back to
          $window.sessionStorage.setItem(locationOnLogin, $window.location.href)
        }
        return authClient.signOut({
          postLogoutRedirectUri: redirectHome ? null : `${envService.read('oktaReferrer')}/sign-out.html`
        })
      }

      $http({
        method: 'DELETE',
        url: oktaApiUrl('logout'),
        withCredentials: true
      }).then(() => clearCheckoutSavedData())
        // Use revokeAccessToken, revokeRefreshToken to ensure authClient is cleared before logging out entirely.
        .then(() => authClient.revokeAccessToken())
        .then(() => authClient.revokeRefreshToken())
        .then(() => oktaSignOut())
        .then(response => {
          observer.next(response)
          observer.complete()
        })
        .catch(() => {
          // If the DELETE request fails, try to sign out of Okta
          oktaSignOut().then(response => {
            observer.next(response)
            observer.complete()
          }).catch(() => {
            // If Okta sign out fails, redirect to Okta sign out page
            $window.location.href = `${envService.read('oktaUrl')}/login/signout?fromURI=${envService.read('oktaReferrer')}`
          })
        })
    })
  };

  function signOutWithoutRedirectToOkta () {
    // ** This function requires third-party cookies **
    // If unsure of the consequences use sessionService.signOut()
    const observable = Observable
      .from($http({
        method: 'DELETE',
        url: oktaApiUrl('logout'),
        withCredentials: true
      }))
      .map((response) => response.data)
    clearCheckoutSavedData()
    // revokeAccessToken() & revokeRefreshToken() sign the user out of Okta on this application.
    // It doesn't close the Okta session on Okta.
    // To close the session on Okta would require calling authClient.signOut(), refreshing the page.
    authClient.revokeAccessToken()
    authClient.revokeRefreshToken()
    return observable.finally(() => {
      $rootScope.$broadcast(SignOutEvent)
    })
  }

  function removeForcedUserToLogoutSessionData () {
    // Allow for 2 seconds, so component can show error to user.
    setTimeout(() => {
      $window.sessionStorage.removeItem(forcedUserToLogout)
    }, 2000)
  }

  function downgradeToGuest (skipEvent = false) {
    const observable = currentRole() === Roles.public
      ? Observable.throw('must be IDENTIFIED')
      : Observable
        .from($http({
          method: 'POST',
          url: oktaApiUrl('downgrade'),
          withCredentials: true,
          data: {}
        }))
        .map((response) => response.data)
    authClient.revokeAccessToken()
    authClient.revokeRefreshToken()
    return skipEvent
      ? observable
      : observable.finally(() => {
        $rootScope.$broadcast(SignOutEvent)
      })
  }

  function getOktaUrl () {
    return envService.read('oktaUrl')
  }

  function removeLocationOnLogin () {
    $window.sessionStorage.removeItem(locationOnLogin)
  }
  function getLocationOnLogin () {
    return $window.sessionStorage.getItem(locationOnLogin)
  }
  function setRedirectingOnLogin () {
    if (['/sign-in.html'].indexOf($location.path()) + 1) {
      // Save marketing search queries as they are lost on redirect
      $window.sessionStorage.setItem(locationSearchOnLogin, $window.location.search)
    } else {
      // Save location we need to redirect the user back to
      $window.sessionStorage.setItem(locationOnLogin, $window.location.href)
    }
  }

  function isOktaRedirecting () {
    return session.isOktaRedirecting ?? false
  }

  function removeOktaRedirectIndicator () {
    session.isOktaRedirecting = false
  }

  function updateCurrentProfile () {
    let cruProfile = {}

    if (angular.isDefined($cookies.get(Sessions.profile))) {
      cruProfile = jwtDecode($cookies.get(Sessions.profile))
      session.first_name = cruProfile.first_name
      session.last_name = cruProfile.last_name
    }

    return cruProfile
  }

  /* Private Methods */
  function updateCurrentSession () {
    const cortexRole = decodeCookie(Sessions.role)
    const cruProfile = updateCurrentProfile()
    const giveSession = decodeCookie(Sessions.give)

    // Set give-session expiration timeout if defined
    const timeout = giveSessionExpiration()
    if (angular.isDefined(timeout)) setSessionTimeout(timeout)

    // Copy new session into current session object
    const newSession = angular.merge({}, cortexRole, cruProfile)
    angular.copy(newSession, session)

    // Update sessionSubject with new value
    sessionSubject.next(session)

    updateRollbarPerson(session, giveSession)
    updateCheckoutSavedData()
  }

  function decodeCookie (cookieName) {
    const jwt = $cookies.get(cookieName)
    return angular.isDefined(jwt) ? jwtDecode(jwt) : {}
  }

  function setSessionTimeout (timeout) {
    // Cancel current session timeout
    if (angular.isDefined(sessionTimeout)) {
      $timeout.cancel(sessionTimeout)
      sessionTimeout = undefined
    }

    // Set sessionTimeout for MIN(maximumTimeout, timeout)
    sessionTimeout = $timeout(timeout < maximumTimeout ? timeout : maximumTimeout)
    sessionTimeout.then(() => {
      sessionTimeout = undefined
      const expiration = giveSessionExpiration()
      if (angular.isUndefined(expiration)) {
        // Give session has expired
        updateCurrentSession()
        clearCheckoutSavedData()
      } else {
        setSessionTimeout(expiration)
      }
    }, angular.noop)
  }

  function giveSessionExpiration () {
    const encodedGiveSession = $cookies.get(Sessions.give)
    // Give session has expired if not defined
    if (angular.isUndefined(encodedGiveSession)) return undefined
    const giveSession = jwtDecode(encodedGiveSession)
    const timeout = new Date(giveSession.exp * 1000) - Date.now()
    if (timeout <= 0) {
      // Give session still exists but has expired (some browsers may not delete expired cookies)
      $cookies.remove(Sessions.give, { path: '/', domain: '.cru.org' })
      return undefined
    }
    return timeout
  }

  function currentRole () {
    if (angular.isDefined(session.role)) {
      if (session.role === Roles.public || angular.isUndefined($cookies.get(Sessions.profile))) {
        return Roles.public
      }
      // Expired cookies are undefined
      if (angular.isUndefined($cookies.get(Sessions.give))) {
        return Roles.identified
      }
      return session.role
    }
    return Roles.public
  }

  function oktaApiUrl (path) {
    return `${envService.read('apiUrl')}/okta/${path}`
  }

  // Added 'isTest' as needed cookie created without domain for unit tests to add or get the cookie.
  function updateCheckoutSavedData (data, isTest = false) {
    try {
      if (data) {
        session.checkoutSavedData = data
        const dataAsString = JSON.stringify(data)
        $cookies.put(
          checkoutSavedDataCookieName,
          dataAsString,
          {
            path: '/',
            domain: isTest ? '' : cookieDomain,
            expires: moment().add(20, 'minutes').toISOString()
          }
        )
      } else {
        const dataAsString = $cookies.get(checkoutSavedDataCookieName)
        if (dataAsString) {
          session.checkoutSavedData = JSON.parse(dataAsString)
        }
      }
      return session.checkoutSavedData
    } catch { }
  }
  // Added 'isTest' as needed cookie created without domain for unit tests to remove the cookie.
  function clearCheckoutSavedData (isTest = false) {
    try {
      session.checkoutSavedData = {}
      $cookies.remove(
        checkoutSavedDataCookieName,
        {
          path: '/',
          domain: isTest ? '' : cookieDomain

        }
      )
      return session.checkoutSavedData
    } catch { }
  }
}

export default angular
  .module(serviceName, [
    'ngCookies',
    appConfig.name
  ])
  .factory(serviceName, session)

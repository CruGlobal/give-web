import angular from 'angular'
import 'angular-cookies'
import jwtDecode from 'jwt-decode'
import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { OktaAuth } from '@okta/okta-auth-js'
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

export const redirectingIndicator = 'redirectingFromOkta'
export const locationOnLogin = 'locationOnLogin'
export const locationSearchOnLogin = 'locationSearchOnLogin'
export const checkoutSavedDataCookieName = 'checkoutSavedData'
export const createAccountDataCookieName = 'createAccountData'
export const cookieDomain = '.cru.org'

export const SignInEvent = 'SessionSignedIn'
export const SignOutEvent = 'SessionSignedOut'
export const LoginOktaOnlyEvent = 'loginAsOktaOnlyUser'

const session = /* @ngInject */ function ($cookies, $rootScope, $http, $timeout, $window, envService) {
  const session = {}
  const sessionSubject = new BehaviorSubject(session)
  let sessionTimeout
  const maximumTimeout = 30 * 1000
  const authClient = new OktaAuth({
    issuer: envService.read('oktaUrl'),
    clientId: envService.read('oktaClientId'),
    redirectUri: `${window.location.origin}${window.location.pathname}`,
    scopes: ['openid', 'email', 'profile']
  })

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
    getRole: currentRole,
    signIn: signIn,
    signOut: signOut,
    handleOktaRedirect: handleOktaRedirect,
    oktaSignIn: oktaSignIn,
    oktaSignOut: oktaSignOut,
    downgradeToGuest: downgradeToGuest,
    getOktaUrl: getOktaUrl,
    removeOktaRedirectIndicator: removeOktaRedirectIndicator,
    isOktaRedirecting: isOktaRedirecting,
    signOutWithoutRedirectToOkta: signOutWithoutRedirectToOkta,
  }

  function handleOktaRedirect (lastPurchaseId) {
    if (authClient.isLoginRedirect()) {
      return Observable.from(authClient.token.parseFromUrl().then((tokenResponse) => {
        authClient.tokenManager.setTokens(tokenResponse.tokens)
        return oktaSignIn(lastPurchaseId)
      }))
    } else {
      return Observable.of(false)
    }
  }

  function oktaSignIn (lastPurchaseId) {
    setOktaRedirecting()
    return Observable.from(internalSignIn(lastPurchaseId))
      .map((response) => response ? response.data : response)
      .finally(() => {
        $rootScope.$broadcast(SignInEvent)
      })
  }

  async function internalSignIn (lastPurchaseId) {
    const isAuthenticated = await authClient.isAuthenticated()
    if (!isAuthenticated) {
      authClient.token.getWithRedirect()
      return
    }
    const tokens = await authClient.tokenManager.getTokens()
    const data = { access_token: tokens.accessToken.accessToken }
    // Only send lastPurchaseId if present and currently public
    if (angular.isDefined(lastPurchaseId) && currentRole() === Roles.public) {
      data.lastPurchaseId = lastPurchaseId
    }
    return $http({
      method: 'POST',
      url: oktaApiUrl('login'),
      data: data,
      withCredentials: true
    })
  }


  function signOut (redirectHome = true) {
    return Observable.from(internalSignOut(redirectHome))
  }

  async function internalSignOut (redirectHome = true) {
    try {
      await $http({
        method: 'DELETE',
        url: oktaApiUrl('logout'),
        withCredentials: true
      })
      await clearCheckoutSavedData()
      await authClient.revokeAccessToken()
      await authClient.revokeRefreshToken()
      await authClient.closeSession()
      // Add session data so on return to page we can show an explaination to the user about what happened.
      if (!redirectHome) {
        $window.sessionStorage.setItem('forcedUserToLogout', true)
      }
      return authClient.signOut({
        postLogoutRedirectUri: redirectHome ? null : $window.location.href
      })
    } catch {
      // closeSession errors out due to CORS. to fix this temporarily, I've added the logout in a catch just in case.
      if (!redirectHome) {
        $window.sessionStorage.setItem('forcedUserToLogout', true)
      }
      return authClient.signOut({
        postLogoutRedirectUri: redirectHome ? null : $window.location.href
      }).catch(() => {
        $window.location = `https://signon.okta.com/login/signout?fromURI=${envService.read('oktaReferrer')}`
      })
    }
  }

  function signOutWithoutRedirectToOkta () {
    const observable = Observable
      .from($http({
        method: 'DELETE',
        url: oktaApiUrl('logout'),
        withCredentials: true
      }))
      .map((response) => response.data)
    clearCheckoutSavedData()
    authClient.revokeAccessToken()
    authClient.revokeRefreshToken()
    authClient.closeSession()
    return observable.finally(() => {
      $rootScope.$broadcast(SignOutEvent)
    })
  }

  function removeForcedUserToLogoutSessionData () {
    // Allow for 2 seconds, so component can show error to user.
    setTimeout(() => {
      $window.sessionStorage.removeItem('forcedUserToLogout')
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
    authClient.closeSession()
    return skipEvent
      ? observable
      : observable.finally(() => {
        $rootScope.$broadcast(SignOutEvent)
      })
  }

  function getOktaUrl () {
    return envService.read('oktaUrl')
  }

  function removeOktaRedirectIndicator () {
    $window.sessionStorage.removeItem(redirectingIndicator)
  }

  function isOktaRedirecting () {
    return $window.sessionStorage.getItem(redirectingIndicator)
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
  function setOktaRedirecting () {
    $window.sessionStorage.setItem(redirectingIndicator, 'true')
  }

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
}

export default angular
  .module(serviceName, [
    'ngCookies',
    appConfig.name
  ])
  .factory(serviceName, session)

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

export const OktaStorage = {
  state: 'okta-oauth-state',
  nonce: 'okta-oauth-nonce',
  redirectParams: 'okta-oauth-redirect-params'
}

export const SignInEvent = 'SessionSignedIn'
export const SignOutEvent = 'SessionSignedOut'

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
    signUp: signUp,
    handleOktaRedirect: handleOktaRedirect,
    oktaSignIn: oktaSignIn,
    oktaSignOut: oktaSignOut,
    forgotPassword: forgotPassword,
    resetPassword: resetPassword,
    downgradeToGuest: downgradeToGuest
  }

  /* Public Methods */
  function signIn (username, password, mfa_token, trust_device, lastPurchaseId) {
    const data = {
      username: username,
      password: password
    }
    if (angular.isDefined(mfa_token)) { data.mfa_token = mfa_token }
    if (trust_device) { data.trust_device = '1' }
    // Only send lastPurchaseId if present and currently public
    if (angular.isDefined(lastPurchaseId) && currentRole() === Roles.public) { data.lastPurchaseId = lastPurchaseId }
    return Observable
      .from($http({
        method: 'POST',
        url: casApiUrl('/login'),
        data: data,
        withCredentials: true
      }))
      .map((response) => response.data)
      .finally(() => {
        $rootScope.$broadcast(SignInEvent)
      })
  }

  function signOut () {
    // https://github.com/CruGlobal/cortex_gateway/wiki/Logout
    return Observable
      .from($http({
        method: 'DELETE',
        url: casApiUrl('/logout'),
        withCredentials: true
      })
      )
  }

  function signUp (email, password, first_name, last_name) {
    // https://github.com/CruGlobal/cortex_gateway/wiki/Create-User
    return Observable
      .from($http({
        method: 'POST',
        url: casApiUrl('/register'),
        withCredentials: true,
        data: {
          email: email,
          password: password,
          firstName: first_name,
          lastName: last_name
        }
      }))
      .map((response) => response.data)
  }

  function forgotPassword (email, passwordResetUrl) {
    // https://github.com/CruGlobal/cortex_gateway/wiki/Send-Forgot-Password-Email
    return Observable
      .from($http({
        method: 'POST',
        url: casApiUrl('/send_forgot_password_email'),
        withCredentials: true,
        data: {
          email: email,
          passwordResetUrl: passwordResetUrl
        }
      }))
      .map((response) => response.data)
  }

  function resetPassword (email, password, resetKey) {
    // https://github.com/CruGlobal/cortex_gateway/wiki/Set-Password-By-Reset-Key
    return Observable
      .from($http({
        method: 'POST',
        url: casApiUrl('/reset_password'),
        withCredentials: true,
        data: {
          email: email,
          password: password,
          resetKey: resetKey
        }
      }))
      .mergeMap(() => signIn(email, password))
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

  function oktaSignOut () {
    return Observable.from(internalSignOut())
  }

  function internalSignOut () {
    clearStorageForOktaLogout()
    return $http({
      method: 'DELETE',
      url: oktaApiUrl('logout'),
      withCredentials: true
    })
  }

  function downgradeToGuest (skipEvent = false) {
    const observable = currentRole() === Roles.public
      ? Observable.throw('must be IDENTIFIED')
      : Observable
        .from($http({
          method: 'POST',
          url: casApiUrl('/downgrade'),
          withCredentials: true,
          data: {}
        }))
        .map((response) => response.data)
    return skipEvent
      ? observable
      : observable.finally(() => {
        $rootScope.$broadcast(SignOutEvent)
      })
  }

  /* Private Methods */
  function clearStorageForOktaLogout () {
    $window.localStorage.clear()
    const cookieConfig = { path: '/' }
    $cookies.remove(OktaStorage.state, cookieConfig)
    $cookies.remove(OktaStorage.nonce, cookieConfig)
    $cookies.remove(OktaStorage.redirectParams, cookieConfig)
  }

  function updateCurrentSession () {
    const cortexRole = decodeCookie(Sessions.role)
    const cruProfile = decodeCookie(Sessions.profile)
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

  function casApiUrl (path) {
    const apiUrl = envService.read('apiUrl') + '/cas'
    return apiUrl + path
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

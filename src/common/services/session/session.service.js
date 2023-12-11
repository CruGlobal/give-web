import angular from 'angular'
import 'angular-cookies'
import jwtDecode from 'jwt-decode'
import moment from 'moment'
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
    createAccount: createAccount,
    handleOktaRedirect: handleOktaRedirect,
    oktaSignIn: oktaSignIn,
    oktaSignOut: oktaSignOut,
    downgradeToGuest: downgradeToGuest,
    getOktaUrl: getOktaUrl,
    removeOktaRedirectIndicator: removeOktaRedirectIndicator,
    isOktaRedirecting: isOktaRedirecting,
    updateCurrentProfile: updateCurrentProfile,
    oktaIsUserAuthenticated: oktaIsUserAuthenticated,
    updateCheckoutSavedData: updateCheckoutSavedData,
    clearCheckoutSavedData: clearCheckoutSavedData,
    checkCreateAccountStatus: checkCreateAccountStatus
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

  async function createAccount (email, firstName, lastName, isTest = false) {
    const isAuthenticated = await authClient.isAuthenticated()
    if (currentRole() !== Roles.public || isAuthenticated) {
      const email = isAuthenticated && (await authClient.getUser()).email
      return {
        status: 'error',
        data: [`Already logged in to Okta${email ? ` with email: ${email}` : ''}. You will be redirected to the Sign In page in a few seconds.`, 'Another Error'],
        redirectToSignIn: true
      }
    }

    const data = { }

    if (angular.isDefined(email)) data.email = email
    if (angular.isDefined(firstName)) data.first_name = firstName
    if (angular.isDefined(lastName)) data.last_name = lastName
    const dataAsString = JSON.stringify(data)
    try {
      const createAccount = await $http({
        method: 'POST',
        url: oktaApiUrl('create'),
        data: data,
        withCredentials: true
      })

      $cookies.put(
        createAccountDataCookieName,
        dataAsString,
        {
          path: '/',
          domain: isTest ? '' : cookieDomain,
          expires: moment().add(2, 'hours').toISOString()
        }
      )
      return {
        status: 'success',
        data: createAccount
      }
    } catch (err) {
      try {
        if (err.status === 401) {
          throw new Error(err.message)
        }
        const errors = err?.data?.error
          ? err.data.error.split(',')
              .filter((str) => str.includes(':errorSummary=>') && !str.includes('Api validation failed: login'))
              .map((str) => str.match(/"([^"]+)"/)[1].replace(/["]/g, ''))
          : err

        let checkIfAccountIsPending = false

        const formattedErrors = errors.map((error) => {
          switch (error) {
            case 'login: An object with this field already exists in the current organization':
              checkIfAccountIsPending = true
              return 'The email address you used belongs to an existing Okta user.'
            case 'email: Does not match required pattern':
              return 'There was an error saving your email address. Make sure it was entered correctly.'
            case 'Something went wrong. Please try again':
              return 'There was an error saving your contact info. Please try again or contact eGift@cru.org for assistance.'
            default:
              return error
          };
        })
        if (!checkIfAccountIsPending) {
          return {
            status: 'error',
            data: formattedErrors,
            accountPending: false
          }
        } else {
          const accountPending = await checkCreateAccountStatus(email)
          if (accountPending?.data?.status !== 'PROVISIONED') {
            return {
              status: 'error',
              data: formattedErrors,
              accountPending: false
            }
          } else {
            $cookies.put(
              createAccountDataCookieName,
              dataAsString,
              {
                path: '/',
                domain: isTest ? '' : cookieDomain,
                expires: moment().add(2, 'hours').toISOString()
              }
            )
            return {
              status: 'error',
              data: formattedErrors,
              accountPending: true
            }
          }
        }
      } catch {
        return {
          status: 'error',
          data: ['Something went wrong. Please try again']
        }
      }
    }
  }

  async function checkCreateAccountStatus (email) {
    const isAuthenticated = await authClient.isAuthenticated()
    if (currentRole() !== Roles.public || isAuthenticated) {
      return 'Already logged in.'
    }
    try {
      const createAccountStatus = await $http({
        method: 'GET',
        url: `${oktaApiUrl('status')}?email=${encodeURIComponent(email)}`,
        withCredentials: true
      })
      return {
        status: 'success',
        data: createAccountStatus.data
      }
    } catch (err) {
      try {
        if (err.status === 401) {
          throw new Error()
        }
        return {
          status: 'error',
          data: err?.data?.error ?? 'Something went wrong. Please try again'
        }
      } catch {
        return {
          status: 'error',
          data: ['Something went wrong. Please try again']
        }
      }
    }
  }

  function oktaIsUserAuthenticated () {
    return Observable.from(authClient.isAuthenticated())
  }

  function oktaSignOut () {
    return Observable.from(internalSignOut())
  }

  async function internalSignOut () {
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
      authClient.signOut()
      $window.location = '/cart.html'
    } catch {
      $window.location = `https://signon.okta.com/login/signout?fromURI=${envService.read('oktaReferrer')}`
    }
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

  function casApiUrl (path) {
    const apiUrl = envService.read('apiUrl') + '/cas'
    return apiUrl + path
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
        if (dataAsString) session.checkoutSavedData = JSON.parse(dataAsString)
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

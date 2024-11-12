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

export const locationOnLogin = 'locationOnLogin'
export const locationSearchOnLogin = 'locationSearchOnLogin'
export const checkoutSavedDataCookieName = 'checkoutSavedData'
export const createAccountDataCookieName = 'createAccountData'
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
  const authClient = new OktaAuth({
    issuer: envService.read('oktaUrl'),
    clientId: envService.read('oktaClientId'),
    redirectUri: `${window.location.origin}/sign-in.html`,
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
    catchCreateAccountErrors: catchCreateAccountErrors,
    clearCheckoutSavedData: clearCheckoutSavedData,
    checkCreateAccountStatus: checkCreateAccountStatus,
    createAccount: createAccount,
    downgradeToGuest: downgradeToGuest,
    getRole: currentRole,
    getOktaUrl: getOktaUrl,
    handleOktaRedirect: handleOktaRedirect,
    hasLocationOnLogin: hasLocationOnLogin,
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
      return Observable.from(authClient.token.parseFromUrl().then((tokenResponse) => {
        authClient.tokenManager.setTokens(tokenResponse.tokens)
        return signIn(lastPurchaseId)
      }))
    } else {
      return Observable.of(false)
    }
  }

  function signIn (lastPurchaseId) {
    session.isOktaRedirecting = true
    return Observable.from(internalSignIn(lastPurchaseId))
      .map((response) => response ? response.data : response)
      .finally(() => {
        $rootScope.$broadcast(SignInEvent)
      })
  }

  async function internalSignIn (lastPurchaseId) {
    const isAuthenticated = await authClient.isAuthenticated()
    if (!isAuthenticated) {
      setRedirectingOnLogin()
      return authClient.token.getWithRedirect()
    }
    const tokens = await authClient.tokenManager.getTokens()
    const data = { access_token: tokens.accessToken.accessToken }
    // Only send lastPurchaseId if present and currently public
    if (angular.isDefined(lastPurchaseId) && currentRole() === Roles.public) {
      data.lastPurchaseId = lastPurchaseId
    }
    // Add marketing search queries back to URL once returned from Okta
    const locationSearch = $window.sessionStorage.getItem(locationSearchOnLogin) || ''
    if (locationSearch) {
      // eslint-disable-next-line
      const searchQueries = locationSearch.split(/\?|\&/)
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
  }

  async function createAccount (email, firstName, lastName, isTest = false) {
    const isAuthenticated = await authClient.isAuthenticated()
    if (currentRole() !== Roles.public || isAuthenticated) {
      const email = isAuthenticated && (await authClient.getUser()).email
      return {
        status: 'error',
        data: [`Already logged in to Okta${email ? ` with email: ${email}` : ''}. You will be redirected to the Sign In page in a few seconds.`],
        redirectToSignIn: true
      }
    }

    const data = { }

    if (angular.isDefined(email)) {
      data.email = email
    }
    if (angular.isDefined(firstName)) {
      data.first_name = firstName
    }
    if (angular.isDefined(lastName)) {
      data.last_name = lastName
    }
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
    } catch (error) {
      return await catchCreateAccountErrors(error, dataAsString, email, isTest)
    }
  }

  async function catchCreateAccountErrors (errorObject, dataAsString, email, isTest) {
    try {
      if (errorObject.status === 401) {
        throw new Error(errorObject.message)
      }
      const errors = errorObject?.data?.error
        ? errorObject.data.error.split(',')
            .filter((str) => str.includes(':errorSummary=>') && !str.includes('Api validation failed: login'))
            .map((str) => str.match(/"([^"]+)"/)[1].replace(/["]/g, ''))
        : errorObject

      let checkIfAccountIsPending = false

      const formattedErrors = errors.map((error) => {
        switch (error) {
          case 'login: An object with this field already exists in the current organization':
            checkIfAccountIsPending = true
            return 'OKTA_EMAIL_ALREADY_EXISTS'
          case 'email: Does not match required pattern':
            return 'OKTA_ERROR_WHILE_SAVING_EMAIL'
          case 'Something went wrong. Please try again':
            return 'OKTA_ERROR_WHILE_SAVING_DATA'
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
        data: ['SOMETHING_WENT_WRONG']
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
          data: err?.data?.error ?? 'SOMETHING_WENT_WRONG'
        }
      } catch {
        return {
          status: 'error',
          data: ['SOMETHING_WENT_WRONG']
        }
      }
    }
  }

  function oktaIsUserAuthenticated () {
    return Observable.from(authClient.isAuthenticated())
  }

  function signOut (redirectHome = true) {
    return Observable.from(internalSignOut(redirectHome))
  }

  async function internalSignOut (redirectHome = true) {
    const oktaSignOut = async () => {
      // Add session data so on return to page we can show an explanation to the user about what happened.
      if (!redirectHome) {
        $window.sessionStorage.setItem(forcedUserToLogout, true)
        // Save location we need to redirect the user back to
        $window.sessionStorage.setItem(locationOnLogin, $window.location.href)
      }
      return await authClient.signOut({
        postLogoutRedirectUri: redirectHome ? null : `${envService.read('oktaReferrer')}/sign-out.html`
      })
    }

    try {
      await $http({
        method: 'DELETE',
        url: oktaApiUrl('logout'),
        withCredentials: true
      })
      await clearCheckoutSavedData()
      // Use revokeAccessToken, revokeRefreshToken to ensure authClient is cleared before logging out entirely.
      await authClient.revokeAccessToken()
      await authClient.revokeRefreshToken()

      return await oktaSignOut()
    } catch {
      try {
        return await oktaSignOut()
      } catch {
        $window.location.href = `${envService.read('oktaUrl')}/login/signout?fromURI=${envService.read('oktaReferrer')}`
      }
    }
  }

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
  function hasLocationOnLogin () {
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

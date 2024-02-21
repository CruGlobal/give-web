import angular from 'angular'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { concatMap } from 'rxjs/operators/concatMap'
import { Observable } from 'rxjs/Observable'
import sessionService, { LoginOktaOnlyEvent, Roles } from 'common/services/session/session.service'
import sessionEnforcerService, {
  EnforcerCallbacks,
  EnforcerModes
} from 'common/services/session/sessionEnforcer.service'

const serviceName = 'sessionHandleOktaRedirectService'

const sessionHandleOktaRedirectService = /* @ngInject */ function ($rootScope, $log, sessionService, sessionEnforcerService) {
  const errorMessage = ''
  const errorMessageSubject = new BehaviorSubject(errorMessage)
  return {
    errorMessage: errorMessage,
    errorMessageSubject: errorMessageSubject,
    onHandleOktaRedirect: onHandleOktaRedirect
  }

  function onHandleOktaRedirect() {
    sessionService.handleOktaRedirect().pipe(
      concatMap(data => {
        return data.subscribe ? data : Observable.of(data)
      })
    ).subscribe((data) => {
      if (data) {
        sessionEnforcerService([Roles.registered], {
          [EnforcerCallbacks.change]: (role, registrationState) => {
            if (role === Roles.registered && registrationState === 'NEW') {
              sessionService.updateCurrentProfile()
              $rootScope.$broadcast(LoginOktaOnlyEvent, 'register-account')
            }
          }
        }, EnforcerModes.donor)
        sessionService.removeOktaRedirectIndicator()
      }
    },
    error => {
      errorMessageSubject.next('generic')
      $log.error('Failed to redirect from Okta', error)
      sessionService.removeOktaRedirectIndicator()
    })
  }
}

export default angular
  .module(serviceName, [
    sessionService.name,
    sessionEnforcerService.name
  ])
  .factory(serviceName, sessionHandleOktaRedirectService)

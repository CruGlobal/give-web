import angular from 'angular'
import includes from 'lodash/includes'
import filter from 'lodash/filter'
import find from 'lodash/find'
import pick from 'lodash/pick'
import values from 'lodash/values'
import orderService from 'common/services/api/order.service'
import sessionService, { Roles } from 'common/services/session/session.service'
import sessionModalService from 'common/services/session/sessionModal.service'

const serviceName = 'sessionEnforcerService'

export const EnforcerCallbacks = {
  signIn: 'sign-in',
  cancel: 'cancel',
  change: 'change'
}

export const EnforcerModes = {
  session: 'session',
  donor: 'donor'
}

const SessionEnforcerService = /* @ngInject */ function (orderService, sessionService, sessionModalService) {
  const enforcers = {}; let modal

  /**
   * Enforces Session and or Donor account
   *
   * @param {string[]} roles
   * @param {Object} callbacks
   * @param {string} [mode='session']
   * @param {boolean} [callbackOnInit=true]
   * @returns {*}
   */
  function enforceRoles (roles, callbacks, mode, callbackOnInit) {
    // roles is required
    if (!angular.isArray(roles)) return false
    // Default mode is 'session'
    mode = (angular.isUndefined(mode) || !includes(values(EnforcerModes), mode)) ? EnforcerModes.session : mode
    // Donor mode requires roles to be ['REGISTERED'] only.
    if (mode === EnforcerModes.donor) roles = [Roles.registered]
    callbacks = angular.isDefined(callbacks) ? callbacks : {}
    const id = Date.now().toString()
    // Build enforcer object
    enforcers[id] = angular.merge({}, {
      id: id,
      roles: roles,
      mode: mode
    }, pick(callbacks, values(EnforcerCallbacks)))

    // initialize the enforcer
    initializeEnforcer(enforcers[id], angular.isUndefined(callbackOnInit) ? true : !!callbackOnInit)

    // Return id, used to cancel enforcer
    return id
  }

  /**
   * Cancels an existing enforcer by id
   *
   * @param {int} id
   * @returns {boolean}
   */
  enforceRoles.cancel = function (id) {
    if (id in enforcers) {
      delete enforcers[id]
      return true
    }
    return false
  }

  // Watch for changes to session, fetch donorDetails
  sessionService.sessionSubject.subscribe(() => {
    // only fetch donor details if there is at least one donor mode enforcer
    if (find(enforcers, { mode: EnforcerModes.donor })) {
      orderService.getDonorDetails().subscribe((donorDetails) => {
        sessionChanged(donorDetails)
      }, () => {
        sessionChanged()
      })
    } else {
      sessionChanged()
    }
  })

  function sessionChanged (donorDetails) {
    donorDetails = angular.isDefined(donorDetails) ? donorDetails : { 'registration-state': 'NEW' }
    const role = sessionService.getRole()
    const enforced = filter(enforcers, (enforcer) => {
      return (!includes(enforcer.roles, role)) || (enforcer.mode === EnforcerModes.donor && donorDetails['registration-state'] !== 'COMPLETED')
    })
    if (enforced.length) {
      angular.forEach(enforced, (enforcer) => {
        if (angular.isFunction(enforcer[EnforcerCallbacks.change])) {
          enforcer[EnforcerCallbacks.change](role, donorDetails['registration-state'])
        }
      })

      if (angular.isUndefined(modal)) {
        modal = sessionModalService.open('register-account', {
          backdrop: 'static',
          keyboard: false
        }).result

        modal && modal.then(() => {
          angular.forEach(enforced, (enforcer) => {
            if (angular.isFunction(enforcer[EnforcerCallbacks.signIn])) enforcer[EnforcerCallbacks.signIn]()
          })
        }, () => {
          angular.forEach(enforced, (enforcer) => {
            if (angular.isFunction(enforcer[EnforcerCallbacks.cancel])) enforcer[EnforcerCallbacks.cancel]()
          })
        })
        modal && modal.finally(() => {
          modal = undefined
        })
      }
    } else {
      angular.forEach(enforcers, (enforcer) => {
        if (includes(enforcer.roles, role)) {
          if (angular.isUndefined(modal)) {
            if (sessionModalService.currentModal()) {
              sessionModalService.currentModal().dismiss()
            }
          } else {
            if (angular.isFunction(enforcer[EnforcerCallbacks.signIn])) {
              enforcer[EnforcerCallbacks.signIn]()
              if (sessionModalService.currentModal()) {
                sessionModalService.currentModal().close()
              }
            }
            modal = undefined
          }
        }
      })
    }
  }

  function initializeEnforcer (enforcer, callbackOnInit) {
    // If current session role is included in enforced roles, call signIn callback
    if (callbackOnInit && includes(enforcer.roles, sessionService.getRole())) {
      // Donor mode is a special case, we need to also check donorDetails for a registration-state
      if (enforcer.mode === EnforcerModes.donor) {
        orderService.getDonorDetails().subscribe((donorDetails) => {
          if (angular.isDefined(donorDetails['registration-state']) && donorDetails['registration-state'] === 'COMPLETED') {
            // User is REGISTERED and COMPLETED, Call signIn callback if present
            if (angular.isFunction(enforcer[EnforcerCallbacks.signIn])) enforcer[EnforcerCallbacks.signIn]()
          } else {
            // User is REGISTERED but not COMPLETED
            // Enforce current role
            sessionChanged(donorDetails)
          }
        }, () => {
          // getDonorDetails failed, assume registration-state is NEW and enforce the current role.
          sessionChanged()
        })
      } else {
        // Not donor mode, call signIn callback if present
        if (angular.isFunction(enforcer[EnforcerCallbacks.signIn])) enforcer[EnforcerCallbacks.signIn]()
      }
    } else {
      // Enforce current role on the new enforcer
      sessionChanged()
    }
  }

  return enforceRoles
}

export default angular
  .module(serviceName, [
    orderService.name,
    sessionService.name,
    sessionModalService.name
  ])
  .factory(serviceName, SessionEnforcerService)

import angular from 'angular';
import orderService from 'common/services/api/order.service';
import sessionModalService from 'common/services/session/sessionModal.service';
import sessionService from 'common/services/session/session.service';

import {Roles} from 'common/services/session/session.service';

let serviceName = 'registerAccountService';

/*@ngInject*/
function RegisterAccountService( $q, orderService, sessionService, sessionModalService ) {

// angular.element(document.querySelector('body')).injector().get('registerAccountService')().then(function() {console.log('success');}, function() {console.log('failure')});
  function registerAccount() {
    // Register Account Modal is a multi-step process.
    // 1. Sign In/Up
    // 2. Get Contact Info
    // 3. User Match
    let registeredDeferred = $q.defer(),
      sessionDeferred = $q.defer(),
      donorDetailsDeferred = $q.defer();

    // Resolved when a session is established
    sessionDeferred.promise.then( () => {
      // Check donordetails, it's possible we are already registered
      orderService.getDonorDetails().subscribe( ( donorDetails ) => {
        if ( donorDetails['registration-state'] === 'COMPLETED' ) {
          // Registration is complete, resolve the workflow
          registeredDeferred.resolve();
        }
        else {
          // Proceed to 'register-account' modal by resolving the donorDetails
          donorDetailsDeferred.resolve();
        }
      }, () => {
        // Failed to get donorDetails, proceed to 'register-account'
        donorDetailsDeferred.resolve();
      } );
    } );

    // Resolved when donorDetails is not COMPLETED
    donorDetailsDeferred.promise.then( () => {
      // 2. Get Contact Info
      sessionModalService.open( 'register-account', {size: '', backdrop: 'static'} ).result.then( () => {
        // TODO: after contact info, we may need to POST donormatches form
        // 3. User Match
        sessionModalService.open( 'user-match', {backdrop: 'static'} ).result.then( () => {
          registeredDeferred.resolve();
        }, () => {
          registeredDeferred.reject();
        } );
      }, () => {
        registeredDeferred.reject();
      } );
    } );

    // Sign-In/Up unless we already are
    // 1. Sign In/Up
    if ( sessionService.getRole() !== Roles.registered ) {
      sessionModalService.open( 'sign-in', {backdrop: 'static'} ).result.then( () => {
        // Sign In/Up success - resolve the session
        sessionDeferred.resolve();
      }, () => {
        // Sign-In/Up Cancelled/Failed - reject registerAccount
        registeredDeferred.reject();
      } );
    }
    else {
      // Already Signed In - resolve the session
      sessionDeferred.resolve();
    }

    // Resolved when entire register flow is completed, rejected otherwise.
    return registeredDeferred.promise;
  }

  return registerAccount;
}

export default angular
  .module( serviceName, [
    orderService.name,
    sessionModalService.name,
    sessionService.name
  ] )
  .service( serviceName, RegisterAccountService );

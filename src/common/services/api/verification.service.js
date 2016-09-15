import angular from 'angular';
import 'rxjs/add/operator/pluck';

import cortexApiService from '../cortexApi.service';

let serviceName = 'verificationService';

/*@ngInject*/
function VerificationService( cortexApiService ) {
  function getContacts() {
    return cortexApiService
      .get( {
        path: ['verificationcontacts', cortexApiService.scope],
        zoom: {
          contacts: 'element[]'
        }
      } );
  }

  function selectContact( contact ) {
    return cortexApiService
      .post( {
        path: contact.links[0].uri,
        data: contact
      } );
  }

  function getQuestions() {
    return cortexApiService
      .get( {
        path: ['verifyregistrations', cortexApiService.scope, 'form']
      } )
      .pluck( 'verification-questions' )
  }

  function thatIsNotMe() {
    return cortexApiService
      .post( {
        path: ['verifyregistrations', cortexApiService.scope],
        data: {'that-is-not-me': 'true'},
      } );
  }

  function submitAnswers( answers ) {
    return cortexApiService
      .post( {
        path:           ['verifyregistrations', cortexApiService.scope],
        data:           {'verification-answers': answers},
        followLocation: true
      } );
  }

  return {
    getContacts:   getContacts,
    selectContact: selectContact,
    getQuestions:  getQuestions,
    submitAnswers: submitAnswers,
    thatIsNotMe: thatIsNotMe
  };
}

export default angular
  .module( serviceName, [
    cortexApiService.name
  ] )
  .factory( serviceName, VerificationService );

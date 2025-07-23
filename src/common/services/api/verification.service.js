import angular from 'angular';
import 'rxjs/add/operator/pluck';

import cortexApiService from '../cortexApi.service';

const serviceName = 'verificationService';

const VerificationService = /* @ngInject */ function (cortexApiService) {
  function getContacts() {
    return cortexApiService
      .get({
        path: ['verificationcontacts', cortexApiService.scope],
      })
      .pluck('verification-contacts');
  }

  function selectContact(contact) {
    return cortexApiService.post({
      path: ['verificationcontacts', cortexApiService.scope, 'form'],
      data: contact,
    });
  }

  function getQuestions() {
    return cortexApiService
      .get({
        path: ['verifyregistrations', cortexApiService.scope, 'form'],
      })
      .pluck('verification-questions');
  }

  function thatIsNotMe() {
    return cortexApiService.post({
      path: ['verifyregistrations', cortexApiService.scope, 'form'],
      data: { 'that-is-not-me': 'true' },
      followLocation: true,
    });
  }

  function submitAnswers(answers) {
    return cortexApiService.post({
      path: ['verifyregistrations', cortexApiService.scope, 'form'],
      data: { 'verification-questions': answers, 'that-is-not-me': 'false' },
      followLocation: true,
    });
  }

  function postDonorMatches() {
    return cortexApiService.post({
      path: ['donormatches', cortexApiService.scope, 'form'],
      data: {},
    });
  }

  return {
    getContacts: getContacts,
    selectContact: selectContact,
    getQuestions: getQuestions,
    submitAnswers: submitAnswers,
    thatIsNotMe: thatIsNotMe,
    postDonorMatches: postDonorMatches,
  };
};

export default angular
  .module(serviceName, [cortexApiService.name])
  .factory(serviceName, VerificationService);

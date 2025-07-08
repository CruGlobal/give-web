import angular from 'angular';
import sessionService from 'common/services/session/session.service';

export default angular.module('analytics', [
  'environment',
  sessionService.name,
]);

import sessionService from 'common/services/session/session.service';

export default angular
    .module('analytics', [
      sessionService.name
    ]);

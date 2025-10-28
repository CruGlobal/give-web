import angular from 'angular';
import 'rxjs/add/operator/pluck';

import cortexApiService from '../cortexApi.service';

const serviceName = 'commonService';

class Common {
  /* @ngInject */
  constructor(cortexApiService) {
    this.cortexApiService = cortexApiService;
  }

  getNextDrawDate() {
    return this.cortexApiService
      .get({
        path: ['nextdrawdate'],
        cache: true,
      })
      .pluck('next-draw-date', 'string');
  }
}

export default angular
  .module(serviceName, [cortexApiService.name])
  .service(serviceName, Common);

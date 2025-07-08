import angular from 'angular';

import cortexApiService from '../cortexApi.service';

const serviceName = 'tsysService';

class Tsys {
  /* @ngInject */
  constructor(cortexApiService) {
    this.cortexApiService = cortexApiService;
    this.device = '';
  }

  setDevice(device) {
    this.device = device;
  }

  getDevice() {
    return this.device;
  }

  getManifest() {
    return this.cortexApiService.get({
      path: this.device
        ? ['tsys', 'manifest', this.device]
        : ['tsys', 'manifest'],
    });
  }
}

export default angular
  .module(serviceName, [cortexApiService.name])
  .service(serviceName, Tsys);

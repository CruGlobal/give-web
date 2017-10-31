import angular from 'angular';

import cortexApiService from '../cortexApi.service';


let serviceName = 'tsysService';

class Tsys{

  /*@ngInject*/
  constructor(cortexApiService){
    this.cortexApiService = cortexApiService;
    this.environment = '';
  }

  setEnvironment(environment){
    this.environment = environment === 'default' ? '' : environment;
  }

  getManifest(){
    return this.cortexApiService.get({
      path: this.environment ? ['tsys', 'manifest', this.environment] : ['tsys', 'manifest']
    });
  }

}

export default angular
  .module(serviceName, [
    cortexApiService.name
  ])
  .service(serviceName, Tsys);

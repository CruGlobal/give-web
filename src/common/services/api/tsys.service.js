import angular from 'angular';

import cortexApiService from '../cortexApi.service';


let serviceName = 'tsysService';

class Tsys{

  /*@ngInject*/
  constructor(cortexApiService){
    this.cortexApiService = cortexApiService;
  }

  getManifest(){
    return this.cortexApiService.get({
      path: ['tsys', 'manifest']
    });
  }

}

export default angular
  .module(serviceName, [
    cortexApiService.name
  ])
  .service(serviceName, Tsys);

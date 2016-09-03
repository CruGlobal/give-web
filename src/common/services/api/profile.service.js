import angular from 'angular';

import cortexApiService from '../cortexApi.service';

let serviceName = 'profileService';

class Profile{

  /*@ngInject*/
  constructor(cortexApiService){
    this.cortexApiService = cortexApiService;
  }

  getEmail(){
    return this.cortexApiService.get({
        path: ['profiles', this.cortexApiService.scope, 'default'],
        zoom: {
          email: 'emails:element'
        }
      });
  }
}

export default angular
  .module(serviceName, [
    cortexApiService.name
  ])
  .service(serviceName, Profile);

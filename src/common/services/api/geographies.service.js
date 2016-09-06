import angular from 'angular';
import 'rxjs/add/operator/map';

import cortexApiService from '../cortexApi.service';
import hateoasHelperService from 'common/services/hateoasHelper.service';

let serviceName = 'geographiesService';

class Geographies {

  /*@ngInject*/
  constructor(cortexApiService, hateoasHelperService){
    this.cortexApiService = cortexApiService;
    this.hateoasHelperService = hateoasHelperService;
  }


  getCountries(){
    return this.cortexApiService.get({
        path: ['geographies', this.cortexApiService.scope, 'countries'],
        zoom: {
          countries: 'element[]'
        },
        cache: true
      })
      .map((data) => {
        return data.countries;
      });
  }

  getRegions(country){
    return this.cortexApiService.get({
        path: this.hateoasHelperService.getLink(country, 'regions'),
        zoom: {
          regions: 'element[]'
        },
        cache: true
      })
      .map((data) => {
        return data.regions;
      });
  }
}

export default angular
  .module(serviceName, [
    cortexApiService.name,
    hateoasHelperService.name
  ])
  .service(serviceName, Geographies);

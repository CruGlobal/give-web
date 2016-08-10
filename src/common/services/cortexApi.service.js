import angular from 'angular';
import 'angular-environment';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import isArray from 'lodash/isArray';

import { cortexScope } from 'common/app.constants';
import appConfig from 'common/app.config';
import hateoasHelperService from 'common/services/hateoasHelper.service';

let serviceName = 'cortexApiService';

class CortexApi {

  /*@ngInject*/
  constructor($http, envService, hateoasHelperService){
    this.$http = $http;
    this.envService = envService;
    this.hateoasHelperService = hateoasHelperService;
    this.scope = cortexScope;
  }

  http(config){
    config.params = config.params || {};
    if(config.zoom){
      config.params.zoom = this.hateoasHelperService.serializeZoom(config.zoom);
    }
    if(config.followLocation){
      config.params.followLocation = true;
    }

    return Observable.from(this.$http({
        method: config.method,
        url: this.envService.read('apiUrl') + '/cortex' + this.serializePath(config.path),
        params: config.params,
        data: config.data,
        withCredentials: true
      }))
      .map((response) => {
        if(config.zoom){
          return this.hateoasHelperService.mapZoomElements(response.data, config.zoom);
        }
        return response.data;
      });
  }

  get(request){
    request.method = 'GET';
    return this.http(request);
  }

  post(request){
    request.method = 'POST';
    return this.http(request);
  }

  put(request){
    request.method = 'PUT';
    return this.http(request);
  }

  delete(request){
    request.method = 'DELETE';
    return this.http(request);
  }

  serializePath(path){
    if(isArray(path)){
      return '/' + path.join('/');
    }else{
      return path.charAt(0) === '/' ? path : '/' + path;
    }
  }
}

export default angular
  .module(serviceName, [
    'environment',
    appConfig.name,
    hateoasHelperService.name
  ])
  .service(serviceName, CortexApi);

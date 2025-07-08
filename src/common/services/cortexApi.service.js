import angular from 'angular';
import 'angular-environment';
import isEmpty from 'lodash/isEmpty';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

import { cortexScope } from 'common/app.constants';
import appConfig from 'common/app.config';
import hateoasHelperService from 'common/services/hateoasHelper.service';

const serviceName = 'cortexApiService';

class CortexApi {
  /* @ngInject */
  constructor($http, $log, envService, hateoasHelperService) {
    this.$http = $http;
    this.$log = $log;
    this.envService = envService;
    this.hateoasHelperService = hateoasHelperService;
    this.scope = cortexScope;
  }

  http(config) {
    if (isEmpty(config.path)) {
      const errorMessage =
        'The requested path is empty. cortexApiService is unable to send the request.';
      this.$log.error(errorMessage);
      return Observable.throw(errorMessage);
    }

    config.params = config.params || {};
    if (config.zoom) {
      config.params.zoom = this.hateoasHelperService.serializeZoom(config.zoom);
    }
    if (config.followLocation) {
      config.params.FollowLocation = true;
    }
    if (!config.cache && this.envService.read('isBrandedCheckout')) {
      config.params.nocache = new Date().getTime();
    }

    return Observable.from(
      this.$http({
        method: config.method,
        url:
          this.envService.read('apiUrl') +
          '/cortex' +
          this.serializePath(config.path),
        params: config.params,
        data: config.data,
        cache: config.cache,
        withCredentials: true,
      }),
    ).map((response) => {
      if (config.zoom) {
        return this.hateoasHelperService.mapZoomElements(
          response.data,
          config.zoom,
        );
      }
      return response.data;
    });
  }

  get(request) {
    request.method = 'GET';
    return this.http(request);
  }

  post(request) {
    request.method = 'POST';
    return this.http(request);
  }

  put(request) {
    request.method = 'PUT';
    return this.http(request);
  }

  delete(request) {
    request.method = 'DELETE';
    return this.http(request);
  }

  serializePath(path) {
    if (angular.isArray(path)) {
      path = path.join('/');
    }
    return path.charAt(0) === '/' ? path : '/' + path;
  }
}

export default angular
  .module(serviceName, [
    'environment',
    appConfig.name,
    hateoasHelperService.name,
  ])
  .service(serviceName, CortexApi);

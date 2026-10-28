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

    // Branded checkout signout on load expires every session cookie, so the
    // requests that follow can each reach the gateway cookie-less and create
    // their own session. When a second session wins the browser's cookie jar
    // mid-request, cortex answers 403 for the resource the losing session
    // resolved. Retrying picks up the surviving session.
    const request = this.send(config).catch((response) => {
      // Only repeat reads: a 403 on a write may have already applied server side.
      if (config.method === 'GET' && response?.status === 403) {
        return this.send(config);
      }

      throw response;
    });

    return Observable.from(request).map((response) => {
      if (config.zoom) {
        return this.hateoasHelperService.mapZoomElements(
          response.data,
          config.zoom,
        );
      }
      return response.data;
    });
  }

  send(config) {
    if (!config.cache && this.envService.read('isBrandedCheckout')) {
      config.params.nocache = new Date().getTime();
    }

    return this.$http({
      method: config.method,
      url:
        this.envService.read('apiUrl') +
        '/cortex' +
        this.serializePath(config.path),
      params: config.params,
      data: config.data,
      cache: config.cache,
      withCredentials: true,
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

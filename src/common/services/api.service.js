import angular from 'angular';
import 'angular-environment';
import { cortexScope } from 'common/app.constants';
import isArray from 'lodash/isArray';

let serviceName = 'apiService';

/*@ngInject*/
function api(envService, $http){
  return {
    http: http,
    get: get,
    post: post,
    put: put,
    delete: del,
    scope: cortexScope
  };

  function http(config){
    return $http({
      method: config.method,
      url: envService.read('apiUrl') + serializePath(config.path),
      params: config.params,
      data: config.data,
      withCredentials: true,
      headers: {
        Authorization: 'bearer a666d489-9436-4182-afb6-513633d55c96'
      }
    });
  }

  function get(request){
    return http({
      method: 'GET',
      path: request.path,
      params: request.params
    });
  }

  function post(request){
    return http({
      method: 'POST',
      path: request.path,
      params: request.params,
      data: request.data
    });
  }

  function put(request){
    return http({
      method: 'PUT',
      path: request.path,
      data: request.data
    });
  }

  function del(request){
    return http({
      method: 'DELETE',
      path: request.path,
      params: request.params
    });
  }

  function serializePath(path){
    if(isArray(path)){
      return '/' + path.join('/');
    }else{
      return path.charAt(0) === '/' ? path : '/' + path;
    }
  }
}

/*@ngInject*/
function EnvConfig(envServiceProvider){
  envServiceProvider.config({
    domains: {
      development: ['localhost'],
      production: ['give.cru.org']
    },
    vars: {
      development: {
        apiUrl: 'https://cortex-gateway-stage.cru.org/cortex'
      },
      production: {
        apiUrl: 'https://cortex-gateway.cru.org/cortex'
      }
    }
  });

  // run the environment check, so the comprobation is made
  // before controllers and services are built
  envServiceProvider.check();
}

export default angular
  .module(serviceName, [
    'environment'
  ])
  .config(EnvConfig)
  .factory(serviceName, api);

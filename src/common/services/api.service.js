import angular from 'angular';
import 'angular-environment';

let serviceName = 'api';

/*@ngInject*/
function api(envService, $http){
  return {
    http: http,
    get: get,
    post: post
  };

  function http(config){
    return $http({
        method: config.method,
        url: envService.read('apiUrl') + config.path,
        params: config.params,
        data: config.data,
        withCredentials: true
      });
  }

  function get(path, params){
    return http({
      method: 'GET',
      path: path,
      params: params
    });
  }

  function post(path, data){
    return http({
      method: 'POST',
      path: path,
      data: data
    });
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
        apiUrl: 'https://cortex-gateway-stage.cru.org/cortex/'
      },
      production: {
        apiUrl: 'https://cortex-gateway.cru.org/cortex/'
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

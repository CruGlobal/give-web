/* eslint angular/module-getter:0, angular/document-service:0 */
import 'babel/external-helpers';

import angular from 'angular';
import 'angular-environment';

/* @ngInject */
function appConfig(envServiceProvider, $compileProvider, $logProvider, $httpProvider) {
  $httpProvider.useApplyAsync(true);

  // eslint-disable-next-line angular/module-getter
  envServiceProvider.config({
    domains: {
      development: ['localhost'],
      staging: ['stage.give.cru.org'],
      production: ['give.cru.org']
    },
    vars: {
      development: {
        apiUrl: 'https://cortex-gateway-stage.cru.org'
      },
      staging: {
        apiUrl: 'https://cortex-gateway-stage.cru.org'
      },
      production: {
        apiUrl: 'https://cortex-gateway.cru.org'
      }
    }
  });

  // run the environment check, so the comprobation is made
  // before controllers and services are built
  envServiceProvider.check();

  if (envServiceProvider.is('production') || envServiceProvider.is('staging')) {
    $logProvider.debugEnabled(false);
    $compileProvider.debugInfoEnabled(false);
  } else {
    $logProvider.debugEnabled(true);
  }
}

export default angular.module('appConfig', [
    'environment'
])
  .config(appConfig);

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
      development: ['localhost', 'localhost.cru.org'],
      staging: ['stage.give.cru.org', 'devpub.cru.org', 'uatpub.cru.org', 'uat-give.aws.cru.org'],
      production: ['give.cru.org']
    },
    vars: {
      development: {
        apiUrl: 'https://cortex-gateway-stage.cru.org',
        imgDomain: '/src'
      },
      staging: {
        apiUrl: 'https://cortex-gateway-stage.cru.org',
        imgDomain: '//cru-givestage.s3.amazonaws.com'
      },
      production: {
        apiUrl: 'https://cortex-gateway.cru.org',
        imgDomain: '//cru-givestage.s3.amazonaws.com'
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

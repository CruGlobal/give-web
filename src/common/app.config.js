/* eslint angular/module-getter:0, angular/document-service:0 */
import 'babel/external-helpers';

import angular from 'angular';
import 'angular-environment';

import rollbarConfig from './rollbar.config';

/* @ngInject */
function appConfig(envServiceProvider, $compileProvider, $logProvider, $httpProvider, $locationProvider) {
  $httpProvider.useApplyAsync(true);

  // eslint-disable-next-line angular/module-getter
  envServiceProvider.config({
    domains: {
      development: ['localhost', 'localhost.cru.org'],
      staging: ['give-stage2.cru.org', 'devpub.cru.org', 'uatpub.cru.org', 'uat-give.aws.cru.org'],
      production: ['give.cru.org']
    },
    vars: {
      development: {
        apiUrl: 'https://cortex-gateway-stage.cru.org',
        imgDomain: '',
        imgDomainDesignation: 'https://give-stage2.cru.org',
        ccpKeyUrl: 'https://ccpstaging.ccci.org/api/v1/rest/client-encryption-keys/current'
      },
      staging: {
        apiUrl: 'https://cortex-gateway-stage.cru.org',
        imgDomain: '//cru-givestage.s3.amazonaws.com',
        imgDomainDesignation: '',
        ccpKeyUrl: 'https://ccpstaging.ccci.org/api/v1/rest/client-encryption-keys/current'
      },
      production: {
        apiUrl: 'https://cortex-gateway.cru.org',
        imgDomain: '//cru-givestage.s3.amazonaws.com',
        imgDomainDesignation: '',
        ccpKeyUrl: 'https://ccp.ccci.org/api/v1/rest/client-encryption-keys/current'
      }
    }
  });

  // run the environment check, so the comprobation is made
  // before controllers and services are built
  envServiceProvider.check();

  $locationProvider.html5Mode( {
    enabled: true,
    requireBase: false,
    rewriteLinks: false
  } );

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
  .config(appConfig)
  .config(rollbarConfig);

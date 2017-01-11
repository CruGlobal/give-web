/* eslint angular/module-getter:0, angular/document-service:0 */
import 'babel/external-helpers';

import angular from 'angular';
import 'angular-environment';

import rollbarConfig from './rollbar.config';

/* @ngInject */
function appConfig(envServiceProvider, $compileProvider, $logProvider, $httpProvider, $locationProvider, $qProvider) {
  $httpProvider.useApplyAsync(true);

  // eslint-disable-next-line angular/module-getter
  envServiceProvider.config({
    domains: {
      development: ['localhost', 'localhost.cru.org'],
      staging: ['give-stage2.cru.org', 'stage.cru.org', 'dev.aws.cru.org', 'devauth.aws.cru.org', 'devpub.aws.cru.org', 'uatauth.aws.cru.org', 'uatpub.aws.cru.org'],
      production: ['www.cru.org', 'give.cru.org', 'author.cru.org']
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
        imgDomain: '//give-static-stage.cru.org',
        imgDomainDesignation: '',
        ccpKeyUrl: 'https://ccpstaging.ccci.org/api/v1/rest/client-encryption-keys/current'
      },
      production: {
        apiUrl: 'https://give-cg.cru.org',
        imgDomain: '//give-static.cru.org',
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

  $qProvider.errorOnUnhandledRejections(false);
}

export default angular.module('appConfig', [
    'environment'
])
  .config(appConfig)
  .config(rollbarConfig);

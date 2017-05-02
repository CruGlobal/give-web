/* eslint angular/module-getter:0, angular/document-service:0 */

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
      staging: ['give-stage2.cru.org', 'stage.cru.org', 'dev.aws.cru.org', 'devauth.aws.cru.org', 'devpub.aws.cru.org', 'uatauth.aws.cru.org', 'uatpub.aws.cru.org', 'uatdisp.aws.cru.org'],
      production: []
    },
    vars: {
      development: {
        apiUrl: 'https://give-stage2.cru.org',
        imgDomain: '',
        imgDomainDesignation: 'https://give-stage2.cru.org',
        publicCru: 'https://stage.cru.org',
        publicGive: 'https://give-stage2.cru.org'
      },
      staging: {
        apiUrl: '',
        imgDomain: '//give-static-stage.cru.org',
        imgDomainDesignation: '',
        publicCru: 'https://stage.cru.org',
        publicGive: 'https://give-stage2.cru.org'
      },
      production: {
        apiUrl: 'https://give.cru.org',
        imgDomain: '//give-static.cru.org',
        imgDomainDesignation: '',
        publicCru: 'https://www.cru.org',
        publicGive: 'https://give.cru.org'
      }
    }
  });

  // default the environment to production
  envServiceProvider.set('production');

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

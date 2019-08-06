import angular from 'angular'
import 'angular-environment'

import rollbarConfig from './rollbar.config'

const appConfig = /* @ngInject */ function (envServiceProvider, $compileProvider, $logProvider, $httpProvider, $locationProvider, $qProvider) {
  $httpProvider.useApplyAsync(true)

  envServiceProvider.config({
    domains: {
      development: ['localhost', 'localhost.cru.org', 'cru-givedev.s3-website-us-east-1.amazonaws.com'],
      staging: ['give-stage2.cru.org', 'stage.cru.org', 'dev.aws.cru.org', 'devauth.aws.cru.org', 'devpub.aws.cru.org', 'uatauth.aws.cru.org', 'uatpub.aws.cru.org', 'uatdisp.aws.cru.org', 'cru-givestage.s3-website-us-east-1.amazonaws.com'],
      production: []
    },
    vars: {
      development: {
        apiUrl: 'https://give-stage2.cru.org',
        imgDomain: '',
        imgDomainDesignation: 'https://give-stage2.cru.org',
        publicCru: 'https://stage.cru.org',
        publicGive: 'https://give-stage2.cru.org',
        isBrandedCheckout: false
      },
      staging: {
        apiUrl: 'https://give-stage2.cru.org',
        imgDomain: '//give-static.cru.org',
        imgDomainDesignation: 'https://give-stage2.cru.org',
        publicCru: 'https://stage.cru.org',
        publicGive: 'https://give-stage2.cru.org',
        isBrandedCheckout: false
      },
      production: {
        apiUrl: 'https://give.cru.org',
        imgDomain: '//give-static.cru.org',
        imgDomainDesignation: 'https://give.cru.org',
        publicCru: 'https://www.cru.org',
        publicGive: 'https://give.cru.org',
        isBrandedCheckout: false
      }
    }
  })

  // default the environment to production
  envServiceProvider.set('production')

  // run the environment check, so the comprobation is made
  // before controllers and services are built
  envServiceProvider.check()

  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false,
    rewriteLinks: false
  })

  if (envServiceProvider.is('production') || envServiceProvider.is('staging')) {
    $logProvider.debugEnabled(false)
    $compileProvider.debugInfoEnabled(false)
  } else {
    $logProvider.debugEnabled(true)
  }

  $qProvider.errorOnUnhandledRejections(false)
}

export default angular.module('appConfig', [
  'environment'
])
  .config(appConfig)
  .config(rollbarConfig)

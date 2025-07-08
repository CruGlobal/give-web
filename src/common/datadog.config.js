import 'angular-environment';
import { datadogRum } from '@datadog/browser-rum';

const dataDogConfig = /* @ngInject */ function (envServiceProvider) {
  const clientToken = process.env.DATADOG_RUM_CLIENT_TOKEN;
  if (clientToken) {
    const config = {
      applicationId: '3937053e-386b-4b5b-ab4a-c83217d2f953',
      clientToken,
      site: 'datadoghq.com',
      service: 'give-web',
      env: envServiceProvider.get(),
      allowedTracingUrls: [envServiceProvider.read('apiUrl') + '/cortex'],
      version: process.env.GITHUB_SHA,
      sessionSampleRate: envServiceProvider.is('staging') ? 100 : 100,
      sessionReplaySampleRate: envServiceProvider.is('staging') ? 100 : 10,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'mask-user-input',
    };

    window.datadogRum = datadogRum;
    window.datadogRum && window.datadogRum.init(config);
  }
};
export { dataDogConfig as default };

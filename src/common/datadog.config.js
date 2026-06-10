import 'angular-environment';
import { datadogRum } from '@datadog/browser-rum';
import normalizeApiUrl from 'common/lib/normalizeApiUrl';

const dataDogConfig = /* @ngInject */ function (envServiceProvider) {
  const clientToken = process.env.DATADOG_RUM_CLIENT_TOKEN;
  if (clientToken) {
    // Branded checkout overrides the API url via the <branded-checkout api-url="..."> attribute,
    // but that override is applied in the component's $onInit, after DataDog has already
    // initialized, so resolve the attribute from the DOM here instead.
    const brandedCheckoutElement = document.querySelector('branded-checkout');
    const brandedCheckoutApiUrl =
      brandedCheckoutElement && brandedCheckoutElement.getAttribute('api-url');
    const apiUrl = brandedCheckoutApiUrl
      ? normalizeApiUrl(brandedCheckoutApiUrl)
      : envServiceProvider.read('apiUrl');
    // The api-url attribute may omit the protocol, so match request urls protocol-relatively
    const cortexUrl = apiUrl.replace(/^https?:/, '') + '/cortex';
    const config = {
      applicationId: '3937053e-386b-4b5b-ab4a-c83217d2f953',
      clientToken,
      site: 'datadoghq.com',
      service: 'give-web',
      env: envServiceProvider.get(),
      allowedTracingUrls: [
        (url) => url.replace(/^https?:/, '').startsWith(cortexUrl),
      ],
      version: process.env.GITHUB_SHA,
      sessionSampleRate: envServiceProvider.is('staging') ? 100 : 50,
      sessionReplaySampleRate: envServiceProvider.is('staging') ? 100 : 1,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'mask-user-input',
    };

    window.datadogRum = datadogRum;
    window.datadogRum && window.datadogRum.init(config);
  }
};

function updateDatadogUser(person) {
  if (person) {
    datadogRum.setUser(person);
  } else {
    datadogRum.clearUser();
  }
}

export { dataDogConfig as default, updateDatadogUser };

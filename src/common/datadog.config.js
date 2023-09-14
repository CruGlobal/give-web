import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
    applicationId: '3937053e-386b-4b5b-ab4a-c83217d2f953',
    clientToken: process.env.DATADOG_CLIENT_TOKEN,
    site: 'datadoghq.com',
    service:'give-web',
    env: process.env.NODE_ENV,
    version: process.env.GITHUB_SHA,
    sessionSampleRate: 10,
    sessionReplaySampleRate: 1,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel:'mask-user-input'
});
    
datadogRum.startSessionReplayRecording();

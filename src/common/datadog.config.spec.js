import angular from 'angular';
import 'angular-mocks';
import * as module from './datadog.config';
import { appConfig } from './app.config';

describe('dataDogConfig', () => {
  process.env.DATADOG_RUM_CLIENT_TOKEN = '1234';
  describe('configure Datadog RUM', () => {
    beforeEach(() => {
      // Added appConfig as needed the envServiceProvider vars
      angular
        .module('testAppAndDataDogConfig', [
          'environment',
          'pascalprecht.translate',
        ])
        .config(appConfig)
        .config(module.default);
      angular.mock.module('testAppAndDataDogConfig');
      inject(() => {});
    });

    it('should call init() and start session reply recording', () => {
      expect(window.datadogRum).not.toEqual(undefined);
      expect(window.datadogRum.init).toEqual(expect.any(Function));
    });
  });
});

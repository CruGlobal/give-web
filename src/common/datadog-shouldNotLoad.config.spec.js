import angular from 'angular';
import 'angular-mocks';
import { appConfig } from './app.config';
import * as module from './datadog.config';

describe('dataDogConfig', () => {
  describe('pipe $log to Rollbar', () => {
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

    describe('DATADOG_RUM_CLIENT_TOKEN not defined', () => {
      it('should make Window.datadogRum return undefined', () => {
        expect(window.datadogRum).toEqual(undefined);
      });
    });
  });
});

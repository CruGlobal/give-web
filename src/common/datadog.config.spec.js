import angular from 'angular';
import 'angular-mocks';
import { datadogRum } from '@datadog/browser-rum';
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

  describe('updateDatadogUser', () => {
    let setUserSpy, clearUserSpy;

    beforeEach(() => {
      setUserSpy = jest
        .spyOn(datadogRum, 'setUser')
        .mockImplementation(() => {});
      clearUserSpy = jest
        .spyOn(datadogRum, 'clearUser')
        .mockImplementation(() => {});
    });

    afterEach(() => {
      setUserSpy.mockRestore();
      clearUserSpy.mockRestore();
    });

    it('should call setUser with person data when person is provided', () => {
      const person = {
        id: 'cas|12345',
        username: 'Fname Lname',
        email: 'someone@email.com',
        giveId: 'cas|12345',
      };

      module.updateDatadogUser(person);

      expect(setUserSpy).toHaveBeenCalledWith(person);
      expect(clearUserSpy).not.toHaveBeenCalled();
    });

    it('should call clearUser when person is null', () => {
      module.updateDatadogUser(null);

      expect(clearUserSpy).toHaveBeenCalled();
      expect(setUserSpy).not.toHaveBeenCalled();
    });
  });
});

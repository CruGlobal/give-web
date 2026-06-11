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

  describe('allowedTracingUrls', () => {
    let initSpy;

    // Replicates how DataDog evaluates allowedTracingUrls entries
    // (string prefix match, RegExp test, or predicate function)
    const wouldTrace = (entry, url) => {
      if (typeof entry === 'function') {
        return entry(url);
      }
      if (entry instanceof RegExp) {
        return entry.test(url);
      }
      return url.startsWith(entry);
    };

    const initializeDataDog = () => {
      angular
        .module('testDataDogTracingConfig', [
          'environment',
          'pascalprecht.translate',
        ])
        .config(appConfig)
        .config(module.default);
      angular.mock.module('testDataDogTracingConfig');
      inject(() => {});

      expect(initSpy).toHaveBeenCalled();
      const allowedTracingUrls = initSpy.mock.calls[0][0].allowedTracingUrls;
      expect(allowedTracingUrls.length).toEqual(1);
      return allowedTracingUrls[0];
    };

    beforeEach(() => {
      initSpy = jest.spyOn(datadogRum, 'init').mockImplementation(() => {});
    });

    afterEach(() => {
      initSpy.mockRestore();
      document
        .querySelectorAll('branded-checkout')
        .forEach((element) => element.remove());
    });

    it('should trace the environment apiUrl cortex requests when no branded-checkout element exists', () => {
      const entry = initializeDataDog();

      // development environment apiUrl from app.config.js
      expect(
        wouldTrace(entry, 'https://give-stage2.cru.org/cortex/carts/default'),
      ).toEqual(true);
      expect(
        wouldTrace(entry, 'https://example.com/cortex/carts/default'),
      ).toEqual(false);
    });

    it('should trace the branded-checkout api-url cortex requests when the attribute includes a protocol', () => {
      const element = document.createElement('branded-checkout');
      element.setAttribute('api-url', 'https://brandedcheckout.jesusfilm.org');
      document.body.appendChild(element);

      const entry = initializeDataDog();

      expect(
        wouldTrace(
          entry,
          'https://brandedcheckout.jesusfilm.org/cortex/carts/default',
        ),
      ).toEqual(true);
      expect(
        wouldTrace(entry, 'https://give-stage2.cru.org/cortex/carts/default'),
      ).toEqual(true);
      expect(
        wouldTrace(entry, 'https://example.com/cortex/carts/default'),
      ).toEqual(false);
    });

    it('should trace the branded-checkout api-url cortex requests when the attribute omits the protocol', () => {
      const element = document.createElement('branded-checkout');
      element.setAttribute('api-url', 'brandedcheckout.jesusfilm.org/');
      document.body.appendChild(element);

      const entry = initializeDataDog();

      expect(
        wouldTrace(
          entry,
          'https://brandedcheckout.jesusfilm.org/cortex/carts/default',
        ),
      ).toEqual(true);
      expect(
        wouldTrace(entry, 'https://give-stage2.cru.org/cortex/carts/default'),
      ).toEqual(true);
    });

    it('should fall back to the environment apiUrl when the branded-checkout element has no api-url attribute', () => {
      const element = document.createElement('branded-checkout');
      document.body.appendChild(element);

      const entry = initializeDataDog();

      expect(
        wouldTrace(entry, 'https://give-stage2.cru.org/cortex/carts/default'),
      ).toEqual(true);
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

import angular from 'angular';
import 'angular-mocks';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/toPromise';

import * as module from './rollbar.config';

describe('rollbarConfig', () => {
  const self = {};

  describe('pipe $log to Rollbar', () => {
    beforeEach(() => {
      // Use rollbar config function somewhere
      angular
        .module('testRollbarConfig', ['environment'])
        .config(module.default);

      // Mock rollbar
      self.rollbarSpies = {
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warning: jest.fn(),
        error: jest.fn(),
        configure: jest.fn(),
      };
      module.rollbar.init = () => self.rollbarSpies;

      // Init and run the test module
      angular.mock.module('testRollbarConfig');

      inject(($log, $window) => {
        self.$log = $log;
        self.$window = $window;
      });
    });

    it('should send $log.log to rollbar and call through to $log', (done) => {
      jest.spyOn(self.$log, 'log');
      self.$log.log.logs = [];
      self.$log.log('test log');

      expect(self.$log.log.logs[0]).toEqual(['test log']);
      self.$window.setTimeout(() => {
        // Use setTimout to wait until the event loop has been called once to process the stacktrace promise
        expect(self.rollbarSpies.log).toHaveBeenCalledWith(
          'test log',
          expect.any(Error),
          { args: [] },
        );
        done(); // Tell jasmine that our async behavior has finished
      });
    });

    it('should send $log.debug to rollbar and call through to $log', (done) => {
      jest.spyOn(self.$log, 'debug');
      self.$log.debug.logs = [];
      self.$log.debug('test debug');

      expect(self.$log.debug.logs[0]).toEqual(['test debug']);
      self.$window.setTimeout(() => {
        expect(self.rollbarSpies.debug).toHaveBeenCalledWith(
          'test debug',
          expect.any(Error),
          { args: [] },
        );
        done();
      });
    });

    it('should send $log.info to rollbar and call through to $log', (done) => {
      jest.spyOn(self.$log, 'info');
      self.$log.info.logs = [];
      self.$log.info('test info');

      expect(self.$log.info.logs[0]).toEqual(['test info']);
      self.$window.setTimeout(() => {
        expect(self.rollbarSpies.info).toHaveBeenCalledWith(
          'test info',
          expect.any(Error),
          { args: [] },
        );
        done();
      });
    });

    it('should send $log.warn to rollbar and call through to $log', (done) => {
      jest.spyOn(self.$log, 'warn');
      self.$log.warn.logs = [];
      self.$log.warn('test warn');

      expect(self.$log.warn.logs[0]).toEqual(['test warn']);
      self.$window.setTimeout(() => {
        expect(self.rollbarSpies.warning).toHaveBeenCalledWith(
          'test warn',
          expect.any(Error),
          { args: [] },
        );
        done();
      });
    });

    it('should send $log.error to rollbar and call through to $log', (done) => {
      jest.spyOn(self.$log, 'error');
      self.$log.error.logs = [];
      self.$log.error('test error');

      expect(self.$log.error.logs[0]).toEqual(['test error']);
      self.$window.setTimeout(() => {
        expect(self.rollbarSpies.error).toHaveBeenCalledWith(
          'test error',
          expect.any(Error),
          { args: [] },
        );
        done();
      });
    });

    it('should send errors from $ExceptionHandler to rollbar', (done) => {
      jest.spyOn(self.$log, 'error');
      self.$log.error.logs = [];
      const error = new Error('some exception');
      self.$log.error(error);

      expect(self.$log.error.logs[0]).toEqual([new Error('some exception')]);
      self.$window.setTimeout(() => {
        expect(self.rollbarSpies.error).toHaveBeenCalledWith(
          'some exception',
          error,
          { args: [] },
        );
        done();
      });
    });

    it('should send a log to rollbar even the stacktrace fails', (done) => {
      jest.spyOn(self.$log, 'error');
      self.$log.error.logs = [];
      self.$log.error('test error');

      expect(self.$log.error.logs[0]).toEqual(['test error']);
      self.$window.setTimeout(() => {
        expect(self.rollbarSpies.error).toHaveBeenCalledWith(
          'test error',
          expect.any(Error),
          { args: [] },
        );
        done();
      });
    });

    describe('updateRollbarPerson', () => {
      it('should add person info to the rollbar configuration', () => {
        module.updateRollbarPerson(
          {
            sub: 'cas|12345',
            first_name: 'Fname',
            last_name: 'Lname',
            email: 'someone@email.com',
          },
          {
            sub: 'cas|12345',
          },
        );

        expect(self.rollbarSpies.configure).toHaveBeenCalledWith({
          payload: {
            person: {
              id: 'cas|12345',
              username: 'Fname Lname',
              email: 'someone@email.com',
              giveId: 'cas|12345',
            },
          },
        });
      });
    });
  });

  describe('scrubDomNodes', () => {
    it('should return true for dom modes where the name matches', () => {
      expect(
        module.scrubDomNodes(['creditCardField'])({
          attributes: [
            {
              key: 'name',
              value: 'creditCardField',
            },
          ],
        }),
      ).toEqual(true);
    });

    it('should return false for dom modes where the name does not match', () => {
      expect(
        module.scrubDomNodes(['creditCardField'])({
          attributes: [
            {
              key: 'name',
              value: 'notCreditCardField',
            },
          ],
        }),
      ).toEqual(false);
    });

    it("should return false for dom modes that don't have a name", () => {
      expect(
        module.scrubDomNodes(['creditCardField'])({
          attributes: [
            {
              key: 'id',
              value: 'creditCardField',
            },
          ],
        }),
      ).toEqual(false);
    });
  });
});

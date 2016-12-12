import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/toPromise';

import * as module from './rollbar.config';

describe('rollbarConfig', () => {
  var self = {};

  describe('pipe $log to Rollbar', () => {
    beforeEach(() => {
      // Use rollbar config function somewhere
      angular.module('testRollbarConfig', ['environment'])
        .config(module.default);

      // Mock rollbar
      self.rollbarSpies = {
        log: jasmine.createSpy('log'),
        debug: jasmine.createSpy('debug'),
        info: jasmine.createSpy('info'),
        warning: jasmine.createSpy('warning'),
        error: jasmine.createSpy('error'),
        configure: jasmine.createSpy('configure')
      };
      module.rollbar.init = () => self.rollbarSpies;


      self.rollbarExtraArgs = {
        stackTrace: [
          {
            functionName: 'a',
            lineNumber: 1,
            columnNumber: 1,
            fileName: 'a.js'
          }
        ],
        origin: '$log'
      };

      // Mock stacktrace
      self.stacktraceSpy = spyOn(module.stacktrace, 'get').and.callFake(() =>
        Observable.of(['ignored frame', self.rollbarExtraArgs.stackTrace[0]]).toPromise());

      // Init and run the test module
      angular.mock.module('testRollbarConfig');

      inject(($log, $window) => {
        self.$log = $log;
        self.$window = $window;
      });
    });

    it('should send $log.log to rollbar and call through to $log', (done) => {
      spyOn(self.$log, 'log').and.callThrough();
      self.$log.log('test log');
      expect(self.$log.log.logs[0]).toEqual(['test log']);
      self.$window.setTimeout(() => { // Use setTimout to wait until the event loop has been called once to process the stacktrace promise
        expect(self.rollbarSpies.log).toHaveBeenCalledWith('"test log"', self.rollbarExtraArgs);
        done(); // Tell jasmine that our async behavior has finished
      });
    });
    it('should send $log.debug to rollbar and call through to $log', (done) => {
      spyOn(self.$log, 'debug').and.callThrough();
      self.$log.debug('test debug');
      expect(self.$log.debug.logs[0]).toEqual(['test debug']);
      self.$window.setTimeout(() => {
        expect(self.rollbarSpies.debug).toHaveBeenCalledWith('"test debug"', self.rollbarExtraArgs);
        done();
      });
    });
    it('should send $log.info to rollbar and call through to $log', (done) => {
      spyOn(self.$log, 'info').and.callThrough();
      self.$log.info('test info');
      expect(self.$log.info.logs[0]).toEqual(['test info']);
      self.$window.setTimeout(() => {
        expect(self.rollbarSpies.info).toHaveBeenCalledWith('"test info"', self.rollbarExtraArgs);
        done();
      });
    });
    it('should send $log.warn to rollbar and call through to $log', (done) => {
      spyOn(self.$log, 'warn').and.callThrough();
      self.$log.warn('test warn');
      expect(self.$log.warn.logs[0]).toEqual(['test warn']);
      self.$window.setTimeout(() => {
        expect(self.rollbarSpies.warning).toHaveBeenCalledWith('"test warn"', self.rollbarExtraArgs);
        done();
      });
    });
    it('should send $log.error to rollbar and call through to $log', (done) => {
      spyOn(self.$log, 'error').and.callThrough();
      self.$log.error('test error');
      expect(self.$log.error.logs[0]).toEqual(['test error']);
      self.$window.setTimeout(() => {
        expect(self.rollbarSpies.error).toHaveBeenCalledWith('"test error"', self.rollbarExtraArgs);
        done();
      });
    });
    it('should send errors from $ExceptionHandler to rollbar', (done) => {
      spyOn(self.$log, 'error').and.callThrough();
      self.$log.error(new Error('some exception'));
      expect(self.$log.error.logs[0]).toEqual([new Error('some exception')]);
      self.$window.setTimeout(() => {
        self.rollbarExtraArgs.origin = '$ExceptionHandler';
        expect(self.rollbarSpies.error).toHaveBeenCalledWith('some exception', self.rollbarExtraArgs);
        done();
      });
    });
    it('should send a log to rollbar even the stacktrace fails', (done) => {
      spyOn(self.$log, 'error').and.callThrough();
      self.stacktraceSpy.and.callFake(() => Observable.throw('error message when fetching stack').toPromise());
      self.$log.error('test error');
      expect(self.$log.error.logs[0]).toEqual(['test error']);
      self.$window.setTimeout(() => {
        expect(self.rollbarSpies.error).toHaveBeenCalledWith('"test error"');
        expect(self.rollbarSpies.warning).toHaveBeenCalledWith('Error loading stackframes: error message when fetching stack');
        done();
      });
    });

    describe('updateRollbarPerson', () => {
      it('should add person info to the rollbar configuration', () => {
        module.updateRollbarPerson({
          sub: 'cas|12345',
          first_name: 'Fname',
          last_name: 'Lname',
          email: 'someone@email.com'
        });
        expect(self.rollbarSpies.configure).toHaveBeenCalledWith( {
          payload: {
            person: {
              id: 'cas|12345',
              username: 'Fname Lname',
              email: 'someone@email.com'
            }
          }
        } );
      } );
    } );
  });

  describe('formatStacktraceForRollbar', () => {
    it('should rename stack frame object keys', () => {
      expect(module.formatStacktraceForRollbar([
        {
          functionName: 'a',
          lineNumber: 1,
          columnNumber: 1,
          fileName: 'a.js'
        },
        {
          functionName: 'b',
          lineNumber: 2,
          columnNumber: 2,
          fileName: 'b.js'
        }
      ]))
        .toEqual([
          {
            method: 'a',
            lineno: 1,
            colno: 1,
            filename: 'a.js'
          },
          {
            method: 'b',
            lineno: 2,
            colno: 2,
            filename: 'b.js'
          }
        ]);
    });
  });

  describe('transformRollbarPayload', () => {
    it('should convert the payload from message format to trace format', () => {
      expect(module.transformRollbarPayload({
        data: {
          body: {
            message: {
              body: 'some error',
              extra: {
                stackTrace: [{
                  functionName: 'a',
                  lineNumber: 1,
                  columnNumber: 1,
                  fileName: 'a.js'
                }],
                origin: '$log'
              }
            }
          }
        }
      }))
        .toEqual({
          data: {
            body: {
              trace: {
                frames: [{
                  method: 'a',
                  lineno: 1,
                  colno: 1,
                  filename: 'a.js'
                }],
                exception: {
                  message: 'some error',
                  class: '$log'
                }
              }
            }
          }
        });
    });
    it('should leave the payload unmodified if extra.stackTrace is missing', () => {
      let payload = {
        data: {
          body: {
            message: {
              body: 'some error',
              extra: {
                somethingElse: 1
              }
            }
          }
        }
      };
      expect(module.transformRollbarPayload(payload)).toEqual(payload);
    });
  });
});

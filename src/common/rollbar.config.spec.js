import angular from 'angular';
import 'angular-mocks';
import 'angular-environment';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/toPromise';

import * as module from './rollbar.config';

describe('rollbarConfig', () => {
  var self = {};

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
      error: jasmine.createSpy('error')
    };
    module.rollbar.init = () => self.rollbarSpies;

    // Mock stacktrace
    self.stacktraceSpy = spyOn(module.stacktrace, 'get').and.callFake(() => Observable.of(['ignored frame', 'first frame']).toPromise());

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
      expect(self.rollbarSpies.log).toHaveBeenCalledWith('"test log"\n    at first frame');
      done(); // Tell jasmine that our async behavior has finished
    });
  });
  it('should send $log.debug to rollbar and call through to $log', (done) => {
    spyOn(self.$log, 'debug').and.callThrough();
    self.$log.debug('test debug');
    expect(self.$log.debug.logs[0]).toEqual(['test debug']);
    self.$window.setTimeout(() => {
      expect(self.rollbarSpies.debug).toHaveBeenCalledWith('"test debug"\n    at first frame');
      done();
    });
  });
  it('should send $log.info to rollbar and call through to $log', (done) => {
    spyOn(self.$log, 'info').and.callThrough();
    self.$log.info('test info');
    expect(self.$log.info.logs[0]).toEqual(['test info']);
    self.$window.setTimeout(() => {
      expect(self.rollbarSpies.info).toHaveBeenCalledWith('"test info"\n    at first frame');
      done();
    });
  });
  it('should send $log.warn to rollbar and call through to $log', (done) => {
    spyOn(self.$log, 'warn').and.callThrough();
    self.$log.warn('test warn');
    expect(self.$log.warn.logs[0]).toEqual(['test warn']);
    self.$window.setTimeout(() => {
      expect(self.rollbarSpies.warning).toHaveBeenCalledWith('"test warn"\n    at first frame');
      done();
    });
  });
  it('should send $log.error to rollbar and call through to $log', (done) => {
    spyOn(self.$log, 'error').and.callThrough();
    self.$log.error('test error');
    expect(self.$log.error.logs[0]).toEqual(['test error']);
    self.$window.setTimeout(() => {
      expect(self.rollbarSpies.error).toHaveBeenCalledWith('"test error"\n    at first frame');
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
});

import angular from 'angular'
import 'angular-mocks'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/toPromise'

import * as module from './rollbar.config'

describe('rollbarConfig', () => {
  const self = {}

  describe('pipe $log to Rollbar', () => {
    beforeEach(() => {
      // Use rollbar config function somewhere
      angular.module('testRollbarConfig', ['environment'])
        .config(module.default)

      // Mock rollbar
      self.rollbarSpies = {
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warning: jest.fn(),
        error: jest.fn(),
        configure: jest.fn()
      }
      module.rollbar.init = () => self.rollbarSpies

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
      }

      // Mock stacktrace
      self.stacktraceLogSpy = jest.spyOn(module.stacktrace, 'get').mockImplementation(() =>
        Observable.of(['ignored frame', self.rollbarExtraArgs.stackTrace[0]]).toPromise())

      // Init and run the test module
      angular.mock.module('testRollbarConfig')

      inject(($log, $window) => {
        self.$log = $log
        self.$window = $window
      })
    })

    it('should send $log.log to rollbar and call through to $log', (done) => {
      jest.spyOn(self.$log, 'log')
      self.$log.log.logs = []
      self.$log.log('test log')

      expect(self.$log.log.logs[0]).toEqual(['test log'])
      self.$window.setTimeout(() => { // Use setTimout to wait until the event loop has been called once to process the stacktrace promise
        expect(self.rollbarSpies.log).toHaveBeenCalledWith('"test log"', self.rollbarExtraArgs)
        done() // Tell jasmine that our async behavior has finished
      })
    })

    it('should send $log.debug to rollbar and call through to $log', (done) => {
      jest.spyOn(self.$log, 'debug')
      self.$log.debug.logs = []
      self.$log.debug('test debug')

      expect(self.$log.debug.logs[0]).toEqual(['test debug'])
      self.$window.setTimeout(() => {
        expect(self.rollbarSpies.debug).toHaveBeenCalledWith('"test debug"', self.rollbarExtraArgs)
        done()
      })
    })

    it('should send $log.info to rollbar and call through to $log', (done) => {
      jest.spyOn(self.$log, 'info')
      self.$log.info.logs = []
      self.$log.info('test info')

      expect(self.$log.info.logs[0]).toEqual(['test info'])
      self.$window.setTimeout(() => {
        expect(self.rollbarSpies.info).toHaveBeenCalledWith('"test info"', self.rollbarExtraArgs)
        done()
      })
    })

    it('should send $log.warn to rollbar and call through to $log', (done) => {
      jest.spyOn(self.$log, 'warn')
      self.$log.warn.logs = []
      self.$log.warn('test warn')

      expect(self.$log.warn.logs[0]).toEqual(['test warn'])
      self.$window.setTimeout(() => {
        expect(self.rollbarSpies.warning).toHaveBeenCalledWith('"test warn"', self.rollbarExtraArgs)
        done()
      })
    })

    it('should send $log.error to rollbar and call through to $log', (done) => {
      jest.spyOn(self.$log, 'error')
      self.$log.error.logs = []
      self.$log.error('test error')

      expect(self.$log.error.logs[0]).toEqual(['test error'])
      expect(self.stacktraceLogSpy).toHaveBeenCalledWith({ offline: true })
      self.$window.setTimeout(() => {
        expect(self.rollbarSpies.error).toHaveBeenCalledWith('"test error"', self.rollbarExtraArgs)
        done()
      })
    })

    it('should send errors from $ExceptionHandler to rollbar', (done) => {
      const stacktraceFromErrorSpy = jest.spyOn(module.stacktrace, 'fromError').mockImplementation(() =>
        Observable.of(['non-ignored frame', self.rollbarExtraArgs.stackTrace[0]]).toPromise())
      jest.spyOn(self.$log, 'error')
      self.$log.error.logs = []
      const error = new Error('some exception')
      self.$log.error(error)

      expect(self.$log.error.logs[0]).toEqual([new Error('some exception')])
      expect(stacktraceFromErrorSpy).toHaveBeenCalledWith(error, { offline: true })
      self.$window.setTimeout(() => {
        self.rollbarExtraArgs.origin = '$ExceptionHandler'

        expect(self.rollbarSpies.error).toHaveBeenCalledWith('some exception', { stackTrace: ['non-ignored frame', self.rollbarExtraArgs.stackTrace[0]], origin: '$ExceptionHandler' })
        done()
      })
    })

    it('should send a log to rollbar even the stacktrace fails', (done) => {
      jest.spyOn(self.$log, 'error')
      self.$log.error.logs = []
      self.stacktraceLogSpy.mockImplementation(() => Observable.throw('error message when fetching stack').toPromise())
      self.$log.error('test error')

      expect(self.$log.error.logs[0]).toEqual(['test error'])
      self.$window.setTimeout(() => {
        expect(self.rollbarSpies.error).toHaveBeenCalledWith('"test error"', { origin: '$log' })
        expect(self.rollbarSpies.warning).toHaveBeenCalledWith('Error loading stackframes: error message when fetching stack')
        done()
      })
    })

    describe('updateRollbarPerson', () => {
      it('should add person info to the rollbar configuration', () => {
        module.updateRollbarPerson({
          sub: 'cas|12345',
          first_name: 'Fname',
          last_name: 'Lname',
          email: 'someone@email.com'
        })

        expect(self.rollbarSpies.configure).toHaveBeenCalledWith({
          payload: {
            person: {
              id: 'cas|12345',
              username: 'Fname Lname',
              email: 'someone@email.com'
            }
          }
        })
      })
    })
  })

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
        ])
    })
  })

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
        })
    })

    it('should leave the payload unmodified if extra.stackTrace is missing', () => {
      const payload = {
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
      }

      expect(module.transformRollbarPayload(payload)).toEqual(payload)
    })
  })

  describe('scrubDomNodes', () => {
    it('should return true for dom modes where the name matches', () => {
      expect(module.scrubDomNodes(['creditCardField'])({
        attributes: [
          {
            key: 'name',
            value: 'creditCardField'
          }
        ]
      })).toEqual(true)
    })

    it('should return false for dom modes where the name does not match', () => {
      expect(module.scrubDomNodes(['creditCardField'])({
        attributes: [
          {
            key: 'name',
            value: 'notCreditCardField'
          }
        ]
      })).toEqual(false)
    })

    it('should return false for dom modes that don\'t have a name', () => {
      expect(module.scrubDomNodes(['creditCardField'])({
        attributes: [
          {
            key: 'id',
            value: 'creditCardField'
          }
        ]
      })).toEqual(false)
    })
  })
})

import angular from 'angular'
import 'angular-mocks'
import * as module from './datadog.config'

describe('dataDogConfig', () => {
  process.env.DATADOG_RUM_CLIENT_TOKEN = '1234'
  describe('pipe $log to Rollbar', () => {
    beforeEach(() => {
      // Use rollbar config function somewhere
      angular.module('testDataDogConfig', ['environment'])
        .config(module.default)
        // Init and run the test module
        angular.mock.module('testDataDogConfig')
        inject(() => {})
    })

    it('should send $log.log to rollbar and call through to $log', () => {
      expect(window.datadogRum).not.toEqual(undefined)
      expect(window.datadogRum.init).toEqual(expect.any(Function))
      expect(window.datadogRum.startSessionReplayRecording).toEqual(expect.any(Function))
    })
  })
})

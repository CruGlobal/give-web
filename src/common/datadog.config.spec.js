import angular from 'angular'
import 'angular-mocks'
import * as module from './datadog.config'

describe('dataDogConfig', () => {
  process.env.DATADOG_RUM_CLIENT_TOKEN = '1234'
  describe('configure Datadog RUM', () => {
    beforeEach(() => {
      // Use rollbar config function somewhere
      angular.module('testDataDogConfig', ['environment'])
        .config(module.default)
        // Init and run the test module
        angular.mock.module('testDataDogConfig')
        inject(() => {})
    })

    it('should call init() and start session reply recording', () => {
      expect(window.datadogRum).not.toEqual(undefined)
      expect(window.datadogRum.init).toEqual(expect.any(Function))
      expect(window.datadogRum.startSessionReplayRecording).toEqual(expect.any(Function))
    })
  })
})

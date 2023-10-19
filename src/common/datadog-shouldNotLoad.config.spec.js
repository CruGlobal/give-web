import angular from 'angular'
import 'angular-mocks'
import * as module from './datadog.config'

describe('dataDogConfig', () => {

  describe('pipe $log to Rollbar', () => {
    beforeEach(() => {
      // Use rollbar config function somewhere
      angular.module('testDataDogConfig', ['environment'])
        .config(module.default)
      // Init and run the test module
      angular.mock.module('testDataDogConfig')
      inject(() => {})
    })

    describe('DATADOG_RUM_CLIENT_TOKEN not defined', () => {
      it('should make Window.datadogRum return undefined', () => {
          expect(window.datadogRum).toEqual(undefined)
      })
    })
  })
})

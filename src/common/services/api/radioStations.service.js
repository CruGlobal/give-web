import angular from 'angular'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/combineLatest'
import 'rxjs/add/operator/pluck'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'
import appConfig from 'common/app.config'

const serviceName = 'radioStationsService'

class RadioStations {
  /* @ngInject */
  constructor ($http, $window, $log, $filter) {
    this.$http = $http
    this.sessionStorage = $window.sessionStorage
    this.localStorage = $window.localStorage
    this.$log = $log
    this.$filter = $filter
  }

  getRadioStations(radioStationApiUrl, postalCode, radioStationRadius) {
    debugger
    return Observable.from(this.$http({
      method: 'GET',
      url: radioStationApiUrl + '/' + postalCode + '/' + radioStationRadius,
      withCredentials: true
    }))
      .map((response) => {
        debugger
        return response.data
      })
  }
}

export default angular
  .module(serviceName, [
    'environment',
    appConfig.name,
  ])
  .service(serviceName, RadioStations)

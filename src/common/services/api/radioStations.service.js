import angular from 'angular'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/pluck'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/do'
import 'rxjs/add/observable/from'

const serviceName = 'radioStationsService'

class RadioStations {
  /* @ngInject */
  constructor ($http) {
    this.$http = $http
  }

  getRadioStations (radioStationApiUrl, postalCode, radioStationRadius) {
    return Observable.from(this.$http({
      method: 'GET',
      url: radioStationApiUrl + '/' + postalCode + '/' + radioStationRadius,
      withCredentials: true
    }))
      .map((response) => {
        return response.data.GetMediaNearPostalCodeResult
      })
  }
}

export default angular
  .module(serviceName, [])
  .service(serviceName, RadioStations)

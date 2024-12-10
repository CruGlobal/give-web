import angular from 'angular'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from'
import 'rxjs/add/operator/map'

const serviceName = 'radioStationsService'

class RadioStations {
  /* @ngInject */
  constructor ($http) {
    this.$http = $http
  }

  getRadioStations (radioStationApiUrl, postalCode) {
    return Observable.from(this.$http({
      method: 'GET',
      url: radioStationApiUrl + '/' + postalCode,
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

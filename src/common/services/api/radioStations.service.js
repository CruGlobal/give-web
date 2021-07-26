import angular from 'angular'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map'

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

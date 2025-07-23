import angular from 'angular';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/map';
import appConfig from 'common/app.config';

const serviceName = 'thankYouService';

class ThankYouService {
  /* @ngInject */
  constructor($http, $location, envService) {
    this.$http = $http;
    this.$location = $location;
    this.envService = envService;
    this.thankYouImagePath = '/content/dam/give/thank-you-images';
    this.jsonDataPath = `${this.thankYouImagePath}/thank-you-page-configuration/jcr:content/data/master.json`;
    this.thankYouData = this.getThankYouData();
  }

  shouldShowThankYouImage() {
    return Observable.from(this.thankYouData).map((data) => {
      return data.showThankYouImage;
    });
  }

  getThankYouData() {
    return Observable.from(
      this.$http.get(this.envService.read('publicGive') + this.jsonDataPath),
    ).map((response) => {
      return response.data;
    });
  }

  getOrgIdThankYouData(orgId) {
    const orgIdJsonPath = `${this.thankYouImagePath}/${orgId.toLowerCase()}/jcr:content/data/master.json`;
    return Observable.from(
      this.$http.get(this.envService.read('publicGive') + orgIdJsonPath),
    ).map((response) => {
      return response.data;
    });
  }
}

export default angular
  .module(serviceName, [appConfig.name])
  .service(serviceName, ThankYouService);

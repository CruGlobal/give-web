import angular from 'angular';
import ccp from 'common/lib/ccp';
import appConfig from 'common/app.config';
import { ccpKey, ccpStagingKey } from 'common/app.constants';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

let serviceName = 'ccpService';

class Ccp {

  /*@ngInject*/
  constructor(envService, $http, $log){
    this.envService = envService;
    this.$http = $http;
    this.$log = $log;
  }

  get(){
    if(this.currentRequest){
      return this.currentRequest; // Use cached/pending request
    }
    this.currentRequest = Observable.from(this.$http.get(this.envService.read('ccpKeyUrl')))
      .pluck('data')
      .catch((error) => {
        this.$log.warn('Using backup CCP encryption key. There was an error retrieving the key from CCP', error);
        return Observable.of(this.envService.is('production') ? ccpKey : ccpStagingKey); // Use hardcoded backup key
      })
      .map((key) => {
        ccp.initialize(key);
        return ccp;
      });

    return this.currentRequest;
  }
}

export default angular
  .module(serviceName, [
    appConfig.name
  ])
  .service(serviceName, Ccp);

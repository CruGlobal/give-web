import angular from 'angular';
import 'angular-environment';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

import appConfig from 'common/app.config';

let serviceName = 'casApiService';

class CasApi {

  /*@ngInject*/
  constructor( $http, envService ) {
    this.$http = $http;
    this.envService = envService;
  }

  http( config ) {
    config.params = config.params || {};
    if ( config.followLocation ) {
      config.params.followLocation = true;
    }

    return Observable.from( this.$http( {
      method:          config.method,
      url:             this.envService.read( 'apiUrl' ) + '/cas' + this.serializePath( config.path ),
      params:          config.params,
      data:            config.data,
      withCredentials: true
    } ) )
      .map( ( response ) => {
        return response.data;
      } );
  }

  get( request ) {
    request.method = 'GET';
    return this.http( request );
  }

  post( request ) {
    request.method = 'POST';
    return this.http( request );
  }

  put( request ) {
    request.method = 'PUT';
    return this.http( request );
  }

  delete( request ) {
    request.method = 'DELETE';
    return this.http( request );
  }

  serializePath( path ) {
    if ( angular.isArray( path ) ) {
      return '/' + path.join( '/' );
    } else {
      return path.charAt( 0 ) === '/' ? path : '/' + path;
    }
  }
}

export default angular
  .module( serviceName, [
    'environment',
    appConfig.name
  ] )
  .service( serviceName, CasApi );

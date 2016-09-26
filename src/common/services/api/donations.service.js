import angular from 'angular';
import 'rxjs/add/operator/pluck';

import cortexApiService from '../cortexApi.service';

let serviceName = 'donationsService';

/*@ngInject*/
function DonationsService( cortexApiService ) {

  function getRecipients( year, month ) {
    let path = ['donations', 'historical', cortexApiService.scope, 'recipient'];
    path.push( angular.isDefined( year ) ? year : 'recent' );
    if ( angular.isDefined( year ) && angular.isDefined( month ) ) path.push( month );

    return cortexApiService
      .get( {
        path: path,
        zoom: {
          recipients: 'element[],element:mostrecentdonation,element:mostrecentdonation:recurringdonationelement[]'
        }
      } )
      .pluck( 'recipients' );
  }

  function getRecipientDetails( recipient ) {
    return cortexApiService
      .get( {
        path: recipient.self.uri,
        zoom: {
          details: 'element[],element:paymentmethod'
        }
      } )
      .pluck( 'details' );
  }

  return {
    getRecipients:       getRecipients,
    getRecipientDetails: getRecipientDetails
  };
}

export default angular
  .module( serviceName, [
    cortexApiService.name
  ] )
  .factory( serviceName, DonationsService );

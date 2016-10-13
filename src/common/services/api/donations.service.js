import angular from 'angular';
import 'rxjs/add/operator/pluck';

import cortexApiService from '../cortexApi.service';

let serviceName = 'donationsService';

/*@ngInject*/
function DonationsService( cortexApiService ) {

  function getRecipients( year ) {
    let path = ['donations', 'historical', cortexApiService.scope, 'recipient'];
    path.push( angular.isDefined( year ) ? year : 'recent' );

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

  function getHistoricalGifts( year, month ) {
    return cortexApiService
      .get( {
        path: ['donations', 'historical', cortexApiService.scope, year, month],
        zoom: {
          gifts: 'element[],element:paymentmethod,element:recurringdonationelement'
        }
      } )
      .pluck( 'gifts' );
  }

  function getReceipts( data ) {
    return cortexApiService
      .post( {
        path: '/receipts/items',
        followLocation: true,
        data: data
      } )
      .map( (response) => {
        angular.forEach(response['receipt-summaries'], (item, index) => {
          item['pdf-link'] = response['links'][index+1];
        });
        return response;
      })
      .pluck( 'receipt-summaries' );
  }

  return {
    getHistoricalGifts:  getHistoricalGifts,
    getRecipients:       getRecipients,
    getRecipientDetails: getRecipientDetails,
    getReceipts:         getReceipts
  };
}

export default angular
  .module( serviceName, [
    cortexApiService.name
  ] )
  .factory( serviceName, DonationsService );

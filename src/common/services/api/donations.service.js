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

  function getNextGiftDate(gift){
    if(!gift['recurring-day-of-month']) return false;
    let date = new Date();
    let dayOfGiving = gift['recurring-day-of-month']*1;
    let happensThisMonth = date.getDate() < dayOfGiving ? true : false;
    date.setDate(dayOfGiving);
    !happensThisMonth ? date.setMonth(date.getMonth()+1) : false;
    return date;
  }

  return {
    getHistoricalGifts:  getHistoricalGifts,
    getRecipients:       getRecipients,
    getRecipientDetails: getRecipientDetails,
    getNextGiftDate:     getNextGiftDate
  };
}

export default angular
  .module( serviceName, [
    cortexApiService.name
  ] )
  .factory( serviceName, DonationsService );

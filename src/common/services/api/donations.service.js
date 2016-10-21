import angular from 'angular';
import map from 'lodash/map';
import flatMap from 'lodash/flatMap';
import omit from 'lodash/omit';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/pluck';

import cortexApiService from '../cortexApi.service';
import profileService from './profile.service';

import find from 'lodash/find';

let serviceName = 'donationsService';

/*@ngInject*/
function DonationsService( cortexApiService, profileService ) {

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
        path:           '/receipts/items',
        followLocation: true,
        data:           data
      } )
      .map( ( response ) => {
        angular.forEach( response['receipt-summaries'], ( item ) => {
          let link = find( response.links, ( r ) => {
            return r.uri.indexOf( item['transaction-number'] ) != -1;
          } );
          item['pdf-link'] = link;
        } );
        return response;
      } )
      .pluck( 'receipt-summaries' );
  }

  function getRecurringGifts() {
    return Observable.forkJoin(
      cortexApiService.get( {
        path: ['profiles', cortexApiService.scope, 'default'],
        zoom: {
          gifts: 'givingdashboard:managerecurringdonations'
        }
      } )
        .pluck( 'gifts' ),
      profileService.getPaymentMethods()
    )
      .map( ( [gifts, paymentMethods] ) => {
        return flatMap( gifts.donations, donation => {
          return map( donation['donation-lines'], donationLine => {
            donationLine.rate = donation.rate;
            donationLine['recurring-day-of-month'] = donation['recurring-day-of-month'];
            donationLine['next-draw-date'] = donation['next-draw-date'];
            donationLine.paymentMethod = find( paymentMethods, ( paymentMethod ) => {
              return donationLine['payment-method-id'] === paymentMethod.self.uri.split( '/' ).pop();
            } );
            return donationLine;
          } );
        } );
      } );
  }

  function updateRecurringGifts( gifts ) {
    gifts = angular.isArray( gifts ) ? gifts : [gifts];
    return cortexApiService.put( {
      path: ['donations', 'recurring', cortexApiService.scope, 'active'],
      data: {donations: map( gifts, ( gift ) => omit( gift, ['_selectedGift', 'paymentMethod'] ) )}
    } );
  }

  return {
    getHistoricalGifts:   getHistoricalGifts,
    getRecipients:        getRecipients,
    getRecipientDetails:  getRecipientDetails,
    getReceipts:          getReceipts,
    getRecurringGifts:    getRecurringGifts,
    updateRecurringGifts: updateRecurringGifts
  };
}

export default angular
  .module( serviceName, [
    cortexApiService.name,
    profileService.name
  ] )
  .factory( serviceName, DonationsService );

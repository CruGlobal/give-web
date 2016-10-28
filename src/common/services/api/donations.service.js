import angular from 'angular';
import map from 'lodash/map';
import flatMap from 'lodash/flatMap';
import groupBy from 'lodash/groupBy';
import zipObject from 'lodash/zipObject';
import flatten from 'lodash/flatten';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/pluck';

import cortexApiService from '../cortexApi.service';
import profileService from './profile.service';
import commonService from './common.service';
import RecurringGiftModel from 'common/models/recurringGift.model';

import find from 'lodash/find';

let serviceName = 'donationsService';

export let RecurringGiftsType = {
  active:    'managerecurringdonations',
  hold:      'onholdrecurringdonations',
  suspended: 'restartrecurringdonations',
  errored:   'erroredrecurringdonations',
  future:    'futurerecurringdonations',
  cancelled: 'cancelledrecurringdonations'
};

/*@ngInject*/
function DonationsService( cortexApiService, profileService, commonService ) {

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

  function getRecentRecipients() {
    return cortexApiService.get( {
      path: ['profiles', cortexApiService.scope, 'default'],
      zoom: {
        recentGifts: 'givingdashboard:recentdonations:element[]'
      }
    } )
      .pluck( 'recentGifts' );
  }

  function getRecurringGifts( recurringGiftsTypes ) {
    recurringGiftsTypes = angular.isUndefined( recurringGiftsTypes ) ? [RecurringGiftsType.active] : recurringGiftsTypes;
    recurringGiftsTypes = angular.isArray( recurringGiftsTypes ) ? recurringGiftsTypes : [recurringGiftsTypes];
    return Observable.forkJoin(
      cortexApiService.get( {
        path: ['profiles', cortexApiService.scope, 'default'],
        zoom: zipObject( recurringGiftsTypes, map( recurringGiftsTypes, ( type ) => `givingdashboard:${type}` ) )
      } ),
      commonService.getNextDrawDate(),
      profileService.getPaymentMethods()
    )
      .map( ( [data, nextDrawDate, paymentMethods] ) => {
        return flatMap( flatten( map( recurringGiftsTypes, ( type ) => data[type].donations ) ), donation => {
          return map( donation['donation-lines'], donationLine => {
            return new RecurringGiftModel( donationLine, donation, nextDrawDate, paymentMethods );
          } );
        } );
      } );
  }

  function updateRecurringGifts( gifts ) {
    gifts = angular.isArray( gifts ) ? gifts : [gifts];
    let groupedGifts = groupBy( gifts, 'parentDonation["donation-row-id"]' );
    let donations = map( groupedGifts, ( lines, donationId ) => {
      return {
        'donation-lines':   map( lines, 'toObject' ),
        'donation-status':  lines[0].parentDonation['donation-status'],
        'effective-status': lines[0].parentDonation['effective-status'],
        rate:               lines[0].parentDonation.rate,
        'donation-row-id':  donationId
      };
    } );
    return cortexApiService.put( {
      path: ['donations', 'recurring', cortexApiService.scope, 'active'],
      data: {
        donations: donations
      }
    } );
  }

  function addRecurringGifts( gifts ) {
    gifts = angular.isArray( gifts ) ? gifts : [gifts];
    return cortexApiService.post( {
      path: ['donations', 'recurring', cortexApiService.scope],
      data: {
        'donation-lines': map( gifts, 'toObject' )
      }
    } );
  }

  return {
    getHistoricalGifts:   getHistoricalGifts,
    getRecipients:        getRecipients,
    getRecipientDetails:  getRecipientDetails,
    getReceipts:          getReceipts,
    getRecentRecipients:  getRecentRecipients,
    getRecurringGifts:    getRecurringGifts,
    updateRecurringGifts: updateRecurringGifts,
    addRecurringGifts:    addRecurringGifts
  };
}

export default angular
  .module( serviceName, [
    cortexApiService.name,
    profileService.name,
    commonService.name
  ] )
  .factory( serviceName, DonationsService );

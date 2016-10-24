import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import module from './donations.service';

import RecurringGiftModel from 'common/models/recurringGift.model';

import historicalResponse from './fixtures/cortex-donations-historical.fixture';
import recipientResponse from './fixtures/cortex-donations-recipient.fixture';
import recipientDetailsResponse from './fixtures/cortex-donations-recipient-details.fixture';
import receiptsResponse from './fixtures/cortex-donations-receipts.fixture';
import recurringGiftsResponse from './fixtures/cortex-donations-recurring-gifts.fixture';

describe( 'donations service', () => {
  beforeEach( angular.mock.module( module.name ) );
  let donationsService, profileService, commonService, $httpBackend;

  beforeEach( inject( ( _donationsService_, _profileService_, _commonService_, _$httpBackend_ ) => {
    donationsService = _donationsService_;
    profileService = _profileService_;
    commonService = _commonService_;
    $httpBackend = _$httpBackend_;
  } ) );

  afterEach( () => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  } );

  describe( 'getRecipients( year )', () => {
    it( 'should load recent when missing year', () => {
      $httpBackend
        .expectGET( 'https://cortex-gateway-stage.cru.org/cortex/donations/historical/crugive/recipient/recent?zoom=element,element:mostrecentdonation,element:mostrecentdonation:recurringdonationelement' )
        .respond( 200, recipientResponse );
      donationsService.getRecipients().subscribe( ( recipients ) => {
        expect( recipients ).toEqual( jasmine.any( Array ) );
      } );
      $httpBackend.flush();
    } );

    it( 'should load recipients by year', () => {
      $httpBackend
        .expectGET( 'https://cortex-gateway-stage.cru.org/cortex/donations/historical/crugive/recipient/2015?zoom=element,element:mostrecentdonation,element:mostrecentdonation:recurringdonationelement' )
        .respond( 200, recipientResponse );
      donationsService.getRecipients( 2015 ).subscribe( ( recipients ) => {
        expect( recipients ).toEqual( jasmine.any( Array ) );
      } );
      $httpBackend.flush();
    } );
  } );

  describe( 'getRecipientDetails( recipient )', () => {
    it( 'should load recipient details', () => {
      $httpBackend
        .expectGET( 'https://cortex-gateway-stage.cru.org/cortex/donations/historical/crugive/recipientsummary/a5ufc43nkb2htqvrlu6vg3lsmtbkkus5ijjh2ob2ykxuyprsykytqrwcuhbl6vlzinix2mdrn5lt2mklo4=?zoom=element,element:paymentmethod' )
        .respond( 200, recipientDetailsResponse );
      donationsService.getRecipientDetails( {self: {uri: '/donations/historical/crugive/recipientsummary/a5ufc43nkb2htqvrlu6vg3lsmtbkkus5ijjh2ob2ykxuyprsykytqrwcuhbl6vlzinix2mdrn5lt2mklo4='}} ).subscribe( ( details ) => {
        expect( details ).toEqual( jasmine.any( Array ) );
      } );
      $httpBackend.flush();
    } );
  } );

  describe( 'getHistoricalGifts( year, month )', () => {
    it( 'should load historical gifts by year and month', () => {
      $httpBackend
        .expectGET( 'https://cortex-gateway-stage.cru.org/cortex/donations/historical/crugive/2016/9?zoom=element,element:paymentmethod,element:recurringdonationelement' )
        .respond( 200, historicalResponse );
      donationsService.getHistoricalGifts( 2016, 9 ).subscribe( ( historicalGifts ) => {
        expect( historicalGifts ).toEqual( jasmine.any( Array ) );
      } );
      $httpBackend.flush();
    } );
  } );

  describe( 'getReceipts( data )', () => {
    it( 'should load receipts', () => {
      $httpBackend
        .expectPOST( 'https://cortex-gateway-stage.cru.org/cortex/receipts/items?followLocation=true' )
        .respond( 200, receiptsResponse );
      donationsService.getReceipts( {} ).subscribe( ( receipts ) => {
        expect( receipts ).toEqual( jasmine.any( Array ) );
      } );
      $httpBackend.flush();
    } );
  } );

  describe( 'getRecurringGifts()', () => {
    it( 'should load recurring gifts', () => {
      let paymentMethod = {
        "self": {
          "type": "elasticpath.bankaccounts.bank-account",
          "uri": "/selfservicepaymentmethods/crugive/giydcnzyga=",
          "href": "https://cortex-gateway-stage.cru.org/cortex/selfservicepaymentmethods/crugive/giydcnzyga="
        },
        "account-type": "Savings",
        "bank-name": "2nd Bank",
        "description": "2nd Bank - 3456",
        "display-account-number": "3456",
        "encrypted-account-number": "",
        "routing-number": "021000021"
      };
      spyOn( profileService, 'getPaymentMethods' ).and.returnValue( Observable.of([ paymentMethod ]) );
      spyOn( commonService, 'getNextDrawDate' ).and.returnValue( Observable.of('2015-06-09') );

      $httpBackend
        .expectGET( 'https://cortex-gateway-stage.cru.org/cortex/profiles/crugive/default?zoom=givingdashboard:managerecurringdonations' )
        .respond( 200, recurringGiftsResponse );

      donationsService.getRecurringGifts().subscribe( gifts => {
        expect( gifts[0].toObject ).toEqual( {
          amount: 25,
          'designation-name': 'David and Margo Neibling (0105987)',
          'designation-number': '0105987',
          'donation-line-row-id': '1-GVVEB6',
          'donation-line-status': 'Standard',
          'payment-method-id': 'giydcnzyga=',
          'updated-donation-line-status': '',
          'updated-payment-method-id': '',
          'updated-rate': {recurrence: {interval: ''}},
          'updated-recurring-day-of-month': '',
          'updated-start-month': '',
          'updated-start-year': '',
          rate: {recurrence: {interval: 'Monthly'}},
          'recurring-day-of-month': '15',
          'next-draw-date': {'display-value': '2016-01-15', value: 1452816000000}
        } );
        expect( gifts[0].paymentMethods ).toEqual( [ paymentMethod ] );
        expect( gifts[0].nextDrawDate ).toEqual( '2015-06-09' );
      });
      $httpBackend.flush();
    } );
  } );

  describe( 'updateRecurringGifts' , () => {
    let gift;
    beforeEach(() => {
      gift = new RecurringGiftModel({
        amount: 25,
        'designation-name': 'David and Margo Neibling (0105987)',
        'designation-number': '0105987',
        'donation-line-row-id': '1-GVVEB6',
        'donation-line-status': 'Standard',
        'payment-method-id': 'giydcnzyga=',
        'updated-donation-line-status': '',
        'updated-payment-method-id': '',
        'updated-rate': {recurrence: {interval: ''}},
        'updated-recurring-day-of-month': '',
        'updated-start-month': '',
        'updated-start-year': '',
        rate: {recurrence: {interval: 'Monthly'}},
        'recurring-day-of-month': '15',
        'next-draw-date': {'display-value': '2016-01-15', value: 1452816000000}
      });
    });

    it('should update a recurring gift', () => {
      $httpBackend
        .expectPUT( 'https://cortex-gateway-stage.cru.org/cortex/donations/recurring/crugive/active', {donations: { 'donation-lines': [{
          amount: 25,
          'designation-name': 'David and Margo Neibling (0105987)',
          'designation-number': '0105987',
          'donation-line-row-id': '1-GVVEB6',
          'donation-line-status': 'Standard',
          'payment-method-id': 'giydcnzyga=',
          'updated-donation-line-status': '',
          'updated-payment-method-id': '',
          'updated-rate': {recurrence: {interval: ''}},
          'updated-recurring-day-of-month': '',
          'updated-start-month': '',
          'updated-start-year': '',
          rate: {recurrence: {interval: 'Monthly'}},
          'recurring-day-of-month': '15',
          'next-draw-date': {'display-value': '2016-01-15', value: 1452816000000}
        }]} } )
        .respond( 204, {} );

      donationsService.updateRecurringGifts(gift).subscribe(() => {});
      $httpBackend.flush();
    });

    it('should update recurring gifts', () => {
      $httpBackend
        .expectPUT( 'https://cortex-gateway-stage.cru.org/cortex/donations/recurring/crugive/active', {donations: { 'donation-lines': [{
          amount: 25,
          'designation-name': 'David and Margo Neibling (0105987)',
          'designation-number': '0105987',
          'donation-line-row-id': '1-GVVEB6',
          'donation-line-status': 'Standard',
          'payment-method-id': 'giydcnzyga=',
          'updated-donation-line-status': '',
          'updated-payment-method-id': '',
          'updated-rate': {recurrence: {interval: ''}},
          'updated-recurring-day-of-month': '',
          'updated-start-month': '',
          'updated-start-year': '',
          rate: {recurrence: {interval: 'Monthly'}},
          'recurring-day-of-month': '15',
          'next-draw-date': {'display-value': '2016-01-15', value: 1452816000000}
        }, {
          amount: 25,
          'designation-name': 'David and Margo Neibling (0105987)',
          'designation-number': '0105987',
          'donation-line-row-id': '1-GVVEB6',
          'donation-line-status': 'Standard',
          'payment-method-id': 'giydcnzyga=',
          'updated-donation-line-status': '',
          'updated-payment-method-id': '',
          'updated-rate': {recurrence: {interval: ''}},
          'updated-recurring-day-of-month': '',
          'updated-start-month': '',
          'updated-start-year': '',
          rate: {recurrence: {interval: 'Monthly'}},
          'recurring-day-of-month': '15',
          'next-draw-date': {'display-value': '2016-01-15', value: 1452816000000}
        } ]} } )
        .respond( 204, {} );

      donationsService.updateRecurringGifts([gift, gift]).subscribe(() => {});
      $httpBackend.flush();
    });
  } );
} );

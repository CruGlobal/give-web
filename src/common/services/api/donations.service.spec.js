import angular from 'angular';
import 'angular-mocks';
import module from './donations.service';

import historicalResponse from './fixtures/cortex-donations-historical.fixture';
import recipientResponse from './fixtures/cortex-donations-recipient.fixture';
import recipientDetailsResponse from './fixtures/cortex-donations-recipient-details.fixture';

describe( 'donations service', () => {
  beforeEach( angular.mock.module( module.name ) );
  let donationsService, $httpBackend;

  beforeEach( inject( ( _donationsService_, _$httpBackend_ ) => {
    donationsService = _donationsService_;
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

} );

import angular from 'angular';
import 'angular-mocks';
import module from './donations.service';

import recipientResponse from './fixtures/cortex-donations-recipient.fixture';

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

  describe( 'getRecipients( year, month )', () => {
    it( 'should load recent when missing year and month', () => {
      $httpBackend
        .expectGET( 'https://cortex-gateway-stage.cru.org/cortex/donations/historical/crugive/recipient/recent?zoom=element,element:mostrecentdonation,element:mostrecentdonation:recurringdonationelement' )
        .respond( 200, recipientResponse );
      donationsService.getRecipients().subscribe( ( recipients ) => {
        expect( recipients ).toEqual( jasmine.any( Array ) );
      } );
      $httpBackend.flush();
    } );

    it( 'should load recipients by month/year', () => {
      $httpBackend
        .expectGET( 'https://cortex-gateway-stage.cru.org/cortex/donations/historical/crugive/recipient/2015/9?zoom=element,element:mostrecentdonation,element:mostrecentdonation:recurringdonationelement' )
        .respond( 200, recipientResponse );
      donationsService.getRecipients( 2015, 9 ).subscribe( ( recipients ) => {
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
} );

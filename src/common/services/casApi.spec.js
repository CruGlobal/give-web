import angular from 'angular';
import 'angular-mocks';
import module from './casApi.service';

describe( 'cas api service', function () {
  beforeEach( angular.mock.module( module.name ) );
  var self = {};

  beforeEach( inject( function ( casApiService, $httpBackend ) {
    self.casApiService = casApiService;
    self.$httpBackend = $httpBackend;
  } ) );

  describe( 'http', function () {
    it( 'should send a simple request', function () {
      self.$httpBackend.expectGET( 'https://cortex-gateway-stage.cru.org/cas/test' ).respond( 200, 'success' );
      self.casApiService.http( {
        method: 'GET',
        path:   'test'
      } ).subscribe( ( data ) => {
        expect( data ).toEqual( 'success' );
      } );
      self.$httpBackend.flush();
    } );
  } );
} );

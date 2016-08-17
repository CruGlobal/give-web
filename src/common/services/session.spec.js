import angular from 'angular';
import 'angular-mocks';
import module from './session.service';
import has from 'lodash/has';

describe( 'session service', function () {
  beforeEach( angular.mock.module( module.name ) );
  let self = {};

  beforeEach( inject( function ( sessionService, $httpBackend ) {
    self.sessionService = sessionService;
    self.$httpBackend = $httpBackend;
  } ) );

  it( 'to be defined', () => {
    expect( self.sessionService ).toBeDefined();
  } );

  describe( 'current', () => {
    it( 'to be defined', () => {
      expect( self.sessionService.current ).toBeDefined();
    } );

    it( 'to have properties', () => {
      ['role', 'cortex'].forEach( ( prop ) => {
        expect( has( self.sessionService.current, prop ) ).toBeTruthy();
      } );
    } );
  } );

  describe( 'signIn', () => {
    it( 'to be defined', () => {
      expect( self.sessionService.signIn ).toBeDefined();
    } );

    it( 'makes http request to cas/login', () => {
      self.$httpBackend.expectPOST( 'https://cortex-gateway-stage.cru.org/cas/login', {
        username: 'user@example.com',
        password: 'hello123'
      } ).respond( 200, 'success' );
      self.sessionService
        .signIn( 'user@example.com', 'hello123' )
        .subscribe( ( data ) => {
          expect( data ).toEqual( 'success' );
        } );
      self.$httpBackend.flush();
    } );
  } );
} );

import angular from 'angular';
import 'angular-mocks';
import module from './session.service';

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

  describe( 'session', () => {
    it( 'to be defined', () => {
      expect( self.sessionService.session ).toBeDefined();
    } );
  } );

  describe( 'getRole', () => {
    it( 'to be defined', () => {
      expect( self.sessionService.getRole ).toBeDefined();
    } );

    it( 'returns \'PUBLIC\' if no session exists', () => {
      expect( self.sessionService.getRole() ).toEqual( 'PUBLIC' );
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

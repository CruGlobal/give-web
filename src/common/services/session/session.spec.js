import angular from 'angular';
import 'angular-mocks';
import module from './session.service';
import {cortexSession} from './fixtures/cortex-session';
import {giveSession} from './fixtures/give-session';

describe( 'session service', function () {
  beforeEach( angular.mock.module( module.name ) );
  let self = {};

  beforeEach( inject( function ( sessionService, $httpBackend, $cookies, $rootScope ) {
    self.sessionService = sessionService;
    self.$httpBackend = $httpBackend;
    self.$cookies = $cookies;
    self.$rootScope = $rootScope;
  } ) );

  afterEach( () => {
    ['cortex-session', 'give-session', 'cru-session'].forEach( ( name ) => {
      self.$cookies.remove( name );
    } );
  } );

  it( 'to be defined', () => {
    expect( self.sessionService ).toBeDefined();
  } );

  describe( 'session', () => {
    it( 'to be defined', () => {
      expect( self.sessionService.session ).toBeDefined();
    } );

    describe( 'session with \'REGISTERED\' cortex-session', () => {
      beforeEach( () => {
        self.$cookies.put( 'cortex-session', cortexSession.registered );
        // Force digest so scope session watchers pick up changes.
        self.$rootScope.$digest();
      } );

      it( 'have properties', () => {
        expect( self.sessionService.session ).toEqual( {
          "exp":        1477232207,
          "iat":        1472221008,
          "sub":        "cas|873f88fa-327b-b95d-7d7a-7add211a9b64",
          "first_name": "Charles",
          "last_name":  "Xavier",
          "email":      "professorx@xavier.edu",
          "token_hash": {
            "access_token": "1a0e2d05-5999-4fd6-a06f-f43c1b2ea8b0",
            "role":         "REGISTERED"
          }
        } );
      } );

      describe( 'change to \'IDENTIFIED\' cortex-session', () => {
        beforeEach( () => {
          self.$cookies.put( 'cortex-session', cortexSession.identified );
          // Force digest so scope session watchers pick up changes.
          self.$rootScope.$digest();
        } );

        it( 'reflects changes', () => {
          expect( self.sessionService.session ).toEqual( {
            "exp":        1477232207,
            "iat":        1472221008,
            "sub":        "cas|873f88fa-327b-b95d-7d7a-7add211a9b64",
            "first_name": "Charles",
            "last_name":  "Xavier",
            "email":      "professorx@xavier.edu",
            "token_hash": {
              "access_token": "1a0e2d05-5999-4fd6-a06f-f43c1b2ea8b0",
              "role":         "IDENTIFIED"
            }
          } );
        } );
      } );
    } );
  } );

  describe( 'sessionSubject', ()=> {
    it( 'to be defined', () => {
      expect( self.sessionService.sessionSubject ).toBeDefined();
    } );
  } );

  describe( 'getRole', () => {
    it( 'to be defined', () => {
      expect( self.sessionService.getRole ).toBeDefined();
    } );

    it( 'returns \'PUBLIC\' if no session exists', () => {
      expect( self.sessionService.getRole() ).toEqual( 'PUBLIC' );
    } );

    describe( 'with \'PUBLIC\' cortex-session', () => {
      beforeEach( () => {
        self.$cookies.put( 'cortex-session', cortexSession.public );
        // Force digest so scope session watchers pick up changes.
        self.$rootScope.$digest();
      } );

      it( 'returns \'PUBLIC\'', () => {
        expect( self.sessionService.getRole() ).toEqual( 'PUBLIC' );
      } );
    } );

    describe( 'with \'IDENTIFIED\' cortex-session', () => {
      beforeEach( () => {
        self.$cookies.put( 'cortex-session', cortexSession.identified );
        // Force digest so scope session watchers pick up changes.
        self.$rootScope.$digest();
      } );

      it( 'returns \'IDENTIFIED\'', () => {
        expect( self.sessionService.getRole() ).toEqual( 'IDENTIFIED' );
      } );
    } );

    describe( 'getRole with \'REGISTERED\' cortex-session', () => {
      beforeEach( () => {
        self.$cookies.put( 'cortex-session', cortexSession.registered );
        // Force digest so scope session watchers pick up changes.
        self.$rootScope.$digest();
      } );

      it( 'returns \'IDENTIFIED\' with expired give-session', () => {
        expect( self.sessionService.getRole() ).toEqual( 'IDENTIFIED' );
      } );

      describe( 'with \'REGISTERED\' give-session', () => {
        beforeEach( () => {
          self.$cookies.put( 'give-session', giveSession );
          // Force digest so scope session watchers pick up changes.
          self.$rootScope.$digest();
        } );

        it( 'returns \'REGISTERED\'', () => {
          expect( self.sessionService.getRole() ).toEqual( 'REGISTERED' );
        } );
      } );
    } );
  } );

  describe( 'signIn', () => {
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

  describe( 'signUp', () => {
    it( 'makes http request to cas/register', () => {
      self.$httpBackend.expectPOST( 'https://cortex-gateway-stage.cru.org/cas/register', {
        email:     'professorx@xavier.edu',
        password:  'Cerebro123',
        firstName: 'Charles',
        lastName:  'Xavier'
      } ).respond( 200, {} );
      self.sessionService
        .signUp( 'professorx@xavier.edu', 'Cerebro123', 'Charles', 'Xavier' )
        .subscribe( ( data ) => {
          expect( data ).toEqual( {} );
        } );
      self.$httpBackend.flush();
    } );
  } );

  describe( 'signOut', () => {
    it( 'makes http request to cas/logout', () => {
      self.$httpBackend.expectDELETE( 'https://cortex-gateway-stage.cru.org/cas/logout' )
        .respond( 200, {} );
      self.sessionService
        .signOut()
        .then( ( response ) => {
          expect( response.data ).toEqual( {} );
        } );
      self.$httpBackend.flush();
    } );
  } );

  describe( 'forgotPassword', () => {
    it( 'makes http request to cas/send_forgot_password_email', () => {
      self.$httpBackend.expectPOST( 'https://cortex-gateway-stage.cru.org/cas/send_forgot_password_email', {
        email:            'professorx@xavier.edu',
        passwordResetUrl: 'http://example.com/index.html?theme=cru#reset-password'
      } ).respond( 200, {} );
      self.sessionService
        .forgotPassword( 'professorx@xavier.edu', 'http://example.com/index.html?theme=cru#reset-password' )
        .subscribe( ( data ) => {
          expect( data ).toEqual( {} );
        } );
      self.$httpBackend.flush();
    } );
  } );

  describe( 'resetPassword', () => {
    it( 'makes http request to cas/reset_password', () => {
      self.$httpBackend.expectPOST( 'https://cortex-gateway-stage.cru.org/cas/reset_password', {
        email:    'professorx@xavier.edu',
        password: 'Cerebro123',
        resetKey: 'abc123def456'
      } ).respond( 200, {} );
      self.sessionService
        .resetPassword( 'professorx@xavier.edu', 'Cerebro123', 'abc123def456' )
        .subscribe( ( data ) => {
          expect( data ).toEqual( {} );
        } );
      self.$httpBackend.flush();
    } );
  } );
} );

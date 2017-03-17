import angular from 'angular';
import 'angular-mocks';
import module from './session.service';
import {cortexSession} from './fixtures/cortex-session';
import {giveSession} from './fixtures/give-session';

import {Roles, Sessions, SignOutEvent} from './session.service';

describe( 'session service', function () {
  beforeEach( angular.mock.module( function ( $provide ) {
    $provide.decorator( '$timeout', function ( $delegate ) {
      return jasmine.createSpy( '$timeout', $delegate ).and.callThrough();
    } );
  } ) );

  beforeEach( angular.mock.module( module.name ) );
  let sessionService, $httpBackend, $cookies, $rootScope;

  beforeEach( inject( function ( _sessionService_, _$httpBackend_, _$cookies_, _$rootScope_ ) {
    sessionService = _sessionService_;
    $httpBackend = _$httpBackend_;
    $cookies = _$cookies_;
    $rootScope = _$rootScope_;
  } ) );

  afterEach( () => {
    [Sessions.cortex, Sessions.give, Sessions.cru].forEach( ( name ) => {
      $cookies.remove( name );
    } );
  } );

  it( 'to be defined', () => {
    expect( sessionService ).toBeDefined();
  } );

  describe( 'session', () => {
    it( 'to be defined', () => {
      expect( sessionService.session ).toBeDefined();
    } );

    describe( 'session with \'REGISTERED\' cortex-session', () => {
      beforeEach( () => {
        $cookies.put( Sessions.cortex, cortexSession.registered );
        // Force digest so scope session watchers pick up changes.
        $rootScope.$digest();
      } );

      it( 'have properties', () => {
        expect( sessionService.session ).toEqual( {
          "exp":        1477232207,
          "iat":        1472221008,
          "sub":        "cas|873f88fa-327b-b95d-7d7a-7add211a9b64",
          "first_name": "Charles",
          "last_name":  "Xavier",
          "email":      "professorx@xavier.edu",
          "token_hash": {
            "access_token": "1a0e2d05-5999-4fd6-a06f-f43c1b2ea8b0",
            "role":         Roles.registered
          }
        } );
      } );

      describe( 'change to \'IDENTIFIED\' cortex-session', () => {
        beforeEach( () => {
          $cookies.put( Sessions.cortex, cortexSession.identified );
          // Force digest so scope session watchers pick up changes.
          $rootScope.$digest();
        } );

        it( 'reflects changes', () => {
          expect( sessionService.session ).toEqual( {
            "exp":        1477232207,
            "iat":        1472221008,
            "sub":        "cas|873f88fa-327b-b95d-7d7a-7add211a9b64",
            "first_name": "Charles",
            "last_name":  "Xavier",
            "email":      "professorx@xavier.edu",
            "token_hash": {
              "access_token": "1a0e2d05-5999-4fd6-a06f-f43c1b2ea8b0",
              "role":         Roles.identified
            }
          } );
        } );
      } );
    } );
  } );

  describe( 'sessionSubject', () => {
    it( 'to be defined', () => {
      expect( sessionService.sessionSubject ).toBeDefined();
    } );
  } );

  describe( 'getRole', () => {
    it( 'to be defined', () => {
      expect( sessionService.getRole ).toBeDefined();
    } );

    it( 'returns \'PUBLIC\' if no session exists', () => {
      expect( sessionService.getRole() ).toEqual( Roles.public );
    } );

    describe( 'with \'PUBLIC\' cortex-session', () => {
      beforeEach( () => {
        $cookies.put( Sessions.cortex, cortexSession.public );
        // Force digest so scope session watchers pick up changes.
        $rootScope.$digest();
      } );

      it( 'returns \'PUBLIC\'', () => {
        expect( sessionService.getRole() ).toEqual( Roles.public );
      } );
    } );

    describe( 'with \'IDENTIFIED\' cortex-session', () => {
      beforeEach( () => {
        $cookies.put( Sessions.cortex, cortexSession.identified );
        // Force digest so scope session watchers pick up changes.
        $rootScope.$digest();
      } );

      it( 'returns \'IDENTIFIED\'', () => {
        expect( sessionService.getRole() ).toEqual( Roles.identified );
      } );
    } );

    describe( 'getRole with \'REGISTERED\' cortex-session', () => {
      beforeEach( () => {
        $cookies.put( Sessions.cortex, cortexSession.registered );
        // Force digest so scope session watchers pick up changes.
        $rootScope.$digest();
      } );

      it( 'returns \'IDENTIFIED\' with expired give-session', () => {
        expect( sessionService.getRole() ).toEqual( Roles.identified );
      } );

      describe( 'with \'REGISTERED\' give-session', () => {
        beforeEach( () => {
          $cookies.put( Sessions.give, giveSession );
          // Force digest so scope session watchers pick up changes.
          $rootScope.$digest();
        } );

        it( 'returns \'REGISTERED\'', () => {
          expect( sessionService.getRole() ).toEqual( Roles.registered );
        } );
      } );
    } );
  } );

  describe( 'signIn', () => {
    it( 'makes http request to cas/login', () => {
      $httpBackend.expectPOST( 'https://give-stage2.cru.org/cas/login', {
        username: 'user@example.com',
        password: 'hello123'
      } ).respond( 200, 'success' );
      sessionService
        .signIn( 'user@example.com', 'hello123' )
        .subscribe( ( data ) => {
          expect( data ).toEqual( 'success' );
        } );
      $httpBackend.flush();
    } );
  } );

  describe( 'signUp', () => {
    it( 'makes http request to cas/register', () => {
      $httpBackend.expectPOST( 'https://give-stage2.cru.org/cas/register', {
        email:     'professorx@xavier.edu',
        password:  'Cerebro123',
        firstName: 'Charles',
        lastName:  'Xavier'
      } ).respond( 200, {} );
      sessionService
        .signUp( 'professorx@xavier.edu', 'Cerebro123', 'Charles', 'Xavier' )
        .subscribe( ( data ) => {
          expect( data ).toEqual( {} );
        } );
      $httpBackend.flush();
    } );
  } );

  describe( 'signOut', () => {
    it( 'makes http request to cas/logout', () => {
      $httpBackend.expectDELETE( 'https://give-stage2.cru.org/cas/logout' )
        .respond( 200, {} );
      sessionService
        .signOut()
        .then( ( response ) => {
          expect( response.data ).toEqual( {} );
        } );
      $httpBackend.flush();
    } );
  } );

  describe( 'forgotPassword', () => {
    it( 'makes http request to cas/send_forgot_password_email', () => {
      $httpBackend.expectPOST( 'https://give-stage2.cru.org/cas/send_forgot_password_email', {
        email:            'professorx@xavier.edu',
        passwordResetUrl: 'http://example.com/index.html?theme=cru#reset-password'
      } ).respond( 200, {} );
      sessionService
        .forgotPassword( 'professorx@xavier.edu', 'http://example.com/index.html?theme=cru#reset-password' )
        .subscribe( ( data ) => {
          expect( data ).toEqual( {} );
        } );
      $httpBackend.flush();
    } );
  } );

  describe( 'resetPassword', () => {
    it( 'makes http request to cas/reset_password', () => {
      $httpBackend.expectPOST( 'https://give-stage2.cru.org/cas/reset_password', {
        email:    'professorx@xavier.edu',
        password: 'Cerebro123',
        resetKey: 'abc123def456'
      } ).respond( 200, {} );
      sessionService
        .resetPassword( 'professorx@xavier.edu', 'Cerebro123', 'abc123def456' )
        .subscribe( ( data ) => {
          expect( data ).toEqual( {} );
        } );
      $httpBackend.flush();
    } );
  } );

  describe( 'downgradeToGuest( skipEvent )', () => {
    beforeEach( () => {
      spyOn( $rootScope, '$broadcast' );
    } );

    describe( 'with \'PUBLIC\' role', () => {
      it( 'throws error', () => {
        sessionService.downgradeToGuest().subscribe( angular.noop, ( error ) => {
          expect( error ).toBeDefined();
        } );
        expect( $rootScope.$broadcast ).toHaveBeenCalledWith( SignOutEvent );
      } );
    } );

    describe( 'with \'IDENTIFIED\' role', () => {
      beforeEach( () => {
        $cookies.put( Sessions.cortex, cortexSession.identified );
        // Force digest so scope session watchers pick up changes.
        $rootScope.$digest();
      } );

      it( 'make http request to cas/downgrade', ( done ) => {
        $httpBackend.expectPOST( 'https://give-stage2.cru.org/cas/downgrade', {} ).respond( 204, {} );
        sessionService.downgradeToGuest().subscribe( ( data ) => {
          expect( data ).toEqual( {} );
        } );
        $rootScope.$digest();
        // Observable.finally is fired after the test, this defers until it's called.
        // eslint-disable-next-line angular/timeout-service
        setTimeout( () => {
          expect( $rootScope.$broadcast ).toHaveBeenCalledWith( SignOutEvent );
          done();
        } );
        $httpBackend.flush();
      } );
    } );

    describe( 'with skipEvent = true', () => {
      beforeEach( () => {
        $cookies.put( Sessions.cortex, cortexSession.identified );
        // Force digest so scope session watchers pick up changes.
        $rootScope.$digest();
      } );

      it( 'make http request to cas/downgrade', ( done ) => {
        $httpBackend.expectPOST( 'https://give-stage2.cru.org/cas/downgrade', {} ).respond( 204, {} );
        sessionService.downgradeToGuest( true ).subscribe( ( data ) => {
          expect( data ).toEqual( {} );
        } );
        $rootScope.$digest();
        // Observable.finally is fired after the test, this defers until it's called.
        // eslint-disable-next-line angular/timeout-service
        setTimeout( () => {
          expect( $rootScope.$broadcast ).not.toHaveBeenCalled();
          done();
        } );
        $httpBackend.flush();
      } );
    } );
  } );

  describe( 'session expiration', () => {
    let $timeout;
    beforeEach( inject( ( _$timeout_ ) => {
      $timeout = _$timeout_;
      jasmine.clock().install();
      jasmine.clock().mockDate( new Date( 2016, 1, 1 ) );
    } ) );

    afterEach( () => {
      $timeout.verifyNoPendingTasks();
      jasmine.clock().uninstall();
    } );

    describe( 'undefined \'give-session\'', () => {
      beforeEach( () => {
        $cookies.put( Sessions.cortex, cortexSession.registered );
        $rootScope.$digest();
      } );

      it( 'does not set sessionTimeout', () => {
        expect( $timeout ).not.toHaveBeenCalled();
      } );
    } );

    describe( '\'give-session\' with 10 seconds until expiration', () => {
      beforeEach( () => {
        // Encode cookie as JWT
        $cookies.put( Sessions.give, '.' + btoa( angular.toJson( {
            exp: Math.round( Date.now() / 1000 ) + 10
          } ) ) + '.' );
        $cookies.put( Sessions.cortex, cortexSession.registered );
        $rootScope.$digest();
      } );

      it( 'sets sessionTimeout', () => {
        expect( $timeout ).toHaveBeenCalledWith( 10000 );
        jasmine.clock().tick( 10001 );
        $timeout.flush( 10001 );
        expect( $timeout ).toHaveBeenCalledTimes( 1 );
      } );
    } );

    describe( '\'give-session\' with 45 seconds until expiration', () => {
      beforeEach( () => {
        // Encode cookie as JWT
        $cookies.put( Sessions.give, '.' + btoa( angular.toJson( {
            exp: Math.round( Date.now() / 1000 ) + 45
          } ) ) + '.' );
        $cookies.put( Sessions.cortex, cortexSession.registered );
        $rootScope.$digest();
      } );

      it( 'sets sessionTimeout twice', () => {
        expect( $timeout ).toHaveBeenCalledWith( 30000 );
        jasmine.clock().tick( 30001 );
        $timeout.flush( 30001 );
        expect( $timeout ).toHaveBeenCalledWith( 14999 );
        jasmine.clock().tick( 15000 );
        $timeout.flush( 15000 );
        expect( $timeout ).toHaveBeenCalledTimes( 2 );
      } );

      describe( '\'cortex-session\' updated', () => {
        beforeEach( () => {
          spyOn( $timeout, 'cancel' ).and.callThrough();
          jasmine.clock().tick( 10000 );
          $timeout.flush( 10000 );
          $cookies.put( Sessions.cortex, cortexSession.identified );
          $rootScope.$digest();
        } );

        it( 'cancels existing sessionTimeout', () => {
          expect( $timeout.cancel ).toHaveBeenCalled();
          jasmine.clock().tick( 90000 );
          $timeout.flush( 90000 );
          expect( $timeout ).toHaveBeenCalledTimes( 2 );
        } );
      } );
    } );
  } );
} );

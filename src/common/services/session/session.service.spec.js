import angular from 'angular';
import 'angular-mocks';
import module from './session.service';
import {cortexRole} from 'common/services/session/fixtures/cortex-role';
import {giveSession} from 'common/services/session/fixtures/give-session';
import {cruProfile} from 'common/services/session/fixtures/cru-profile';

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
    [Sessions.role, Sessions.give, Sessions.profile].forEach( ( name ) => {
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
        $cookies.put( Sessions.role, cortexRole.registered );
        $cookies.put( Sessions.profile, cruProfile );
        // Force digest so scope session watchers pick up changes.
        $rootScope.$digest();
      } );

      it( 'have properties', () => {
        expect( sessionService.session ).toEqual( {
          sub: 'cas|873f88fa-327b-b95d-7d7a-7add211a9b64',
          role: 'REGISTERED',
          first_name: 'Charles',
          last_name: 'Xavier',
          email: 'professorx@xavier.edu'
        } );
      } );

      describe( 'change to \'IDENTIFIED\' cortex-session', () => {
        beforeEach( () => {
          $cookies.put( Sessions.role, cortexRole.identified );
          // Force digest so scope session watchers pick up changes.
          $rootScope.$digest();
        } );

        it( 'reflects changes', () => {
          expect( sessionService.session ).toEqual( {
            sub: 'cas|873f88fa-327b-b95d-7d7a-7add211a9b64',
            role: 'IDENTIFIED',
            first_name: 'Charles',
            last_name: 'Xavier',
            email: 'professorx@xavier.edu'
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
        $cookies.put( Sessions.role, cortexRole.public );
        // Force digest so scope session watchers pick up changes.
        $rootScope.$digest();
      } );

      it( 'returns \'PUBLIC\'', () => {
        expect( sessionService.getRole() ).toEqual( Roles.public );
      } );
    } );

    describe( 'with \'IDENTIFIED\' cortex-session', () => {
      beforeEach( () => {
        $cookies.put( Sessions.role, cortexRole.identified );
        // Force digest so scope session watchers pick up changes.
        $rootScope.$digest();
      } );

      it( 'returns \'IDENTIFIED\'', () => {
        expect( sessionService.getRole() ).toEqual( Roles.identified );
      } );
    } );

    describe( 'getRole with \'REGISTERED\' cortex-session', () => {
      beforeEach( () => {
        $cookies.put( Sessions.role, cortexRole.registered );
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
    it( 'makes http request to cas/login without mfa', () => {
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

    it( 'makes http request to cas/login with mfa', () => {
      $httpBackend.expectPOST( 'https://give-stage2.cru.org/cas/login', {
        username: 'user@example.com',
        password: 'hello123',
        mfa_token: '123456'
      } ).respond( 200, 'success' );
      sessionService
        .signIn( 'user@example.com', 'hello123', '123456' )
        .subscribe( ( data ) => {
          expect( data ).toEqual( 'success' );
        } );
      $httpBackend.flush();
    } );

    it( 'makes http request to cas/login with mfa and trust_device', () => {
      $httpBackend.expectPOST( 'https://give-stage2.cru.org/cas/login', {
        username: 'user@example.com',
        password: 'hello123',
        mfa_token: '123456',
        trust_device: '1'
      } ).respond( 200, 'success' );
      sessionService
        .signIn( 'user@example.com', 'hello123', '123456', true )
        .subscribe( ( data ) => {
          expect( data ).toEqual( 'success' );
        } );
      $httpBackend.flush();
    } );

    it( 'includes lastPurchaseId when present and PUBLIC', () => {
      spyOn( sessionService, 'getRole' ).and.returnValue(Roles.public);
      $httpBackend.expectPOST( 'https://give-stage2.cru.org/cas/login', {
        username: 'user@example.com',
        password: 'hello123',
        lastPurchaseId: 'gxbcdviu='
      } ).respond( 200, 'success' );
      sessionService
        .signIn( 'user@example.com', 'hello123', undefined, undefined, 'gxbcdviu=' )
        .subscribe( ( data ) => {
          expect( data ).toEqual( 'success' );
        } );
      $httpBackend.flush();
    });
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
        .subscribe( ( response ) => {
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
    it( 'makes http request to cas/reset_password and then sign in', () => {
      $httpBackend.expectPOST( 'https://give-stage2.cru.org/cas/reset_password', {
        email:    'professorx@xavier.edu',
        password: 'Cerebro123',
        resetKey: 'abc123def456'
      } ).respond( 200, {} );
      $httpBackend.expectPOST( 'https://give-stage2.cru.org/cas/login', {
        username: 'professorx@xavier.edu',
        password: 'Cerebro123'
      } ).respond( 200, 'success' );
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
        $cookies.put( Sessions.role, cortexRole.identified );
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
        $cookies.put( Sessions.role, cortexRole.identified );
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
        $cookies.put( Sessions.role, cortexRole.registered );
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
        $cookies.put( Sessions.role, cortexRole.registered );
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
        $cookies.put( Sessions.role, cortexRole.registered );
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
          $cookies.put( Sessions.role, cortexRole.identified );
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

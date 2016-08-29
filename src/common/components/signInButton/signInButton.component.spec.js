import angular from 'angular';
import 'angular-mocks';
import module from './signInButton.component';

describe( 'signInButton', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl, $rootScope;

  beforeEach( inject( function ( _$componentController_, _$rootScope_ ) {
    $rootScope = _$rootScope_;
    $ctrl = _$componentController_( module.name,
      {$window: {location: jasmine.createSpyObj( 'location', ['reload'] )}}
    );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
  } );

  describe( 'isSignedIn', () => {
    describe( 'with \'REGISTERED\' cortex-session', () => {
      beforeEach( () => {
        spyOn( $ctrl.sessionService, 'getRole' ).and.returnValue( 'REGISTERED' );
        $ctrl.$onInit();
      } );

      afterEach( () => {
        $ctrl.$onDestroy();
      } );

      it( 'has true value', () => {
        expect( $ctrl.isSignedIn ).toEqual( true );
      } );
    } );

    describe( 'with \'GUEST\' cortex-session', () => {
      beforeEach( () => {
        spyOn( $ctrl.sessionService, 'getRole' ).and.returnValue( 'GUEST' );
        $ctrl.$onInit();
      } );

      afterEach( () => {
        $ctrl.$onDestroy();
      } );

      it( 'has false value', () => {
        expect( $ctrl.isSignedIn ).toEqual( false );
      } );
    } );
  } );

  describe( 'signIn', () => {
    let deferred;
    beforeEach( inject( function ( _$q_ ) {
      deferred = _$q_.defer();
      spyOn( $ctrl.sessionModalService, 'signIn' ).and.callFake( () => deferred.promise );
      $ctrl.signIn();
    } ) );

    it( 'opens signIn Modal', () => {
      expect( $ctrl.sessionModalService.signIn ).toHaveBeenCalled();
    } );

    it( 'reloads window on success', () => {
      deferred.resolve();
      $rootScope.$digest();
      expect( $ctrl.$window.location.reload ).toHaveBeenCalled();
    } );

    it( 'does nothing on failure', () => {
      deferred.reject();
      $rootScope.$digest();
      expect( $ctrl.$window.location.reload ).not.toHaveBeenCalled();
    } );
  } );

  describe( 'signOut', () => {
    let deferred;
    beforeEach( inject( function ( _$q_ ) {
      deferred = _$q_.defer();
      spyOn( $ctrl.sessionService, 'signOut' ).and.callFake( () => deferred.promise );
      $ctrl.signOut();
    } ) );

    it( 'calls sessionService.signOut', () => {
      expect( $ctrl.sessionService.signOut ).toHaveBeenCalled();
    } );

    it( 'reloads window on success', () => {
      deferred.resolve();
      $rootScope.$digest();
      expect( $ctrl.$window.location.reload ).toHaveBeenCalled();
    } );

    it( 'does nothing on failure', () => {
      deferred.reject();
      $rootScope.$digest();
      expect( $ctrl.$window.location.reload ).not.toHaveBeenCalled();
    } );
  } );
} );

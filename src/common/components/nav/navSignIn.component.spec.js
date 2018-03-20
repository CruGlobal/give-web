import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import module from './navSignIn.component';

describe( 'nav signIn', function () {
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
      spyOn( $ctrl, '$timeout' ).and.callThrough();
      deferred.resolve();
      $rootScope.$digest();
      expect( $ctrl.$timeout ).toHaveBeenCalled();
      $ctrl.$timeout.flush();
      expect( $ctrl.$window.location.reload ).toHaveBeenCalled();
    } );

    it( 'does nothing on failure', () => {
      deferred.reject();
      $rootScope.$digest();
      expect( $ctrl.$window.location.reload ).not.toHaveBeenCalled();
    } );
  } );

  describe( 'signOut', () => {
    it( 'calls downgradeToGuest()', () => {
      let modalSpy = jasmine.createSpyObj('modal', ['close']);
      spyOn( $ctrl.sessionService, 'downgradeToGuest' ).and.returnValue( Observable.of( {} ) );
      spyOn($ctrl.$uibModal, 'open').and.returnValue(modalSpy);
      $ctrl.signOut();
      expect( $ctrl.$uibModal.open ).toHaveBeenCalled();
      expect( $ctrl.sessionService.downgradeToGuest ).toHaveBeenCalled();
      expect( modalSpy.close ).toHaveBeenCalled();
    } );
  } );

  describe( 'signedOut( event )', () => {
    beforeEach( () => {
      spyOn( $ctrl, '$timeout' ).and.callThrough();
    } );

    describe( 'default prevented', () => {
      it( 'does nothing', () => {
        $ctrl.signedOut( {defaultPrevented: true} );
        expect( $ctrl.$timeout ).not.toHaveBeenCalled();
      } );
    } );

    describe( 'default not prevented', () => {
      it( 'reloads', () => {
        $ctrl.signedOut( {defaultPrevented: false} );
        expect( $ctrl.$timeout ).toHaveBeenCalledWith( jasmine.any( Function ) );
        $ctrl.$timeout.flush();
        expect( $ctrl.$window.location.reload ).toHaveBeenCalled();
      } );
    } );
  } );
} );

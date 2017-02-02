import angular from 'angular';
import 'angular-mocks';
import module from './signIn.component';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

describe( 'signIn', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl;

  beforeEach( inject( function ( _$componentController_ ) {
    $ctrl = _$componentController_( module.name,
      {$window: {location: '/sign-in.html'}}
    );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
  } );

  describe( 'as \'GUEST\'', () => {
    beforeEach( () => {
      spyOn( $ctrl.sessionService, 'getRole' ).and.returnValue( 'GUEST' );
      spyOn( $ctrl, 'sessionChanged' ).and.callThrough();
      $ctrl.$onInit();
    } );

    afterEach( () => {
      $ctrl.$onDestroy();
    } );

    it( 'has does not change location', () => {
      expect( $ctrl.sessionChanged ).toHaveBeenCalled();
      expect( $ctrl.$window.location ).toEqual( '/sign-in.html' );
    } );
  } );

  describe( 'as \'IDENTIFIED\'', () => {
    beforeEach( () => {
      spyOn( $ctrl.sessionService, 'getRole' ).and.returnValue( 'IDENTIFIED' );
      spyOn( $ctrl, 'sessionChanged' ).and.callThrough();
      $ctrl.$onInit();
    } );

    afterEach( () => {
      $ctrl.$onDestroy();
    } );

    it( 'has does not change location', () => {
      expect( $ctrl.sessionChanged ).toHaveBeenCalled();
      expect( $ctrl.$window.location ).toEqual( '/sign-in.html' );
    } );
  } );

  describe( 'as \'REGISTERED\'', () => {
    beforeEach( () => {
      spyOn( $ctrl.sessionService, 'getRole' ).and.returnValue( 'REGISTERED' );
      spyOn( $ctrl, 'sessionChanged' ).and.callThrough();
      $ctrl.$onInit();
    } );

    afterEach( () => {
      $ctrl.$onDestroy();
    } );

    it( 'navigates to checkout', () => {
      expect( $ctrl.sessionChanged ).toHaveBeenCalled();
      expect( $ctrl.$window.location ).toEqual( '/checkout.html' );
    } );
  } );

  describe( 'checkoutAsGuest()', () => {
    describe( 'downgradeToGuest success', () => {
      it( 'navigates to checkout', () => {
        spyOn( $ctrl.sessionService, 'downgradeToGuest' ).and.returnValue( Observable.of( {} ) );
        $ctrl.checkoutAsGuest();
        expect( $ctrl.$window.location ).toEqual( '/checkout.html' );
      } );
    } );
    describe( 'downgradeToGuest failure', () => {
      it( 'navigates to checkout', () => {
        spyOn( $ctrl.sessionService, 'downgradeToGuest' ).and.returnValue( Observable.throw( {} ) );
        $ctrl.checkoutAsGuest();
        expect( $ctrl.$window.location ).toEqual( '/checkout.html' );
      } );
    } );
  } );

  describe( 'resetPassword()', () => {
    let deferred;
    beforeEach( inject( function ( _$q_ ) {
      deferred = _$q_.defer();
      spyOn( $ctrl.sessionModalService, 'forgotPassword' ).and.callFake( () => deferred.promise );
      $ctrl.resetPassword();
    } ) );

    it( 'opens reset password modal', () => {
      expect( $ctrl.sessionModalService.forgotPassword ).toHaveBeenCalled();
    } );
  } );
} );

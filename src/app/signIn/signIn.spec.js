import angular from 'angular';
import 'angular-mocks';
import module from './signIn.component';

describe( 'signIn', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl;

  beforeEach( inject( function ( _$componentController_ ) {
    $ctrl = _$componentController_( module.name,
      {$window: {location: {href: 'sign-in.html'}}}
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
      expect( $ctrl.$window.location.href ).toEqual( 'sign-in.html' );
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
      expect( $ctrl.$window.location.href ).toEqual( 'sign-in.html' );
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
      expect( $ctrl.$window.location.href ).toEqual( 'checkout.html' );
    } );
  } );

} );

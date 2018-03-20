import angular from 'angular';
import 'angular-mocks';
import module from './navCartIcon.component';

import {giftAddedEvent, cartUpdatedEvent} from 'common/components/nav/navCart/navCart.component';

describe( 'nav cart icon', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl;

  beforeEach( inject( function ( _$componentController_ ) {
    $ctrl = _$componentController_( module.name );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
  } );

  it( '$onInit()', () => {
    spyOn( $ctrl.$rootScope, '$on' );
    spyOn( $ctrl, 'giftAddedToCart' );

    $ctrl.$onInit();
    expect( $ctrl.$rootScope.$on ).toHaveBeenCalledWith( giftAddedEvent, jasmine.any( Function ) );
    $ctrl.$rootScope.$on.calls.argsFor( 0 )[1]();
    expect( $ctrl.giftAddedToCart ).toHaveBeenCalled();
  } );

  describe( 'giftAddedToCart()', () => {
    it( 'opens nav cart when giftAdded', () => {
      $ctrl.giftAddedToCart();
      expect( $ctrl.cartOpen ).toEqual( true );
    } );
  } );

  describe( 'cartOpened()', () => {
    beforeEach( () => {
      spyOn( $ctrl.$rootScope, '$emit' );
    } );

    it( 'should send event to load cart if nav cart hasn\'t been opened before', () => {
      $ctrl.cartOpened();
      expect( $ctrl.cartOpenedPreviously ).toEqual( true );
      expect($ctrl.$rootScope.$emit).toHaveBeenCalledWith(cartUpdatedEvent);
    } );

    it( 'should not send event to load cart if nav cart has been opened before', () => {
      $ctrl.cartOpenedPreviously = true;
      $ctrl.cartOpened();
      expect( $ctrl.cartOpenedPreviously ).toEqual( true );
      expect($ctrl.$rootScope.$emit).not.toHaveBeenCalled();
    } );
  } );
} );

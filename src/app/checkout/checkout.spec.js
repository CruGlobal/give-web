import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import module from './checkout.component';
import {Roles} from 'common/services/session/session.service';

describe( 'checkout', function () {
  beforeEach( angular.mock.module( module.name ) );
  var self = {};

  beforeEach( inject( function ( $componentController ) {
    self.controller = $componentController( module.name, {
      $window: {location: 'checkout.html', scrollTo: jasmine.createSpy( 'scrollTo' )}
    } );
  } ) );

  describe( 'changeStep', () => {
    it( 'should scroll to top and change the checkout step', () => {
      self.controller.changeStep( 'review' );
      expect( self.controller.$window.scrollTo ).toHaveBeenCalledWith( 0, 0 );
      expect( self.controller.checkoutStep ).toEqual( 'review' );
    } );
  } );

  describe( 'loadCart', () => {
    it( 'should load the card data', () => {
      spyOn( self.controller.cartService, 'get' ).and.callFake( () => Observable.of( 'cartData' ) );
      self.controller.loadCart();
      expect( self.controller.loadingCartData ).toEqual( false );
      expect( self.controller.cartData ).toEqual( 'cartData' );
    } );
    it( 'should still set loading to false on an error', () => {
      spyOn( self.controller.cartService, 'get' ).and.callFake( () => Observable.throw( 'some error' ) );
      self.controller.loadCart();
      expect( self.controller.loadingCartData ).toEqual( false );
      expect( self.controller.$log.error.logs[0] ).toEqual( ['Error loading cart', 'some error'] );
    } );
  } );

  it( 'to be defined', function () {
    expect( self.controller ).toBeDefined();
    expect( self.controller.checkoutStep ).toEqual( 'contact' );
    expect( self.controller.loadingCartData ).toEqual( true );
  } );

  describe( '$onInit()', () => {
    beforeEach( () => {
      spyOn( self.controller, 'loadCart' );
      spyOn( self.controller, 'sessionEnforcerService' );
      self.controller.$onInit();
    } );
    it( 'initializes the component', () => {
      expect( self.controller.sessionEnforcerService ).toHaveBeenCalledWith(
        [Roles.public, Roles.registered], jasmine.objectContaining( {
          'sign-in': jasmine.any( Function ),
          cancel:    jasmine.any( Function )
        } )
      );
      expect( self.controller.loadCart ).toHaveBeenCalled();
    } );

    describe( 'sessionEnforcerService success', () => {
      it( 'executes success callback', () => {
        self.controller.sessionEnforcerService.calls.argsFor( 0 )[1]['sign-in']();
        expect( self.controller.loadCart ).toHaveBeenCalledTimes( 2 );
      } );
    } );

    describe( 'sessionEnforcerService failure', () => {
      it( 'executes failure callback', () => {
        self.controller.sessionEnforcerService.calls.argsFor( 0 )[1]['cancel']();
        expect( self.controller.$window.location ).toEqual( 'cart.html' );
      } );
    } );
  } );

  describe( '$onDestroy()', () => {
    it( 'cleans up the component', () => {
      spyOn( self.controller.sessionEnforcerService, 'cancel' );
      self.controller.enforcerId = '1234567890';
      self.controller.$onDestroy();
      expect( self.controller.sessionEnforcerService.cancel ).toHaveBeenCalledWith( '1234567890' );
    } );
  } );
} );

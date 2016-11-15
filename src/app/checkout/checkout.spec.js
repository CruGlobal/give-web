import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import module from './checkout.component';
import {Roles, SignOutEvent} from 'common/services/session/session.service';

describe( 'checkout', function () {
  beforeEach( angular.mock.module( module.name ) );
  var self = {};

  beforeEach( inject( function ( $componentController ) {
    self.controller = $componentController( module.name, {
      $window: {location: '/checkout.html', scrollTo: jasmine.createSpy( 'scrollTo' )}
    } );
  } ) );

  it( 'to be defined', function () {
    expect( self.controller ).toBeDefined();
    expect( self.controller.loadingCartData ).toEqual( true );
    expect( self.controller.$rootScope ).toBeDefined();
  } );

  describe( '$onInit()', () => {
    beforeEach( () => {
      spyOn( self.controller, 'loadCart' );
      spyOn( self.controller, 'initStepParam' );
      spyOn( self.controller, 'sessionEnforcerService' );
      spyOn( self.controller.$rootScope, '$on' );
      spyOn( self.controller, 'signedOut' );
      self.controller.$onInit();
    } );
    it( 'initializes the component', () => {
      expect( self.controller.sessionEnforcerService ).toHaveBeenCalledWith(
        [Roles.public, Roles.registered], jasmine.objectContaining( {
          'sign-in': jasmine.any( Function ),
          cancel:    jasmine.any( Function )
        } )
      );
      expect( self.controller.loadCart ).not.toHaveBeenCalled();
      expect( self.controller.initStepParam ).toHaveBeenCalled();
      expect( self.controller.$rootScope.$on ).toHaveBeenCalledWith( SignOutEvent, jasmine.any( Function ) );
      self.controller.$rootScope.$on.calls.argsFor( 0 )[1]();
      expect( self.controller.signedOut ).toHaveBeenCalled();
    } );

    describe( 'sessionEnforcerService success', () => {
      it( 'executes success callback', () => {
        self.controller.sessionEnforcerService.calls.argsFor( 0 )[1]['sign-in']();
        expect( self.controller.loadCart ).toHaveBeenCalled();
      } );
    } );

    describe( 'sessionEnforcerService failure', () => {
      it( 'executes failure callback', () => {
        self.controller.sessionEnforcerService.calls.argsFor( 0 )[1]['cancel']();
        expect( self.controller.$window.location ).toEqual( '/cart.html' );
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
    it( 'unsubscribes from $locationChangeSuccess', () => {
      self.controller.$locationChangeSuccessListener = jasmine.createSpy( '$locationChangeSuccessListener' );
      self.controller.$onDestroy();
      expect( self.controller.$locationChangeSuccessListener ).toHaveBeenCalled();
    } );
  } );

  describe( 'initStepParam()', () => {
    beforeEach( () => {
      spyOn( self.controller.$location, 'search' ).and.callThrough();
      spyOn( self.controller.$location, 'replace' );
    } );

    it( 'should set the default step', () => {
      self.controller.initStepParam();
      expect( self.controller.checkoutStep ).toEqual( 'contact' );
      expect( self.controller.$location.search ).toHaveBeenCalledWith( 'step', 'contact' );
      expect( self.controller.$location.replace ).toHaveBeenCalled();
    } );

    it( 'should load the step from the query param', () => {
      self.controller.$location.search( 'step', 'payment' );
      self.controller.initStepParam();
      expect( self.controller.checkoutStep ).toEqual( 'payment' );
      expect( self.controller.$location.search ).toHaveBeenCalledWith( 'step', 'payment' );
      expect( self.controller.$location.replace ).toHaveBeenCalled();
    } );

    it( 'should watch the url and update the state', () => {
      self.controller.initStepParam();
      spyOn( self.controller, 'initStepParam' );
      self.controller.$location.search( 'step', 'payment' );
      self.controller.$rootScope.$digest();
      expect( self.controller.initStepParam ).toHaveBeenCalled();
    } );
  } );

  describe( 'signedOut( event )', () => {
    describe( 'default prevented', () => {
      it( 'does nothing', () => {
        self.controller.signedOut( {defaultPrevented: true} );
        expect( self.controller.$window.location ).toEqual( '/checkout.html' );
      } );
    } );

    describe( 'default not prevented', () => {
      it( 'navigates to \'\/\'', () => {
        let spy = jasmine.createSpy( 'preventDefault' );
        self.controller.signedOut( {defaultPrevented: false, preventDefault: spy} );
        expect( spy ).toHaveBeenCalled();
        expect( self.controller.$window.location ).toEqual( '/cart.html' );
      } );
    } );
  } );

  describe( 'changeStep', () => {
    it( 'should scroll to top and change the checkout step', () => {
      spyOn( self.controller.$location, 'search' );
      self.controller.changeStep( 'review' );
      expect( self.controller.$window.scrollTo ).toHaveBeenCalledWith( 0, 0 );
      expect( self.controller.checkoutStep ).toEqual( 'review' );
      expect( self.controller.$location.search ).toHaveBeenCalledWith( 'step', 'review' );
    } );
  } );

  describe( 'loadCart', () => {
    it( 'should load the card data', () => {
      spyOn( self.controller.cartService, 'get' ).and.returnValue( Observable.of( 'cartData' ) );
      self.controller.loadCart();
      expect( self.controller.loadingCartData ).toEqual( false );
      expect( self.controller.cartData ).toEqual( 'cartData' );
    } );
    it( 'should still set loading to false on an error', () => {
      spyOn( self.controller.cartService, 'get' ).and.returnValue( Observable.throw( 'some error' ) );
      self.controller.loadCart();
      expect( self.controller.loadingCartData ).toEqual( false );
      expect( self.controller.$log.error.logs[0] ).toEqual( ['Error loading cart', 'some error'] );
    } );
  } );
} );

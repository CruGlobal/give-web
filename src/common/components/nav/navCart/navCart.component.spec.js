import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import module, {giftAddedEvent, cartUpdatedEvent} from './navCart.component';

describe( 'navCart', () => {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl;

  beforeEach( inject( function( $componentController ) {
    $ctrl = $componentController( module.name, {
      $window: {
        location: {
          pathname: '/cart.html'
        }
      }
    });
  } ) );

  describe( '$onInit', () => {
    beforeEach(() => {
      spyOn($ctrl, 'loadCart');
      $ctrl.sessionService.sessionSubject = new Subject();
    });
    it('should initialize the mobile flag', () => {
      $ctrl.$onInit();
      expect($ctrl.mobile).toEqual(false);

      $ctrl.mobile = 'true';
      $ctrl.$onInit();
      expect($ctrl.mobile).toEqual(true);
    });
    it('should not call loadCart', () => {
      // Other events will notify this component that the cart needs to be loaded for the first time
      $ctrl.$onInit();
      expect($ctrl.loadCart).not.toHaveBeenCalled();
    });
    it('should setup event listeners to reload cart', () => {
      spyOn($ctrl.$rootScope, '$on');
      $ctrl.$onInit();
      expect($ctrl.loadCart).not.toHaveBeenCalled();
      expect( $ctrl.$rootScope.$on ).toHaveBeenCalledWith( giftAddedEvent, jasmine.any( Function ) );
      $ctrl.$rootScope.$on.calls.argsFor( 0 )[1]();
      expect($ctrl.loadCart).toHaveBeenCalledTimes(1);
      expect( $ctrl.$rootScope.$on ).toHaveBeenCalledWith( cartUpdatedEvent, jasmine.any( Function ) );
      $ctrl.$rootScope.$on.calls.argsFor( 1 )[1]();
      expect($ctrl.loadCart).toHaveBeenCalledTimes(2);
    });
    it('should setup the session subject event listener but not reload cart until another event has loaded it', () => {
      $ctrl.$onInit();
      $ctrl.sessionService.sessionSubject.next();
      expect($ctrl.loadCart).not.toHaveBeenCalled();
    });
    it('should setup the session subject event listener and reload cart if it has been loaded previously', () => {
      $ctrl.firstLoad = false;
      $ctrl.$onInit();
      expect($ctrl.loadCart).not.toHaveBeenCalled();
      $ctrl.sessionService.sessionSubject.next();
      expect($ctrl.loadCart).toHaveBeenCalled();
    });
  });

  describe( 'loadCart', () => {
    beforeEach(() => {
      spyOn($ctrl.cartService, 'get');
    });
    it('should load the cart data', () => {
      $ctrl.cartService.get.and.returnValue(Observable.of({ items: ['first item'] }));
      expect($ctrl.firstLoad).toEqual(true);
      $ctrl.loadCart();
      expect($ctrl.cartData).toEqual({ items: ['first item'] });
      expect($ctrl.loading).toEqual(false);
      expect($ctrl.hasItems).toEqual(true);
      expect($ctrl.error).toEqual(false);
      expect($ctrl.firstLoad).toEqual(false);
    });
    it('should handling loading a cart that has no items', () => {
      $ctrl.cartService.get.and.returnValue(Observable.of({}));
      $ctrl.loadCart();
      expect($ctrl.cartData).toEqual({});
      expect($ctrl.loading).toEqual(false);
      expect($ctrl.hasItems).toEqual(false);
      expect($ctrl.error).toEqual(false);
    });
    it('should handling an error loading the cart', () => {
      $ctrl.cartService.get.and.returnValue(Observable.throw('some error'));
      $ctrl.loadCart();
      expect($ctrl.loading).toEqual(false);
      expect($ctrl.hasItems).toEqual(false);
      expect($ctrl.error).toEqual(true);
      expect($ctrl.$log.error.logs[0]).toEqual(['Error loading nav cart items', 'some error']);
    });
  });

  describe( 'checkout', () => {
    it( 'should redirect to a sign-in', () => {
      spyOn( $ctrl.sessionService, 'getRole' ).and.returnValue( 'GUEST' );
      $ctrl.checkout();
      expect($ctrl.$window.location).toBe('/sign-in.html');
    } );
    it( 'should redirect to a checkout', () => {
      spyOn( $ctrl.sessionService, 'getRole' ).and.returnValue( 'REGISTERED' );
      $ctrl.checkout();
      expect($ctrl.$window.location).toBe('/checkout.html');
    } );
  } );
} );

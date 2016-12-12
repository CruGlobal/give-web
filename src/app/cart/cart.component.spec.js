import angular from 'angular';
import 'angular-mocks';
import module from './cart.component';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import {cartUpdatedEvent} from 'common/components/nav/navCart/navCart.component';

describe('cart', () => {
  beforeEach(angular.mock.module(module.name));
  let self = {};

  beforeEach(inject(function($componentController) {
    self.controller = $componentController(module.name, {
      cartService: {
        get: jasmine.createSpy('get'),
        loadCart: jasmine.createSpy('loadCart'),
        deleteItem: jasmine.createSpy('deleteItem')
      },
      productModalService: {
        configureProduct: () => {}
      },
      sessionService: {
        getRole: () => 'REGISTERED'
      },
      $window: {
        location: '/cart.html'
      }
    });

  }));

  it('to be defined', () => {
    expect(self.controller).toBeDefined();
  });

  describe('$onInit()', () => {
    it('should call loadCart()', () => {
      spyOn(self.controller, 'loadCart');
      self.controller.$onInit();
      expect(self.controller.loadCart).toHaveBeenCalledWith();
    });
  });

  describe('loadCart()', () => {
    it('should load cart data', () => {
      self.controller.cartService.get.and.returnValue( Observable.of( 'data' ) );
      self.controller.loadCart();
      expect(self.controller.cartService.get).toHaveBeenCalled();
      expect(self.controller.cartData).toEqual('data');
      expect(self.controller.loading).toEqual(false);
      expect(self.controller.updating).toEqual(false);
    });
    it('should reload cart data', () => {
      self.controller.cartService.get.and.returnValue( Observable.of( 'data' ) );
      self.controller.loadCart(true);
      expect(self.controller.cartService.get).toHaveBeenCalled();
      expect(self.controller.cartData).toEqual('data');
      expect(self.controller.loading).toEqual(false);
      expect(self.controller.updating).toEqual(false);
    });
    it('should handle an error loading cart data', () => {
      self.controller.cartData = 'previous data';
      self.controller.cartService.get.and.returnValue( Observable.throw( 'error' ) );
      self.controller.loadCart();
      expect(self.controller.cartService.get).toHaveBeenCalled();
      expect(self.controller.cartData).toEqual('previous data');
      expect(self.controller.loading).toEqual(false);
      expect(self.controller.updating).toEqual(false);
      expect(self.controller.error).toEqual({
        loading: true,
        updating: false
      });
      expect(self.controller.$log.error.logs[0]).toEqual(['Error loading cart', 'error']);
    });
    it('should handle an error reloading cart data', () => {
      self.controller.cartData = 'previous data';
      self.controller.cartService.get.and.returnValue( Observable.throw( 'error' ) );
      self.controller.loadCart(true);
      expect(self.controller.cartService.get).toHaveBeenCalled();
      expect(self.controller.cartData).toEqual('previous data');
      expect(self.controller.loading).toEqual(false);
      expect(self.controller.updating).toEqual(false);
      expect(self.controller.error).toEqual({
        loading: false,
        updating: true
      });
      expect(self.controller.$log.error.logs[0]).toEqual(['Error loading cart', 'error']);
    });
  });

  describe('removeItem()', () => {
    beforeEach(() => {
      spyOn( self.controller.$scope, '$emit' );
    });
    it('should remove item from cart', () => {
      self.controller.cartData = { items: [{uri: 'uri1'}, {uri: 'uri2'}] };
      spyOn(self.controller, 'loadCart');
      self.controller.cartService.deleteItem.and.returnValue( Observable.of( 'data' ) );
      self.controller.removeItem(self.controller.cartData.items[0]);
      expect(self.controller.cartService.deleteItem).toHaveBeenCalledWith('uri1');
      expect(self.controller.loadCart).toHaveBeenCalledWith(true);
      expect(self.controller.cartData.items).toEqual([{uri: 'uri2'}]);
      expect(self.controller.$scope.$emit).toHaveBeenCalledWith( cartUpdatedEvent );
    });
    it('should handle an error removing an item', () => {
      self.controller.cartData = { items: [{uri: 'uri1'}, {uri: 'uri2'}] };
      self.controller.cartService.deleteItem.and.returnValue( Observable.throw( 'error' ) );
      self.controller.removeItem(self.controller.cartData.items[0]);
      expect(self.controller.cartService.deleteItem).toHaveBeenCalledWith('uri1');
      expect(self.controller.cartData.items).toEqual([{uri: 'uri1', removingError: true}, {uri: 'uri2'}]);
      expect(self.controller.$log.error.logs[0]).toEqual(['Error deleting item from cart', 'error']);
      expect(self.controller.$scope.$emit).not.toHaveBeenCalled();
    });
  });

  describe('editItem()', () => {
    beforeEach(() => {
      self.controller.callback = () => {
        return {
          result: {
            then: function(callback) {
              callback({isUpdated: true});
            }
          }
        };
      };
      spyOn(self.controller, 'loadCart');
      spyOn(self.controller.productModalService, 'configureProduct').and.callFake(self.controller.callback);
      self.controller.cartData = { items: [{ code: '0123456', config: 'some config', uri: 'uri1'}, {uri: 'uri2'}] };
    });

    it('should call a modal and reload cart of successful edit', () => {
      self.controller.isUpdated = true;

      self.controller.editItem(self.controller.cartData.items[0]);
      expect(self.controller.productModalService.configureProduct).toHaveBeenCalledWith('0123456', 'some config', true, 'uri1');
      expect(self.controller.loadCart).toHaveBeenCalledWith(true);
      expect(self.controller.cartData.items).toEqual([{uri: 'uri2'}]);
    });

  });

  describe('checkout()', () => {
    it('should return uri', () => {
      self.controller.checkout();
      expect(self.controller.$window.location).toBe('/checkout.html');
      self.controller.sessionService.getRole = () => 'foo';
      self.controller.checkout();
      expect(self.controller.$window.location).toBe('/sign-in.html');
    });
  });
});

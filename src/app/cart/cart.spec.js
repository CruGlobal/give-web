import angular from 'angular';
import 'angular-mocks';
import module from './cart.component';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

describe('cart', function() {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(function($rootScope, $componentController) {
    var $scope = $rootScope.$new();

    self.controller = $componentController(module.name, {
      $scope: $scope,
      cartService: {
        get: angular.noop,
        loadCart: angular.noop,
        deleteItem: angular.noop
      },
      productModalService: {
        configureProduct: function (){}
      },
      sessionService: {
        getRole: () => {return 'REGISTERED';}
      },
      $window: {
        location: '/cart.html'
      }
    });

  }));

  it('to be defined', function() {
    expect(self.controller).toBeDefined();
  });

  describe('$onInit()', () => {
    it('should call loadCart()', () => {
      spyOn(self.controller, 'loadCart');
      self.controller.$onInit();
      expect(self.controller.loadCart).toHaveBeenCalled();
    });
  });

  describe('loadCart()', () => {
    it('should load cart data', () => {
      spyOn( self.controller.cartService, 'get' ).and.returnValue( Observable.of( 'data' ) );
      self.controller.loadCart();
      expect(self.controller.cartService.get).toHaveBeenCalled();
    });
  });

  describe('removeItem()', () => {
    it('should remove item from cart', () => {
      spyOn(self.controller, 'loadCart');
      spyOn(self.controller.cartService, 'deleteItem' ).and.returnValue( Observable.of( 'data' ) );
      self.controller.removeItem('hey');
      expect(self.controller.cartService.deleteItem).toHaveBeenCalledWith('hey');
      expect(self.controller.loadCart).toHaveBeenCalled();
    });
  });

  describe('editItem()', () => {
    beforeEach(()=>{
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
    });

    it('should call a modal and reload cart of successful edit', () => {
      self.controller.isUpdated = true;

      self.controller.editItem({});
      expect(self.controller.productModalService.configureProduct).toHaveBeenCalled();
      expect(self.controller.loadCart).toHaveBeenCalled();
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

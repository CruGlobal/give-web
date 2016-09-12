import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import module from './checkout.component';

describe('checkout', function() {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(function($componentController) {
    self.controller = $componentController(module.name);
  }));

  describe('changeStep', () => {
    it('should scroll to top and change the checkout step', () => {
      spyOn(self.controller.$window, 'scrollTo');
      self.controller.changeStep('review');
      expect(self.controller.$window.scrollTo).toHaveBeenCalledWith(0,0);
      expect(self.controller.checkoutStep).toEqual('review');
    });
  });

  describe('loadCart', () => {
    it('should load the card data', () => {
      spyOn(self.controller.cartService, 'get').and.callFake(() => Observable.of('cartData'));
      self.controller.loadCart();
      expect(self.controller.loadingCartData).toEqual(false);
      expect(self.controller.cartData).toEqual('cartData');
    });
    it('should still set loading to false on an error', () => {
      spyOn(self.controller.cartService, 'get').and.callFake(() => Observable.throw('some error'));
      self.controller.loadCart();
      expect(self.controller.loadingCartData).toEqual(false);
      expect(self.controller.$log.error.logs[0]).toEqual(['Error loading cart', 'some error']);
    });
  });
});

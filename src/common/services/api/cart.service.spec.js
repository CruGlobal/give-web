import angular from 'angular';
import moment from 'moment';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import module from './cart.service';

import cartResponse from 'common/services/api/fixtures/cortex-cart.fixture';

describe('cart service', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject((cartService, $httpBackend) => {
    self.cartService = cartService;
    self.$httpBackend = $httpBackend;
  }));

  afterEach(() => {
    self.$httpBackend.verifyNoOutstandingExpectation();
    self.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('get', () => {
    it('should get cart and parse response', () => {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/carts/crugive/default' +
          '?zoom=lineitems:element:availability,lineitems:element:item:code,lineitems:element:item:definition,' +
          'lineitems:element:rate,lineitems:element:total,ratetotals:element,total,lineitems:element:itemfields')
        .respond(200, cartResponse);

      spyOn(self.cartService.giftDatesService, 'getNextDrawDate').and.returnValue(Observable.of('2016-10-01'));

      self.cartService.get()
        .subscribe((data) => {
          //verify response
          expect(self.cartService.giftDatesService.getNextDrawDate).toHaveBeenCalled();
          expect(data.items.length).toEqual(3);
          expect(data.items[0].designationNumber).toEqual('0358433');
          expect(data.items[1].giftStartDate.toString()).toEqual(moment('2016-10-09').toString());

          expect(data.cartTotal).toEqual(50);
          expect(data.frequencyTotals).toEqual([
            { frequency: 'Single', amount: 50, total: '$50.00' },
            { frequency: 'Annually', amount: 50, total: '$50.00' },
            { frequency: 'Quarterly', amount: 50, total: '$50.00' }
          ]);
        });
      self.$httpBackend.flush();
    });
  });

  describe('addItem', () => {
    it('should add an item', () => {
      self.$httpBackend.expectPOST(
        'https://cortex-gateway-stage.cru.org/cortex/itemfieldslineitem/items/crugive/<some id>',
        {
          amount: 50,
          quantity: 1
        }
      ).respond(200);

      self.cartService.addItem('<some id>', { amount: 50 });
      self.$httpBackend.flush();
    });
  });

  describe('deleteItem', () => {
    it('should delete an item', () => {
      self.$httpBackend.expectDELETE(
        'https://cortex-gateway-stage.cru.org/cortex/itemfieldslineitem/items/crugive/<some id>'
      ).respond(200);

      self.cartService.deleteItem('itemfieldslineitem/items/crugive/<some id>');
      self.$httpBackend.flush();
    });
  });
});

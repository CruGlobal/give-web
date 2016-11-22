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
    beforeEach(() => {
      spyOn(self.cartService.commonService, 'getNextDrawDate').and.returnValue(Observable.of('2016-10-01'));
      jasmine.clock().mockDate(moment('2016-09-01').toDate()); // Make sure current date is before next draw date
    });
    it('should handle an empty response', () => {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/carts/crugive/default' +
          '?zoom=lineitems:element,lineitems:element:availability,lineitems:element:item:code,' +
          'lineitems:element:item:definition,lineitems:element:rate,lineitems:element:total,' +
          'lineitems:element:itemfields,ratetotals:element,total,total:cost')
        .respond(200, null);

      self.cartService.get()
        .subscribe((data) => {
          expect(data).toEqual({});
        });
      self.$httpBackend.flush();
    });
    it('should handle a response with no line items', () => {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/carts/crugive/default' +
          '?zoom=lineitems:element,lineitems:element:availability,lineitems:element:item:code,' +
          'lineitems:element:item:definition,lineitems:element:rate,lineitems:element:total,' +
          'lineitems:element:itemfields,ratetotals:element,total,total:cost')
        .respond(200, {});

      self.cartService.get()
        .subscribe((data) => {
          expect(data).toEqual({});
        });
      self.$httpBackend.flush();
    });
    it('should get cart and parse response', () => {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/carts/crugive/default' +
        '?zoom=lineitems:element,lineitems:element:availability,lineitems:element:item:code,' +
        'lineitems:element:item:definition,lineitems:element:rate,lineitems:element:total,' +
        'lineitems:element:itemfields,ratetotals:element,total,total:cost')
        .respond(200, cartResponse);

      self.cartService.get()
        .subscribe((data) => {
          //verify response
          expect(self.cartService.commonService.getNextDrawDate).toHaveBeenCalled();
          expect(data.items.length).toEqual(3);
          expect(data.items[0].designationNumber).toEqual('0354433');
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

      self.cartService.addItem('items/crugive/<some id>', { amount: 50 })
        .subscribe();
      self.$httpBackend.flush();
    });
  });

  describe('editItem', () => {
    it('should delete the old item and add the new one', () => {
      spyOn(self.cartService, 'deleteItem').and.returnValue(Observable.of({ data: null }));
      spyOn(self.cartService, 'addItem').and.returnValue(Observable.of({ data: null }));
      self.cartService.editItem('<some old id>', '<new id>', { code: '<some code>'})
        .subscribe();
      expect(self.cartService.deleteItem).toHaveBeenCalledWith('<some old id>');
      expect(self.cartService.addItem).toHaveBeenCalledWith('<new id>', { code: '<some code>'});
    });
  });

  describe('deleteItem', () => {
    it('should delete an item', () => {
      self.$httpBackend.expectDELETE(
        'https://cortex-gateway-stage.cru.org/cortex/itemfieldslineitem/items/crugive/<some id>'
      ).respond(200);

      self.cartService.deleteItem('itemfieldslineitem/items/crugive/<some id>')
        .subscribe();
      self.$httpBackend.flush();
    });
  });
});

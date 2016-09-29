import angular from 'angular';
import 'angular-mocks';
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
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/nextdrawdate')
        .respond(200, {"next-draw-date": "2016-10-01"});

      self.cartService.get()
        .subscribe((data) => {
          //verify response
          expect(data.items.length).toEqual(3);
          expect(data.items[0].designationNumber).toEqual('0358433');
          expect(data.items[1].giftStartDate).toEqual(new Date(2016, 9, 9));

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

  it('should get next draw date', () => {
    self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/nextdrawdate')
      .respond(200, {"next-draw-date": "2016-10-01"});
    self.cartService.getNextDrawDate().subscribe((date) => {
      expect(date).toEqual('2016-10-01');
    });

    self.$httpBackend.flush();
  });

  it('should calculate gift start date', () => {
    expect(self.cartService.giftStartDate('2017-01-02', '10')).toEqual(new Date(2017, 0, 10));
    expect(self.cartService.giftStartDate('2017-01-02', '1')).toEqual(new Date(2017, 1, 1));
  });
});

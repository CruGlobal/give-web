import angular from 'angular';
import moment from 'moment';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/empty';
import {Roles} from 'common/services/session/session.service';

import module from './cart.service';

import cartResponse from 'common/services/api/fixtures/cortex-cart.fixture';

describe('cart service', () => {
  beforeEach(angular.mock.module(module.name));
  let self = {};

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
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default' +
        '?zoom=lineitems:element,lineitems:element:availability,lineitems:element:item,lineitems:element:item:code,' +
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
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default' +
        '?zoom=lineitems:element,lineitems:element:availability,lineitems:element:item,lineitems:element:item:code,' +
        'lineitems:element:item:definition,lineitems:element:rate,lineitems:element:total,' +
        'lineitems:element:itemfields,ratetotals:element,total,total:cost')
        .respond(200, {});

      self.cartService.get()
        .subscribe((data) => {
          expect(data).toEqual({});
        });
      self.$httpBackend.flush();
    });
    it('should get cart, parse response, and show most recent items first', () => {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default' +
        '?zoom=lineitems:element,lineitems:element:availability,lineitems:element:item,lineitems:element:item:code,' +
        'lineitems:element:item:definition,lineitems:element:rate,lineitems:element:total,' +
        'lineitems:element:itemfields,ratetotals:element,total,total:cost')
        .respond(200, cartResponse);

      self.cartService.get()
        .subscribe((data) => {
          //verify response
          expect(self.cartService.commonService.getNextDrawDate).toHaveBeenCalled();
          expect(data.items.length).toEqual(3);
          expect(data.items[0].designationNumber).toEqual('5541091');
          expect(data.items[1].designationNumber).toEqual('0617368');
          expect(data.items[2].designationNumber).toEqual('0354433');
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

  describe('getTotalQuantity', () => {
    it('get current number of items in cart', () => {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default')
        .respond(200, cartResponse);

      self.cartService.getTotalQuantity().subscribe((total) => {
        expect(total).toEqual(3);
      });
      self.$httpBackend.flush();
    });
  });

  describe('addItem', () => {
    beforeEach(() => {
      spyOn(self.cartService.sessionService, 'getRole').and.returnValue(Roles.registered);
    });
    it('should add an item', () => {
      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/itemfieldslineitem/items/crugive/<some id>?followLocation=true',
        {
          amount: 50,
          quantity: 1
        }
      ).respond(200);

      self.cartService.addItem('items/crugive/<some id>', { amount: 50 })
        .subscribe();
      self.$httpBackend.flush();
    });

    describe('as a public user', () => {
      beforeEach(() => {
        self.cartService.sessionService.getRole.and.returnValue(Roles.public);
      });

      describe('with existing cart', () => {
        beforeEach(() => {
          spyOn(self.cartService, 'getTotalQuantity').and.returnValue(Observable.of(3));
        });

        it('should add an item', () => {
          self.$httpBackend.expectPOST(
            'https://give-stage2.cru.org/cortex/itemfieldslineitem/items/crugive/<some id>?followLocation=true',
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

      describe('with empty cart', () => {
        beforeEach(() => {
          spyOn(self.cartService, 'getTotalQuantity').and.returnValue(Observable.of(0));
          spyOn(self.cartService.sessionService, 'signOut').and.returnValue(Observable.of({}));
        });

        it('should delete cookies and addItem to cart', () => {
          self.$httpBackend.expectPOST(
            'https://give-stage2.cru.org/cortex/itemfieldslineitem/items/crugive/<some id>?followLocation=true',
            {
              amount: 50,
              quantity: 1
            }
          ).respond(200);

          self.cartService.addItem('items/crugive/<some id>', { amount: 50 }).subscribe();
          self.$httpBackend.flush();
        });
      });

    });
  });

  describe('editItem', () => {
    it('should delete the old item and add the new one', () => {
      spyOn(self.cartService, 'deleteItem').and.returnValue(Observable.of({ data: null }));
      spyOn(self.cartService, 'addItem').and.returnValue(Observable.of({ data: null }));
      self.cartService.editItem('<some old id>', '<new id>', { code: '<some code>'})
        .subscribe();
      expect(self.cartService.deleteItem).toHaveBeenCalledWith('<some old id>');
      expect(self.cartService.addItem).toHaveBeenCalledWith('<new id>', { code: '<some code>'}, true);
    });
  });

  describe('deleteItem', () => {
    it('should delete an item', () => {
      self.$httpBackend.expectDELETE(
        'https://give-stage2.cru.org/cortex/itemfieldslineitem/items/crugive/<some id>'
      ).respond(200);

      self.cartService.deleteItem('itemfieldslineitem/items/crugive/<some id>')
        .subscribe();
      self.$httpBackend.flush();
    });
  });

  describe('bulkAdd', () => {
    beforeEach(() => {
      spyOn(self.cartService.designationsService, 'bulkLookup');
    });
    it('should throw an error if there are no designations found from lookup', () => {
      self.cartService.designationsService.bulkLookup.and.returnValue(Observable.of({ links: [] }));
      self.cartService.bulkAdd([{ designationNumber: '0123456' }])
        .subscribe(
          () => fail('Observable should have thrown an error'),
          error => {
            expect(error).toEqual('No results found during lookup');
          }
        );
    });
    it('should combine the configured designations with their product uri and call addItemAndReplaceExisting for each designation', () => {
      self.cartService.designationsService.bulkLookup.and.returnValue(Observable.of({ links: [ { uri: 'uri1'}, { uri: 'uri2'} ] }));
      spyOn(self.cartService, 'addItemAndReplaceExisting').and.callFake( (cart, uri, configuredDesignation) => Observable.of({ configuredDesignation: configuredDesignation }));
      let outputValues = [];
      self.cartService.bulkAdd([{ designationNumber: '0123456' }, { designationNumber: '1234567' }])
        .subscribe(value => {
            outputValues.push(value);
          },
          () => fail('Observable should not have thrown an error'),
          () => {
            expect(self.cartService.addItemAndReplaceExisting).toHaveBeenCalledWith(jasmine.any(Observable), 'uri1', { designationNumber: '0123456', uri: 'uri1' });
            expect(self.cartService.addItemAndReplaceExisting).toHaveBeenCalledWith(jasmine.any(Observable), 'uri2', { designationNumber: '1234567', uri: 'uri2' });
            expect(outputValues).toEqual([ { configuredDesignation: { designationNumber: '0123456', uri: 'uri1' } }, { configuredDesignation: { designationNumber: '1234567', uri: 'uri2' } } ]);
          });
    });
    it('should provide cart as an observable that only performs a cart request once', () => {
      self.cartService.designationsService.bulkLookup.and.returnValue(Observable.of({ links: [ { uri: 'uri1'} ] }));
      spyOn(self.cartService, 'addItemAndReplaceExisting').and.returnValue(Observable.empty());
      self.cartService.bulkAdd([{ designationNumber: '0123456' }])
        .subscribe(null,
          () => fail('Observable should not have thrown an error'),
          () => {
            spyOn(self.cartService, 'get').and.returnValue(Observable.empty());
            const cartObservable = self.cartService.addItemAndReplaceExisting.calls.mostRecent().args[0];
            cartObservable.subscribe();
            cartObservable.subscribe();
            expect(self.cartService.get.calls.count()).toEqual(1);
          });
    });
  });
  describe('addItemAndReplaceExisting', () => {
    beforeEach(() => {
      spyOn(self.cartService, 'addItem').and.returnValue(Observable.of({}));
      spyOn(self.cartService, 'editItem').and.returnValue(Observable.of({}));
      this.cartObservable = Observable.of({ items: [ { code: '0123456', uri: 'oldUri'}]});
    });
    it('should add items to cart if there are no conflicts', () => {
      self.cartService.addItemAndReplaceExisting(null, 'uri1', { designationNumber: '0123456', amount: 51, uri: 'uri1' })
        .subscribe(
          response => {
            expect(self.cartService.addItem).toHaveBeenCalledWith('uri1', { amount: 51 });
            expect(self.cartService.editItem).not.toHaveBeenCalled();
            expect(response).toEqual({ configuredDesignation: { designationNumber: '0123456', amount: 51, uri: 'uri1' } });
          },
          () => fail('Observable should not have thrown an error')
        );
    });
    it('should catch a generic error when adding item', () => {
      self.cartService.addItem.and.returnValue(Observable.throw('some error'));
      self.cartService.addItemAndReplaceExisting(null, 'uri1', { designationNumber: '0123456', amount: 51, uri: 'uri1' })
        .subscribe(
          response => {
            expect(self.cartService.addItem).toHaveBeenCalledWith('uri1', { amount: 51 });
            expect(self.cartService.editItem).not.toHaveBeenCalled();
            expect(response).toEqual({ error: 'some error', configuredDesignation: { designationNumber: '0123456', amount: 51, uri: 'uri1' } });
          },
          () => fail('Observable should not have thrown an error') // We are catching and returning the value with an error key so we know which requests are failing
        );
    });
    it('should catch a conflict in the cart and replace that item', () => {
      self.cartService.addItem.and.returnValue(Observable.throw({ status: 409 }));
      self.cartService.addItemAndReplaceExisting(this.cartObservable, 'uri1', { designationNumber: '0123456', amount: 51, uri: 'uri1' })
        .subscribe(
          response => {
            expect(self.cartService.addItem).toHaveBeenCalledWith('uri1', { amount: 51 });
            expect(self.cartService.editItem).toHaveBeenCalledWith('oldUri', 'uri1', { amount: 51 });
            expect(response).toEqual({ configuredDesignation: { designationNumber: '0123456', amount: 51, uri: 'uri1' } });
          },
          () => fail('Observable should not have thrown an error')
        );
    });
    it('should catch a conflict in the cart and catch an error replacing that item', () => {
      self.cartService.addItem.and.returnValue(Observable.throw({ status: 409 }));
      self.cartService.editItem.and.returnValue(Observable.throw('some error'));
      self.cartService.addItemAndReplaceExisting(this.cartObservable, 'uri1', { designationNumber: '0123456', amount: 51, uri: 'uri1' })
        .subscribe(
          response => {
            expect(self.cartService.addItem).toHaveBeenCalledWith('uri1', { amount: 51 });
            expect(self.cartService.editItem).toHaveBeenCalledWith('oldUri', 'uri1', { amount: 51 });
            expect(response).toEqual({ error: 'some error', configuredDesignation: { designationNumber: '0123456', amount: 51, uri: 'uri1' } });
          },
          () => fail('Observable should not have thrown an error')
        );
    });
  });
});

import angular from 'angular'
import moment from 'moment'
import { advanceTo, clear } from 'jest-date-mock'
import 'angular-mocks'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/empty'
import 'rxjs/add/observable/from'
import { Roles } from 'common/services/session/session.service'

import module from './cart.service'

import cartResponse from 'common/services/api/fixtures/cortex-cart.fixture'

describe('cart service', () => {
  let search = ''
  const windowMock = {
    location: {
      search: search
    }
  }

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('$window', windowMock);
  }))

  beforeEach(angular.mock.module(module.name))

  afterEach(clear)
  const self = {}

  beforeEach(inject((cartService, $httpBackend) => {
    self.cartService = cartService
    self.$httpBackend = $httpBackend
  }))

  afterEach(() => {
    self.$httpBackend.verifyNoOutstandingExpectation()
    self.$httpBackend.verifyNoOutstandingRequest()
    windowMock.location.search = ''
  })

  describe('get', () => {
    beforeEach(() => {
      jest.spyOn(self.cartService.$cookies, 'put').mockImplementation(() => {})
      jest.spyOn(self.cartService.$cookies, 'remove').mockImplementation(() => {})
      jest.spyOn(self.cartService.$location, 'host').mockReturnValue('give.cru.org')
      jest.spyOn(self.cartService.commonService, 'getNextDrawDate').mockReturnValue(Observable.of('2016-10-01'))
      advanceTo(moment('2016-09-01').toDate()) // Make sure current date is before next draw date
    })

    // To fetch product-code, offer resource is used and added it in zoom parameter.
    it('should handle an empty response', () => {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default' +
        '?zoom=lineitems:element,lineitems:element:availability,lineitems:element:item,lineitems:element:item:code,' +
        'lineitems:element:item:offer:code,lineitems:element:item:definition,lineitems:element:rate,lineitems:element:total,' +
        'lineitems:element:itemfields,ratetotals:element,total,total:cost')
        .respond(200, null)

      self.cartService.get()
        .subscribe((data) => {
          expect(data).toEqual({})
        })
      self.$httpBackend.flush()
    })

    // To fetch product-code, offer resource is used and added it in zoom parameter.
    it('should handle a response with no line items', () => {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default' +
        '?zoom=lineitems:element,lineitems:element:availability,lineitems:element:item,lineitems:element:item:code,' +
        'lineitems:element:item:offer:code,lineitems:element:item:definition,lineitems:element:rate,lineitems:element:total,' +
        'lineitems:element:itemfields,ratetotals:element,total,total:cost')
        .respond(200, {})

      self.cartService.get()
        .subscribe((data) => {
          expect(data).toEqual({})
          expect(self.cartService.$cookies.remove).toHaveBeenCalledWith('giveCartItemCount', expect.any(Object))
        })
      self.$httpBackend.flush()
    })

    // To fetch product-code, offer resource is used and added it in zoom parameter.
    it('should get cart, parse response, and show most recent items first', () => {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default' +
        '?zoom=lineitems:element,lineitems:element:availability,lineitems:element:item,lineitems:element:item:code,' +
        'lineitems:element:item:offer:code,lineitems:element:item:definition,lineitems:element:rate,lineitems:element:total,' +
        'lineitems:element:itemfields,ratetotals:element,total,total:cost')
        .respond(200, cartResponse)

      self.cartService.get()
        .subscribe((data) => {
          // verify response
          expect(self.cartService.commonService.getNextDrawDate).toHaveBeenCalled()
          expect(data.items.length).toEqual(3)
          expect(data.items[0].designationNumber).toEqual('5541091')
          expect(data.items[1].designationNumber).toEqual('0617368')
          expect(data.items[2].designationNumber).toEqual('0354433')
          expect(data.items[1].giftStartDate.toString()).toEqual(moment('2016-10-09').toString())

          expect(data.cartTotal).toEqual(50)
          expect(data.frequencyTotals).toEqual([
            { frequency: 'Single', amount: 50, amountWithFees: 51.2, total: '$50.00', totalWithFees: '$51.20' },
            { frequency: 'Annually', amount: 50, amountWithFees: 51.2, total: '$50.00', totalWithFees: '$51.20' },
            { frequency: 'Quarterly', amount: 50, amountWithFees: 51.2, total: '$50.00', totalWithFees: '$51.20' }
          ])

          expect(self.cartService.$cookies.put).toHaveBeenCalledWith('giveCartItemCount', 3, expect.any(Object))
        })
      self.$httpBackend.flush()
    })

    it('should not set cart count cookie on other domains', () => {
      self.cartService.$location.host.mockReturnValue('secure.cru.org')
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default' +
        '?zoom=lineitems:element,lineitems:element:availability,lineitems:element:item,lineitems:element:item:code,' +
        'lineitems:element:item:offer:code,lineitems:element:item:definition,lineitems:element:rate,lineitems:element:total,' +
        'lineitems:element:itemfields,ratetotals:element,total,total:cost')
        .respond(200, cartResponse)

      self.cartService.get()
        .subscribe(() => {
          expect(self.cartService.$cookies.put).not.toHaveBeenCalled()
          expect(self.cartService.$cookies.remove).not.toHaveBeenCalled()
        })
      self.$httpBackend.flush()
    })
  })

  describe('handleCartResponse', () => {
    const zoom = {
      lineItems: 'lineitems:element[],lineitems:element:availability,lineitems:element:item,lineitems:element:item:code,lineitems:element:item:definition,lineitems:element:rate,lineitems:element:total,lineitems:element:itemfields',
      rateTotals: 'ratetotals:element[]',
      total: 'total,total:cost'
    }
    let transformedCartResponse

    beforeEach(() => {
      jest.spyOn(self.cartService.$cookies, 'put').mockImplementation(() => {})
      jest.spyOn(self.cartService.$cookies, 'remove').mockImplementation(() => {})
      jest.spyOn(self.cartService.$location, 'host').mockReturnValue('give.cru.org')
      advanceTo(moment('2016-09-01').toDate()) // Make sure current date is before next draw date
      transformedCartResponse = self.cartService.hateoasHelperService.mapZoomElements(cartResponse, zoom)
      transformedCartResponse.rateTotals[0].cost.amount = 51
      transformedCartResponse.rateTotals[0].cost['amount-with-fees'] = 52.23
      transformedCartResponse.rateTotals[0].cost.display = '$51.00'
      transformedCartResponse.rateTotals[0].cost['display-with-fees'] = '$52.23'
    })

    it('should get cart, parse response, and show most recent items first', () => {
      const data = self.cartService.handleCartResponse(transformedCartResponse, '2016-10-01')
      // verify response
      expect(data.items.length).toEqual(3)
      expect(data.items[0].designationNumber).toEqual('5541091')
      expect(data.items[1].designationNumber).toEqual('0617368')
      expect(data.items[2].designationNumber).toEqual('0354433')
      expect(data.items[1].giftStartDate.toString()).toEqual(moment('2016-10-09').toString())

      expect(data.cartTotal).toEqual(50)
      expect(data.cartTotalDisplay).toEqual('$50.00')
      expect(data.frequencyTotals).toEqual([
        { frequency: 'Single', amount: 50, amountWithFees: 51.2, total: '$50.00', totalWithFees: '$51.20' },
        { frequency: 'Annually', amount: 51, amountWithFees: 52.23, total: '$51.00', totalWithFees: '$52.23' },
        { frequency: 'Quarterly', amount: 50, amountWithFees: 51.2, total: '$50.00', totalWithFees: '$51.20' }
      ])

      expect(self.cartService.$cookies.put).toHaveBeenCalledWith('giveCartItemCount', 3, expect.any(Object))
    })

    it('should handle total correctly if the order changes from the API', () => {
      transformedCartResponse.rateTotals.unshift(transformedCartResponse.rateTotals.pop())

      const data = self.cartService.handleCartResponse(transformedCartResponse, '2016-10-01')
      expect(data.cartTotal).toEqual(50)
      expect(data.cartTotalDisplay).toEqual('$50.00')
    })

    it('should handle fallback total', () => {
      transformedCartResponse.rateTotals.pop()

      const data = self.cartService.handleCartResponse(transformedCartResponse, '2016-10-01')
      expect(data.cartTotal).toEqual(50)
      expect(data.cartTotalDisplay).toEqual('$50.00')
    })
  })

  describe('getTotalQuantity', () => {
    it('get current number of items in cart', () => {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default')
        .respond(200, cartResponse)

      self.cartService.getTotalQuantity().subscribe((total) => {
        expect(total).toEqual(3)
      })
      self.$httpBackend.flush()
    })
  })

  describe('addItem', () => {
    beforeEach(() => {
      jest.spyOn(self.cartService.sessionService, 'getRole').mockReturnValue(Roles.registered)
    })

    it('should add an item', () => {
      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/items/crugive/<some id>?FollowLocation=true',
        {
          configuration: {
            AMOUNT: 50
          },
          quantity: 1
        }
      ).respond(200)

      self.cartService.addItem('items/crugive/<some id>', { amount: 50 })
        .subscribe()
      self.$httpBackend.flush()
    })

    describe('as a public user', () => {
      beforeEach(() => {
        self.cartService.sessionService.getRole.mockReturnValue(Roles.public)
      })

      describe('with existing cart', () => {
        beforeEach(() => {
          jest.spyOn(self.cartService, 'getTotalQuantity').mockReturnValue(Observable.of(3))
        })

        it('should add an item', () => {
          self.$httpBackend.expectPOST(
            'https://give-stage2.cru.org/cortex/items/crugive/<some id>?FollowLocation=true',
            {
              configuration: {
                AMOUNT: 50
              },
              quantity: 1
            }
          ).respond(200)

          self.cartService.addItem('items/crugive/<some id>', { amount: 50 })
            .subscribe()
          self.$httpBackend.flush()
        })
      })

      describe('with empty cart', () => {
        beforeEach(() => {
          jest.spyOn(self.cartService, 'getTotalQuantity').mockReturnValue(Observable.of(0))
          jest.spyOn(self.cartService.sessionService, 'signOut').mockReturnValue(Observable.from(['']))
          self.$httpBackend.expectPOST(
            'https://give-stage2.cru.org/cortex/items/crugive/<some id>?FollowLocation=true',
            {
              configuration: {
                AMOUNT: 50
              },
              quantity: 1
            }
          ).respond(200)
        })

        it('should delete cookies and addItem to cart when not authenticated', () => {
          jest.spyOn(self.cartService.sessionService, 'oktaIsUserAuthenticated').mockReturnValue(Observable.from([false]))
          jest.spyOn(self.cartService, '_addItem')
          self.cartService.addItem('items/crugive/<some id>', { amount: 50 }).subscribe()
          expect(self.cartService.sessionService.oktaIsUserAuthenticated).toHaveBeenCalled()
          expect(self.cartService.sessionService.signOut).not.toHaveBeenCalled()
          expect(self.cartService._addItem).toHaveBeenCalled()
        })

        it('should force user to sign out of Okta prior to adding item to cart', () => {
          jest.spyOn(self.cartService.sessionService, 'oktaIsUserAuthenticated').mockReturnValue(Observable.from([true]))
          jest.spyOn(self.cartService, '_addItem')
          self.cartService.addItem('items/crugive/<some id>', { amount: 50 }).subscribe()
          expect(self.cartService.sessionService.oktaIsUserAuthenticated).toHaveBeenCalled()
          expect(self.cartService.sessionService.signOut).toHaveBeenCalled()
          expect(self.cartService._addItem).toHaveBeenCalled()
        })

        afterEach(() => {
          self.$httpBackend.flush()
        })
      })
    })
  })

  describe('editItem', () => {
    it('should delete the old item and add the new one', () => {
      jest.spyOn(self.cartService, 'deleteItem').mockReturnValue(Observable.of({ data: null }))
      jest.spyOn(self.cartService, 'addItem').mockReturnValue(Observable.of({ data: null }))
      self.cartService.editItem('<some old id>', '<new id>', { code: '<some code>' })
        .subscribe()

      expect(self.cartService.deleteItem).toHaveBeenCalledWith('<some old id>')
      expect(self.cartService.addItem).toHaveBeenCalledWith('<new id>', { code: '<some code>' }, true)
    })

    it('should give me data from the add item', done => {
      const addData = {
        self: { uri: 'some-uri' }
      }
      jest.spyOn(self.cartService, 'deleteItem').mockReturnValue(Observable.of(''))
      jest.spyOn(self.cartService, 'addItem').mockReturnValue(Observable.of(addData))
      self.cartService.editItem('<some old id>', '<new id>', { code: '<some code>' })
        .subscribe((data) => {
          expect(data).toBeDefined()
          expect(data).toEqual(addData)
          done()
        })
    })
  })

  describe('deleteItem', () => {
    it('should delete an item', () => {
      self.$httpBackend.expectDELETE(
        'https://give-stage2.cru.org/cortex/itemfieldslineitem/items/crugive/<some id>'
      ).respond(200)

      self.cartService.deleteItem('itemfieldslineitem/items/crugive/<some id>')
        .subscribe()
      self.$httpBackend.flush()
    })
  })

  describe('bulkAdd', () => {
    beforeEach(() => {
      jest.spyOn(self.cartService.designationsService, 'bulkLookup').mockImplementation(() => {})
    })

    it('should throw an error if there are no designations found from lookup', () => {
      self.cartService.designationsService.bulkLookup.mockReturnValue(Observable.of({ links: [] }))
      self.cartService.bulkAdd([{ designationNumber: '0123456' }])
        .subscribe(
          () => fail('Observable should have thrown an error'),
          error => {
            expect(error).toEqual('No results found during lookup')
          }
        )
    })

    it('should combine the configured designations with their product uri and call addItemAndReplaceExisting for each designation', () => {
      self.cartService.designationsService.bulkLookup.mockReturnValue(Observable.of({ links: [{ uri: 'uri1' }, { uri: 'uri2' }] }))
      jest.spyOn(self.cartService, 'addItemAndReplaceExisting').mockImplementation((cart, uri, configuredDesignation) => Observable.of({ configuredDesignation: configuredDesignation }))
      const outputValues = []
      self.cartService.bulkAdd([{ designationNumber: '0123456' }, { designationNumber: '1234567' }])
        .subscribe(value => {
          outputValues.push(value)
        },
        () => fail('Observable should not have thrown an error'),
        () => {
          expect(self.cartService.addItemAndReplaceExisting).toHaveBeenCalledWith(expect.any(Observable), 'carts/uri1/form', { designationNumber: '0123456', uri: 'carts/uri1/form' })
          expect(self.cartService.addItemAndReplaceExisting).toHaveBeenCalledWith(expect.any(Observable), 'carts/uri2/form', { designationNumber: '1234567', uri: 'carts/uri2/form' })
          expect(outputValues).toEqual([{ configuredDesignation: { designationNumber: '0123456', uri: 'carts/uri1/form' } }, { configuredDesignation: { designationNumber: '1234567', uri: 'carts/uri2/form' } }])
        })
    })

    it('should provide cart as an observable that only performs a cart request once', () => {
      self.cartService.designationsService.bulkLookup.mockReturnValue(Observable.of({ links: [{ uri: 'uri1' }] }))
      jest.spyOn(self.cartService, 'addItemAndReplaceExisting').mockReturnValue(Observable.empty())
      self.cartService.bulkAdd([{ designationNumber: '0123456' }])
        .subscribe(null,
          () => fail('Observable should not have thrown an error'),
          () => {
            jest.spyOn(self.cartService, 'get').mockReturnValue(Observable.empty())
            const cartObservable = self.cartService.addItemAndReplaceExisting.mock.calls[self.cartService.addItemAndReplaceExisting.mock.calls.length - 1][0]
            cartObservable.subscribe()
            cartObservable.subscribe()

            expect(self.cartService.get.mock.calls.length).toEqual(1)
          })
    })
  })

  describe('addItemAndReplaceExisting', () => {
    const cartObservable = Observable.of({
      items: [{ code: '0123456', uri: 'oldUri' }]
    })
    beforeEach(() => {
      jest.spyOn(self.cartService, 'addItem').mockReturnValue(Observable.of({}))
      jest.spyOn(self.cartService, 'editItem').mockReturnValue(Observable.of({}))
    })

    it('should add items to cart if there are no conflicts', () => {
      self.cartService.addItemAndReplaceExisting(null, 'uri1', { designationNumber: '0123456', amount: 51, uri: 'uri1' })
        .subscribe(
          response => {
            expect(self.cartService.addItem).toHaveBeenCalledWith('uri1', { amount: 51 })
            expect(self.cartService.editItem).not.toHaveBeenCalled()
            expect(response).toEqual({ configuredDesignation: { designationNumber: '0123456', amount: 51, uri: 'uri1' } })
          },
          () => fail('Observable should not have thrown an error')
        )
    })

    it('should catch a generic error when adding item', () => {
      self.cartService.addItem.mockReturnValue(Observable.throw('some error'))
      self.cartService.addItemAndReplaceExisting(null, 'uri1', { designationNumber: '0123456', amount: 51, uri: 'uri1' })
        .subscribe(
          response => {
            expect(self.cartService.addItem).toHaveBeenCalledWith('uri1', { amount: 51 })
            expect(self.cartService.editItem).not.toHaveBeenCalled()
            expect(response).toEqual({ error: 'some error', configuredDesignation: { designationNumber: '0123456', amount: 51, uri: 'uri1' } })
          },
          () => fail('Observable should not have thrown an error') // We are catching and returning the value with an error key so we know which requests are failing
        )
    })

    it('should catch a conflict in the cart and replace that item', () => {
      self.cartService.addItem.mockReturnValue(Observable.throw({ status: 409 }))
      self.cartService.addItemAndReplaceExisting(cartObservable, 'uri1', { designationNumber: '0123456', amount: 51, uri: 'uri1' })
        .subscribe(
          response => {
            expect(self.cartService.addItem).toHaveBeenCalledWith('uri1', { amount: 51 })
            expect(self.cartService.editItem).toHaveBeenCalledWith('oldUri', 'uri1', { amount: 51 })
            expect(response).toEqual({ configuredDesignation: { designationNumber: '0123456', amount: 51, uri: 'uri1' } })
          },
          () => fail('Observable should not have thrown an error')
        )
    })

    it('should catch a conflict in the cart and catch an error replacing that item', () => {
      self.cartService.addItem.mockReturnValue(Observable.throw({ status: 409 }))
      self.cartService.editItem.mockReturnValue(Observable.throw('some error'))
      self.cartService.addItemAndReplaceExisting(cartObservable, 'uri1', { designationNumber: '0123456', amount: 51, uri: 'uri1' })
        .subscribe(
          response => {
            expect(self.cartService.addItem).toHaveBeenCalledWith('uri1', { amount: 51 })
            expect(self.cartService.editItem).toHaveBeenCalledWith('oldUri', 'uri1', { amount: 51 })
            expect(response).toEqual({ error: 'some error', configuredDesignation: { designationNumber: '0123456', amount: 51, uri: 'uri1' } })
          },
          () => fail('Observable should not have thrown an error')
        )
    })
  })

  describe('buildCartUrl', () => {
    const queryParametersToKeep = '?one=1&two=2'
    const urlWithParameters = `cart.html${queryParametersToKeep}`

    beforeEach(() => {
      self.cartService.$window.location.href = 'https://give-stage2.cru.org'
    })

    it('should build a url without query parameters', () => {
      expect(self.cartService.buildCartUrl()).toEqual('cart.html')
    })

    it('should build a url with query parameters', () => {
      self.cartService.$window.location.search = queryParametersToKeep
      self.cartService.$window.location.href += self.cartService.$window.location.search
      expect(self.cartService.buildCartUrl()).toEqual(urlWithParameters)
    })

    it('should filter out certain query parameters', () => {
      self.cartService.$window.location.search = `${queryParametersToKeep}&modal=give-gift&d=0123456&a=50`
      self.cartService.$window.location.href += self.cartService.$window.location.search
      expect(self.cartService.buildCartUrl()).toEqual(urlWithParameters)
    })

    it('should filter out a subset of query parameters', () => {
      self.cartService.$window.location.search = `${queryParametersToKeep}&q=0123456&d=0123456&a=50`
      self.cartService.$window.location.href += self.cartService.$window.location.search
      expect(self.cartService.buildCartUrl()).toEqual(urlWithParameters)
    })
  })
})

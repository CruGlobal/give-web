import angular from 'angular'
import 'angular-mocks'
import omit from 'lodash/omit'
import cloneDeep from 'lodash/cloneDeep'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import formatAddressForTemplate from '../addressHelpers/formatAddressForTemplate'
import { Roles } from 'common/services/session/session.service'

import module from './order.service'

import cartResponse from 'common/services/api/fixtures/cortex-cart-paymentmethodinfo-forms.fixture.js'
import paymentMethodBankAccountResponse from 'common/services/api/fixtures/cortex-order-paymentmethod-bankaccount.fixture.js'
import paymentMethodCreditCardResponse from 'common/services/api/fixtures/cortex-order-paymentmethod-creditcard.fixture.js'
import paymentMethodSelectorResponse from 'common/services/api/fixtures/cortex-order-paymentmethod-selector.fixture.js'
import purchaseFormResponse from 'common/services/api/fixtures/cortex-order-purchaseform.fixture.js'
import donorDetailsResponse from 'common/services/api/fixtures/cortex-donordetails.fixture.js'
import needInfoResponse from 'common/services/api/fixtures/cortex-order-needinfo.fixture.js'
import purchaseResponse from 'common/services/api/fixtures/cortex-purchase.fixture.js'

describe('order service', () => {
  beforeEach(angular.mock.module(module.name))
  var self = {}

  beforeEach(inject((orderService, cartService, sessionService, tsysService, $httpBackend, $window, $log) => {
    self.orderService = orderService
    self.cartService = cartService
    self.sessionService = sessionService
    self.tsysService = tsysService
    self.$httpBackend = $httpBackend
    self.$window = $window
    self.$log = $log

    self.$window.sessionStorage.clear()
    self.$window.localStorage.clear()
  }))

  afterEach(() => {
    self.$httpBackend.verifyNoOutstandingExpectation()
    self.$httpBackend.verifyNoOutstandingRequest()
  })

  const paymentMethodForms = cloneDeep(cartResponse._order[0]._paymentmethodinfo[0]._element)
  angular.forEach(paymentMethodForms, form => {
    form.paymentinstrumentform = form._paymentinstrumentform[0]
    delete form._paymentinstrumentform
  })

  const cartResponseZoomMapped = {
    paymentMethodForms: paymentMethodForms,
    rawData: cartResponse
  }

  const purchaseFormResponseZoomMapped = {
    enhancedpurchaseform: purchaseFormResponse._order[0]._enhancedpurchaseform[0],
    rawData: purchaseFormResponse
  }

  describe('getDonorDetails', () => {
    it('should load the donorDetails', (done) => {
      const donorDetailsResponseZoomMapped = {
        donorDetails: donorDetailsResponse._order[0]._donordetails[0],
        email: donorDetailsResponse._order[0]._emailinfo[0]._email[0],
        orderEmailForm: donorDetailsResponse._order[0]._emailinfo[0]._orderemailform[0],
        rawData: donorDetailsResponse
      }

      //
      const expectedDonorDetails = omit(donorDetailsResponseZoomMapped.donorDetails, 'mailing-address')
      expectedDonorDetails.mailingAddress = formatAddressForTemplate(donorDetailsResponseZoomMapped.donorDetails['mailing-address'].address)
      expectedDonorDetails.email = donorDetailsResponseZoomMapped.email.email
      expectedDonorDetails.emailFormUri = donorDetailsResponseZoomMapped.orderEmailForm.links[0].uri

      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:donordetails,order:emailinfo:email,order:emailinfo:orderemailform')
        .respond(200, donorDetailsResponse)
      self.orderService.getDonorDetails()
        .subscribe((data) => {
          expect(data).toEqual(expectedDonorDetails)
          done()
        })
      self.$httpBackend.flush()
    })

    it('should set the mailingAddress country to US if undefined', (done) => {
      donorDetailsResponse._order[0]._donordetails[0]['mailing-address']['country-name'] = ''
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:donordetails,order:emailinfo:email,order:emailinfo:orderemailform')
        .respond(200, donorDetailsResponse)
      self.orderService.getDonorDetails()
        .subscribe((data) => {
          expect(data).toEqual(expect.objectContaining({
            mailingAddress: expect.objectContaining({ country: 'US' })
          }))
          done()
        })
      self.$httpBackend.flush()
    })

    it('should handle an undefined response', (done) => {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:donordetails,order:emailinfo:email,order:emailinfo:orderemailform')
        .respond(200, {})
      self.orderService.getDonorDetails()
        .subscribe((data) => {
          expect(data).toEqual({
            name: {},
            mailingAddress: { country: 'US' },
            email: undefined,
            emailFormUri: undefined
          })
          done()
        })
      self.$httpBackend.flush()
    })
  })

  describe('updateDonorDetails', () => {
    it('should send a request to save the donor details', (done) => {
      self.$httpBackend.expectPUT(
        'https://give-stage2.cru.org/cortex/donordetails/orders/crugive/mjstoztgmqydaljrmeytqljumm3dmljymnrdallbhfsdqnbrmq2wimrqgu=',
        {
          self: {
            type: 'elasticpath.donordetails.donor',
            uri: '/donordetails/orders/crugive/mjstoztgmqydaljrmeytqljumm3dmljymnrdallbhfsdqnbrmq2wimrqgu=',
            href: 'https://give-stage2.cru.org/cortex/donordetails/orders/crugive/mjstoztgmqydaljrmeytqljumm3dmljymnrdallbhfsdqnbrmq2wimrqgu='
          },
          'mailing-address': {
            address: {
              'country-name': 'US',
              'street-address': '123 First St',
              'extended-address': 'Apt 123',
              locality: 'Sacramento',
              'postal-code': '12345',
              region: 'CA'
            }
          },
          otherStuff: 'is also here'
        }
      ).respond(200, 'somedata')
      self.orderService.updateDonorDetails({
        self: {
          type: 'elasticpath.donordetails.donor',
          uri: '/donordetails/orders/crugive/mjstoztgmqydaljrmeytqljumm3dmljymnrdallbhfsdqnbrmq2wimrqgu=',
          href: 'https://give-stage2.cru.org/cortex/donordetails/orders/crugive/mjstoztgmqydaljrmeytqljumm3dmljymnrdallbhfsdqnbrmq2wimrqgu='
        },
        mailingAddress: {
          country: 'US',
          streetAddress: '123 First St',
          extendedAddress: 'Apt 123',
          locality: 'Sacramento',
          postalCode: '12345',
          region: 'CA'
        },
        otherStuff: 'is also here'
      })
        .subscribe((data) => {
          expect(data).toEqual('somedata')
          done()
        })
      self.$httpBackend.flush()
    })
  })

  describe('addEmail', () => {
    it('should send a request to save the email', (done) => {
      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/emails/crugive',
        { email: 'someemail@somedomain.com' }
      ).respond(200, 'somedata')
      self.orderService.addEmail('someemail@somedomain.com', '/emails/crugive')
        .subscribe((data) => {
          expect(data).toEqual('somedata')
          done()
        })
      self.$httpBackend.flush()
    })
  })

  describe('getPaymentMethodForms', () => {
    function setupRequest () {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:paymentmethodinfo:element,order:paymentmethodinfo:element:paymentinstrumentform')
        .respond(200, cartResponse)
    }

    function initiateRequest (done) {
      self.orderService.getPaymentMethodForms()
        .subscribe((data) => {
          expect(data).toEqual(cartResponseZoomMapped)
          done()
        })
    }

    it('should send a request to get the payment form links', (done) => {
      setupRequest()
      initiateRequest(done)
      self.$httpBackend.flush()
    })

    it('should use the cached response if called a second time', (done) => {
      setupRequest()
      self.orderService.getPaymentMethodForms()
        .subscribe((data) => {
          expect(data).toEqual(cartResponseZoomMapped)
          self.orderService.getPaymentMethodForms()
            .subscribe((data2) => {
              expect(data2).toEqual(cartResponseZoomMapped)
              done()
            })
        })
      self.$httpBackend.flush()
    })

    it('should log a warning if there is no create payment instrument link', done => {
      const alteredCartResponse = cartResponse
      alteredCartResponse._order[0]._paymentmethodinfo[0]._element[0]._paymentinstrumentform[0].links = []
      alteredCartResponse._order[0]._paymentmethodinfo[0]._element[1]._paymentinstrumentform[0].links = []
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:paymentmethodinfo:element,order:paymentmethodinfo:element:paymentinstrumentform')
        .respond(200, alteredCartResponse)
      self.orderService.getPaymentMethodForms()
        .subscribe((data) => {
          expect(self.$log.warn.logs[0]).toContain('Payment form request contains empty link')
          done()
        })
      self.$httpBackend.flush()

    })
  })

  describe('addBankAccountPayment', () => {
    it('should send a request to save the bank account payment info', (done) => {
      const paymentInfo = {
        'account-type': 'checking',
        'bank-name': 'First Bank',
        'display-account-number': '************9012',
        'encrypted-account-number': '**fake*encrypted**123456789012**',
        'routing-number': '123456789'
      }
      const expectedPostData = {
        'payment-instrument-identification-form': {
          'account-type': 'checking',
          'bank-name': 'First Bank',
          'display-account-number': '************9012',
          'encrypted-account-number': '**fake*encrypted**123456789012**',
          'routing-number': '123456789'
        }
      }

      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/paymentinstruments/paymentmethods/orders/crugive/mjswgobwmy2gkljtgazwcljumfsweljzmu2teljzmmytazrsge3wkodfmu=/gftgenrymm4dgllega2geljug44dillcga3dollbhe2wcnbugazdgobqgy=/paymentinstrument/form?FollowLocation=true',
        expectedPostData
      ).respond(200, 'success')

      // cache getPaymentForms response to avoid another http request while testing
      self.orderService.paymentMethodForms = cartResponseZoomMapped

      self.orderService.addBankAccountPayment(paymentInfo)
        .subscribe((data) => {
          expect(data).toEqual('success')
          done()
        })

      self.$httpBackend.flush()
    })
  })

  describe('addCreditCardPayment', () => {
    beforeEach(() => {
      jest.spyOn(self.orderService, 'storeCardSecurityCode').mockImplementation(() => {})
    })

    it('should send a request to save the credit card payment info with no billing address', (done) => {
      const paymentInfo = {
        'card-number': '**fake*encrypted**1234567890123456**',
        'card-type': 'VISA',
        'cardholder-name': 'Test Name',
        'expiry-month': '06',
        'expiry-year': '12',
        cvv: '456'
      }

      const expectedPostData = {
        'payment-instrument-identification-form': {
          'card-number': '**fake*encrypted**1234567890123456**',
          'card-type': 'VISA',
          'cardholder-name': 'Test Name',
          'expiry-month': '06',
          'expiry-year': '12'
        }
      }

      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/paymentinstruments/paymentmethods/orders/crugive/mnrwmntdmjrgkljvgi4gmljugrstcllbmjqtsllegq2winbvgbrdamrzgm=/g4ygeodbg42tilldha4wiljrgfswellbgvsdmllfgu4wenjxmu2ton3bgm=/paymentinstrument/form?FollowLocation=true',
        expectedPostData
      ).respond(200, { self: { uri: 'new cc uri' } })

      // cache getPaymentForms response to avoid another http request while testing
      self.orderService.paymentMethodForms = cartResponseZoomMapped

      self.orderService.addCreditCardPayment(paymentInfo)
        .subscribe((data) => {
          expect(data).toEqual({ self: { uri: 'new cc uri' } })
          done()
        })

      self.$httpBackend.flush()

      expect(self.orderService.storeCardSecurityCode).toHaveBeenCalledWith('456', 'new cc uri')
    })

    it('should send a request to save the credit card payment info with a billing address', (done) => {
      const paymentInfo = {
        address: {
          country: 'US',
          streetAddress: '123 First St',
          extendedAddress: 'Apt 123',
          locality: 'Sacramento',
          postalCode: '12345',
          region: 'CA'
        },
        'card-number': '**fake*encrypted**1234567890123456**',
        'card-type': 'VISA',
        'cardholder-name': 'Test Name',
        'expiry-month': '06',
        'expiry-year': '12',
        cvv: '789'
      }

      const expectedPostData = {
        'billing-address': {
          name: {
            'family-name': 'na',
            'given-name': 'na'
          },
          address: {
            'country-name': 'US',
            'street-address': '123 First St',
            'extended-address': 'Apt 123',
            locality: 'Sacramento',
            'postal-code': '12345',
            region: 'CA'
          }
        },
        'payment-instrument-identification-form': {
          'card-number': '**fake*encrypted**1234567890123456**',
          'card-type': 'VISA',
          'cardholder-name': 'Test Name',
          'expiry-month': '06',
          'expiry-year': '12'
        }
      }

      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/paymentinstruments/paymentmethods/orders/crugive/mnrwmntdmjrgkljvgi4gmljugrstcllbmjqtsllegq2winbvgbrdamrzgm=/g4ygeodbg42tilldha4wiljrgfswellbgvsdmllfgu4wenjxmu2ton3bgm=/paymentinstrument/form?FollowLocation=true',
        expectedPostData
      ).respond(200, { self: { uri: 'new cc uri' } })

      // cache getPaymentForms response to avoid another http request while testing
      self.orderService.paymentMethodForms = cartResponseZoomMapped

      self.orderService.addCreditCardPayment(paymentInfo)
        .subscribe((data) => {
          expect(data).toEqual({ self: { uri: 'new cc uri' } })
          done()
        })

      self.$httpBackend.flush()

      expect(self.orderService.storeCardSecurityCode).toHaveBeenCalledWith('789', 'new cc uri')
    })
  })

  describe('addPaymentMethod', () => {
    it('should save a new bank account payment method', (done) => {
      jest.spyOn(self.orderService, 'addBankAccountPayment').mockReturnValue(Observable.of('success'))
      const paymentInfo = {
        'account-type': 'checking',
        'bank-name': 'First Bank',
        'display-account-number': '************9012',
        'encrypted-account-number': '**fake*encrypted**123456789012**',
        'routing-number': '123456789'
      }
      self.orderService.addPaymentMethod({
        bankAccount: paymentInfo
      }).subscribe((data) => {
        expect(data).toEqual('success')
        done()
      })

      expect(self.orderService.addBankAccountPayment).toHaveBeenCalledWith(paymentInfo, false)
    })

    it('should tell the system to save the new bank account on the donor profile', done => {
      jest.spyOn(self.sessionService, 'getRole').mockReturnValue(Roles.registered)
      jest.spyOn(self.orderService, 'addBankAccountPayment').mockReturnValue(Observable.of('success'))

      const paymentInfo = {}
      self.orderService.addPaymentMethod({
        bankAccount: paymentInfo
      }).subscribe((data) => {
        expect(data).toEqual('success')
        done()
      })

      expect(self.orderService.addBankAccountPayment).toHaveBeenCalledWith(paymentInfo, true)
    })

    it('should save a new credit card payment method', (done) => {
      jest.spyOn(self.orderService, 'addCreditCardPayment').mockReturnValue(Observable.of({ self: { uri: 'new payment method uri' } }))
      const paymentInfo = {
        address: {
          'country-name': 'US',
          'street-address': '123 First St',
          'extended-address': 'Apt 123',
          locality: 'Sacramento',
          'postal-code': '12345',
          region: 'CA'
        },
        'card-number': '**fake*encrypted**1234567890123456**',
        'card-type': 'VISA',
        'cardholder-name': 'Test Name',
        'expiry-month': '06',
        'expiry-year': '12',
        cvv: '123'
      }
      self.orderService.addPaymentMethod({
        creditCard: paymentInfo
      }).subscribe((data) => {
        expect(data).toEqual({ self: { uri: 'new payment method uri' } })
        done()
      })

      expect(self.orderService.addCreditCardPayment).toHaveBeenCalledWith(paymentInfo, false)
    })

    it('should tell the system to save the new credit card on the donor profile', done => {
      jest.spyOn(self.sessionService, 'getRole').mockReturnValue(Roles.registered)
      jest.spyOn(self.orderService, 'addCreditCardPayment').mockReturnValue(Observable.of('success'))

      const paymentInfo = {}
      self.orderService.addPaymentMethod({
        creditCard: paymentInfo
      }).subscribe((data) => {
        expect(data).toEqual('success')
        done()
      })

      expect(self.orderService.addCreditCardPayment).toHaveBeenCalledWith(paymentInfo, true)
    })

    it('should throw an error if the payment info doesn\'t contain a bank account or credit card', () => {
      self.orderService.addPaymentMethod({
        billingAddress: {}
      })
        .subscribe(() => {
          fail('the addPaymentMethod Observable completed successfully when it should have thrown an error')
        },
        (error) => {
          expect(error).toEqual('Error adding payment method. The data passed to orderService.addPaymentMethod did not contain bankAccount or creditCard data')
        })
    })
  })

  describe('updatePaymentMethod', () => {
    let runTestWith
    beforeEach(() => {
      jest.spyOn(self.orderService, 'storeCardSecurityCode').mockImplementation(() => {})
      jest.spyOn(self.orderService, 'selectPaymentMethod').mockReturnValue(Observable.of('placeholder'))

      runTestWith = (paymentInfo, expectedRequestData, expectedCvv) => {
        self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:paymentinstrumentselector:chosen,order:paymentinstrumentselector:chosen:description')
          .respond(200, {
            _order: [{
              _paymentinstrumentselector: [{
                _chosen: [{
                  _description: [{
                    self: {
                      uri: '/paymentinstruments/orders/crugive/<order id>=/orderpaymentinstrument/<payment id>='
                    }
                  }],
                  self: {
                    uri: '/paymentinstruments/orders/crugive/<order id>=/paymentinstrumentselector/<selector id>='
                  }
                }]
              }]
            }]
          })

        self.$httpBackend.expectPUT('https://give-stage2.cru.org/cortex/paymentinstruments/orders/crugive/<order id>=/orderpaymentinstrument/<payment id>=',
          expectedRequestData)
          .respond(200, {})

        self.orderService.updatePaymentMethod({ selectAction: '<select uri>', self: { uri: 'existing payment method uri' } }, { creditCard: paymentInfo })
          .subscribe()

        expect(self.orderService.selectPaymentMethod).toHaveBeenCalledWith('<select uri>')

        self.$httpBackend.flush()
        self.$httpBackend.flush()

        expect(self.orderService.storeCardSecurityCode).toHaveBeenCalledWith(expectedCvv, 'existing payment method uri')
      }
    })

    it('should update the given payment method', () => {
      runTestWith(
        { 'cardholder-name': 'New name', 'last-four-digits': '8888', 'card-type': 'Visa', cvv: '963' },
        {
          'payment-instrument-identification-attributes': {
            'cardholder-name': 'New name', 'last-four-digits': '8888', 'card-type': 'Visa'
          }
        },
        '963')
    })

    it('should update the given payment method with an address', () => {
      runTestWith(
        { 'cardholder-name': 'New name', cvv: '789', address: { country: 'US' } },
        {
          'payment-instrument-identification-attributes': {
            'cardholder-name': 'New name', 'country-name': 'US'
          }
        },
        '789')
    })

    it('should call storeCardSecurityCode with undefined when the cvv wasn\'t changed', () => {
      runTestWith(
        { 'cardholder-name': 'New name', 'card-number': '0000' },
        {
          'payment-instrument-identification-attributes': {
            'cardholder-name': 'New name', 'card-number': '0000'
          }
        },
        undefined)
    })

    it('should update a credit card that has already been selected', () => {
      const paymentInfo = { 'cardholder-name': 'New name', 'last-four-digits': '8888', 'card-type': 'Visa', cvv: '963' }
      const expectedRequestData = {
        'payment-instrument-identification-attributes': {
          'cardholder-name': 'New name', 'last-four-digits': '8888', 'card-type': 'Visa'
        }
      }
      const expectedCvv = '963'
      const expectedPaymentMethodUri = '/paymentinstruments/orders/crugive/<order id>=/orderpaymentinstrument/<payment id>='
      const paymentMethod = {
        selectAction: '<select uri>',
        self: {
          uri: expectedPaymentMethodUri,
          type: 'paymentinstruments.order-payment-instrument'
        }
      }

      self.$httpBackend.expectPUT(`https://give-stage2.cru.org/cortex${expectedPaymentMethodUri}`,
        expectedRequestData)
        .respond(200, {})

      self.orderService.updatePaymentMethod(paymentMethod, { creditCard: paymentInfo })
        .subscribe()

      expect(self.orderService.selectPaymentMethod).not.toHaveBeenCalled()

      self.$httpBackend.flush()

      expect(self.orderService.storeCardSecurityCode).toHaveBeenCalledWith(expectedCvv, expectedPaymentMethodUri)
    })
  })

  describe('getExistingPaymentMethods', () => {
    let expectedResponse, clonedPaymentMethodSelectorResponse
    beforeEach(() => {
      clonedPaymentMethodSelectorResponse = angular.copy(paymentMethodSelectorResponse)
      expectedResponse = [{
        self: {
          type: 'paymentinstruments.payment-instrument',
          uri: '/paymentinstruments/orders/crugive/mnrwmntdmjrgkljvgi4gmljugrstcllbmjqtsllegq2winbvgbrdamrzgm=/orderpaymentinstrument/gazdgmlgha3gmllbha4wmljugi3dmljzguygmllemrsgimtegrqwmnlfmq=',
          href: 'https://give-stage2.cru.org/cortex/paymentinstruments/orders/crugive/mnrwmntdmjrgkljvgi4gmljugrstcllbmjqtsllegq2winbvgbrdamrzgm=/orderpaymentinstrument/gazdgmlgha3gmllbha4wmljugi3dmljzguygmllemrsgimtegrqwmnlfmq='
        },
        messages: [],
        links: [],
        'default-on-profile': true,
        'limit-amount': {
          amount: 0,
          currency: 'USD',
          display: '$0.00'
        },
        name: 'Cru Payment Instrument',
        'account-type': 'Checking',
        'bank-name': 'First Bank',
        'display-account-number': '6548',
        'encrypted-account-number': '0d640924-8399-48b5-851e-808e308c2a8a:GT1pVOxr5KenKbRrvYUpnw',
        'routing-number': '121042882',
        'saved-on-profile': true,
        chosen: true,
        selectAction: '/paymentinstruments/orders/crugive/mnrwmntdmjrgkljvgi4gmljugrstcllbmjqtsllegq2winbvgbrdamrzgm=/paymentinstrumentselector/qk2wgylsoqww64temvzc22loon2he5lnmvxhjwjegazdgmlgha3gmllbha4wmljugi3dmljzguygmllemrsgimtegrqwmnlfmsvgs3ttorzhk3lfnz2nsjbrmftgmojugmzs2mrqha4s2nbqgqzs2ojwgztc2m3emvrtamrtha4tszlc='
      }, {
        self: {
          type: 'paymentinstruments.payment-instrument',
          uri: '/paymentinstruments/crugive/gu4tmyjrgzsggljug5sdiljugzrgellcgvswmljwmftgcnbqmqztonzwmm=',
          href: 'https://give-stage2.cru.org/cortex/paymentinstruments/crugive/gu4tmyjrgzsggljug5sdiljugzrgellcgvswmljwmftgcnbqmqztonzwmm='
        },
        messages: [],
        links: [],
        'default-on-profile': false,
        name: 'Cru Payment Instrument',
        'account-type': 'Savings',
        'bank-name': '2nd Bank',
        'display-account-number': '3456',
        'encrypted-account-number': '',
        'routing-number': '021000021',
        selectAction: '/paymentinstruments/orders/crugive/mnrwmntdmjrgkljvgi4gmljugrstcllbmjqtsllegq2winbvgbrdamrzgm=/paymentinstrumentselector/qkzwg5ltorxw2zlsfvuw443uoj2w2zlootmsinjzgzqtcntemmwtin3egqwtintcmiwwenlfmywtmylgme2dazbtg43tmy5knfxhg5dsovwwk3tu3esdknzzg5sdizjxfu3dinlbfu2dendcfu4tiyjtfu2giyjyge3wcmbwmfsgc='
      }, {
        self: {
          type: 'paymentinstruments.payment-instrument',
          uri: '/paymentinstruments/crugive/gnrgmnlbgm4wgljwmfstcljug5stallbg44welldgrtdgmtggiydmm3bmi=',
          href: 'https://give-stage2.cru.org/cortex/paymentinstruments/crugive/gnrgmnlbgm4wgljwmfstcljug5stallbg44welldgrtdgmtggiydmm3bmi='
        },
        messages: [],
        links: [],
        'default-on-profile': false,
        name: 'Cru Payment Instrument',
        'last-four-digits': '1111',
        'card-type': 'Visa',
        'cardholder-name': 'Test Card',
        'expiry-month': '11',
        'expiry-year': '2019',
        'country-name': 'US',
        'extended-address': '',
        locality: 'Sacramento',
        'postal-code': '12345',
        region: 'CA',
        'street-address': '1234 First Street',
        address: {
          country: 'US',
          extendedAddress: '',
          locality: 'Sacramento',
          postalCode: '12345',
          region: 'CA',
          streetAddress: '1234 First Street'
        },
        selectAction: '/paymentinstruments/orders/crugive/mnrwmntdmjrgkljvgi4gmljugrstcllbmjqtsllegq2winbvgbrdamrzgm=/paymentinstrumentselector/qkzwg5ltorxw2zlsfvuw443uoj2w2zlootmsim3cmy2wcmzzmmwtmylfgewtin3fgawwcnzzmiwwgndggmzgmmrqgyzwcyvknfxhg5dsovwwk3tu3esdinbwge4tonlgfu2wenbzfu2doytbfvqtimjqfu2gmnbvha2dmnrrgi2wg='
      }]
    })

    it('should load a user\'s existing payment methods', (done) => {
      self.$httpBackend.expectGET(
        'https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:paymentinstrumentselector:choice,order:paymentinstrumentselector:choice:description,order:paymentinstrumentselector:chosen,order:paymentinstrumentselector:chosen:description'
      ).respond(200, clonedPaymentMethodSelectorResponse)

      self.orderService.getExistingPaymentMethods()
        .subscribe(data => {
          expect(data).toEqual(expectedResponse)
          done()
        })

      self.$httpBackend.flush()
    })

    it('should load a user\'s existing payment methods even if there is no chosen one', (done) => {
      // Move the payment method in chosen to be one of the choices for this test
      clonedPaymentMethodSelectorResponse._order[0]._paymentinstrumentselector[0]._choice.push(clonedPaymentMethodSelectorResponse._order[0]._paymentinstrumentselector[0]._chosen[0])
      delete clonedPaymentMethodSelectorResponse._order[0]._paymentinstrumentselector[0]._chosen

      self.$httpBackend.expectGET(
        'https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:paymentinstrumentselector:choice,order:paymentinstrumentselector:choice:description,order:paymentinstrumentselector:chosen,order:paymentinstrumentselector:chosen:description'
      ).respond(200, clonedPaymentMethodSelectorResponse)

      // Since there is no chosen element, this payment method should not be marked as chosen
      delete expectedResponse[0].chosen

      self.orderService.getExistingPaymentMethods()
        .subscribe(data => {
          expect(data).toEqual(expectedResponse)
          done()
        })

      self.$httpBackend.flush()
    })

    it('should load a user\'s existing payment methods even if there is no choice element and only a chosen one', (done) => {
      // Delete all the choices so there is only a chosen element for this test
      delete clonedPaymentMethodSelectorResponse._order[0]._paymentinstrumentselector[0]._choice

      self.$httpBackend.expectGET(
        'https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:paymentinstrumentselector:choice,order:paymentinstrumentselector:choice:description,order:paymentinstrumentselector:chosen,order:paymentinstrumentselector:chosen:description'
      ).respond(200, clonedPaymentMethodSelectorResponse)

      // Since there are no choices, there should only be one the one chosen paymentMethod
      expectedResponse = [expectedResponse[0]]

      self.orderService.getExistingPaymentMethods()
        .subscribe(data => {
          expect(data).toEqual(expectedResponse)
          done()
        })

      self.$httpBackend.flush()
    })

    it('should format payment addresses while loading existing payment methods', (done) => {
      clonedPaymentMethodSelectorResponse._order[0]._paymentinstrumentselector[0]._choice[0]._description[0]['payment-instrument-identification-attributes']['extended-address'] = 'Apt B'
      expectedResponse[2].address = { country: 'US', streetAddress: '1234 First Street', extendedAddress: 'Apt B', locality: 'Sacramento', region: 'CA', postalCode: '12345' }
      expectedResponse[2]['extended-address'] = 'Apt B'

      self.$httpBackend.expectGET(
        'https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:paymentinstrumentselector:choice,order:paymentinstrumentselector:choice:description,order:paymentinstrumentselector:chosen,order:paymentinstrumentselector:chosen:description'
      ).respond(200, clonedPaymentMethodSelectorResponse)

      self.orderService.getExistingPaymentMethods()
        .subscribe(data => {
          expect(data).toEqual(expectedResponse)
          done()
        })

      self.$httpBackend.flush()
    })
  })

  describe('selectPaymentMethod', () => {
    it('should post the URI of the selected payment method for cortex to select it', (done) => {
      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/paymentmethods/crugive/giydembug4=/selector/orders/crugive/mm2tsnrrg5qtqljshfsteljuhe2dellcgrrweljugftdgndcg4zweztbmq=',
        {}
      ).respond(200, 'success')

      self.orderService.selectPaymentMethod('/paymentmethods/crugive/giydembug4=/selector/orders/crugive/mm2tsnrrg5qtqljshfsteljuhe2dellcgrrweljugftdgndcg4zweztbmq=')
        .subscribe((data) => {
          expect(data).toEqual('success')
          done()
        })

      self.$httpBackend.flush()
    })
  })

  describe('getCurrentPayment', () => {
    it('should retrieve the current payment details', (done) => {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:paymentinstrumentselector:chosen:description')
        .respond(200, paymentMethodBankAccountResponse)

      const expectedResponse = {
        self: {
          type: 'paymentinstruments.payment-instrument',
          uri: '/paymentinstruments/orders/crugive/mnrwmntdmjrgkljvgi4gmljugrstcllbmjqtsllegq2winbvgbrdamrzgm=/orderpaymentinstrument/gnstmzrymiytoljugbrdmljuheygellcmy2gmllcgm4dsnjygu2gmnryme=',
          href: 'https://give-stage2.cru.org/cortex/paymentinstruments/orders/crugive/mnrwmntdmjrgkljvgi4gmljugrstcllbmjqtsllegq2winbvgbrdamrzgm=/orderpaymentinstrument/gnstmzrymiytoljugbrdmljuheygellcmy2gmllcgm4dsnjygu2gmnryme='
        },
        messages: [],
        links: [],
        'default-on-profile': false,
        'limit-amount': {
          amount: 0,
          currency: 'USD',
          display: '$0.00'
        },
        name: 'Cru Payment Instrument',
        'account-type': 'checking',
        'bank-name': 'My Bank Name',
        'display-account-number': '3456',
        'encrypted-account-number': '4e981aa5-993a-4771-85fa-bbcd322ce189:SHv8dEQBg8XSO5P0SFXwQg',
        'routing-number': '000000000',
        'saved-on-profile': true
      }

      self.orderService.getCurrentPayment()
        .subscribe((data) => {
          expect(data).toEqual(expectedResponse)
          done()
        })

      self.$httpBackend.flush()
    })

    it('should retrieve the current payment details with a billing address', (done) => {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:paymentinstrumentselector:chosen:description')
        .respond(200, paymentMethodCreditCardResponse)

      const expectedPaymentInfo = angular.copy(paymentMethodCreditCardResponse._order[0]._paymentinstrumentselector[0]._chosen[0]._description[0])
      expectedPaymentInfo.address = {
        country: 'US',
        extendedAddress: '',
        locality: 'Sacramento',
        postalCode: '12345',
        region: 'CA',
        streetAddress: '1234 First Street'
      }
      expectedPaymentInfo['payment-instrument-identification-attributes'] = undefined
      expectedPaymentInfo['last-four-digits'] = '1118'
      expectedPaymentInfo['card-type'] = 'MasterCard'
      expectedPaymentInfo['cardholder-name'] = 'Test Person'
      expectedPaymentInfo.description = 'MasterCard - 1118'
      expectedPaymentInfo['expiry-month'] = '08'
      expectedPaymentInfo['expiry-year'] = '2020'
      expectedPaymentInfo['country-name'] = 'US'
      expectedPaymentInfo['extended-address'] = ''
      expectedPaymentInfo.locality = 'Sacramento'
      expectedPaymentInfo['postal-code'] = '12345'
      expectedPaymentInfo.region = 'CA'
      expectedPaymentInfo['street-address'] = '1234 First Street'

      self.orderService.getCurrentPayment()
        .subscribe((data) => {
          expect(data).toEqual(expectedPaymentInfo)
          done()
        })

      self.$httpBackend.flush()
    })
  })

  describe('getPurchaseForms', () => {
    it('should send a request to get the payment form links', (done) => {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:enhancedpurchaseform').respond(200, purchaseFormResponse)
      self.orderService.getPurchaseForm()
        .subscribe((data) => {
          expect(data).toEqual(purchaseFormResponseZoomMapped)
          done()
        })
      self.$httpBackend.flush()
    })
  })

  describe('checkErrors', () => {
    it('should send a request to get the payment form links', (done) => {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order').respond(200, needInfoResponse)
      self.orderService.checkErrors()
        .subscribe((data) => {
          expect(data).toEqual(['need.email', 'need.billing.address', 'need.payment.method'])
          done()
        })
      self.$httpBackend.flush()

      expect(self.$log.error.logs[0]).toEqual(['The user was presented with these `needinfo` errors. They should have been caught earlier in the checkout process.',
        ['Customer email address must be specified.',
         'Billing address must be specified.',
         'Payment method must be specified.'
        ]])
    })

    it('should return undefined and not log anything if there are no errors', (done) => {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order').respond(200, undefined)
      self.orderService.checkErrors()
        .subscribe((data) => {
          expect(data).toBeUndefined()
          done()
        })
      self.$httpBackend.flush()
      self.$log.assertEmpty()
    })
  })

  describe('submit', () => {
    beforeEach(() => {
      // Avoid another http request while testing
      jest.spyOn(self.orderService, 'getPurchaseForm').mockReturnValue(Observable.of(purchaseFormResponseZoomMapped))
    })

    it('should send a request to finalize the purchase', (done) => {
      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/enhancedpurchases/orders/crugive/me3gkzrrmm4dillegq4tiljugmztillbmq4weljqga3wezrwmq3tozjwmu=?FollowLocation=true',
        { 'cover-cc-fees': false, 'radio-call-letters': null, 'tsys-device': '', 'recaptcha-token': null }
      ).respond(200, purchaseResponse)

      self.orderService.submit()
        .subscribe((data) => {
          expect(data).toEqual(purchaseResponse)
          done()
        })

      self.$httpBackend.flush()
    })

    it('should send a request to finalize the purchase and with a CVV', (done) => {
      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/enhancedpurchases/orders/crugive/me3gkzrrmm4dillegq4tiljugmztillbmq4weljqga3wezrwmq3tozjwmu=?FollowLocation=true',
        { 'security-code': '123', 'cover-cc-fees': false, 'radio-call-letters': null, 'tsys-device': '', 'recaptcha-token': null }
      ).respond(200, purchaseResponse)

      self.orderService.submit('123')
        .subscribe((data) => {
          expect(data).toEqual(purchaseResponse)
          done()
        })

      self.$httpBackend.flush()
    })

    it('should send the (true) cover fees flag to the server', (done) => {
      self.$window.localStorage.setItem('coverFees', 'true')

      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/enhancedpurchases/orders/crugive/me3gkzrrmm4dillegq4tiljugmztillbmq4weljqga3wezrwmq3tozjwmu=?FollowLocation=true',
        { 'cover-cc-fees': true, 'radio-call-letters': null, 'tsys-device': '', 'recaptcha-token': null }
      ).respond(200, purchaseResponse)

      self.orderService.submit()
        .subscribe((data) => {
          expect(data).toEqual(purchaseResponse)
          done()
        })

      self.$httpBackend.flush()
    })

    it('should send the radio cover letters to the server', (done) => {
      self.$window.sessionStorage.setItem('radioStationCallLetters', 'WXYZ')

      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/enhancedpurchases/orders/crugive/me3gkzrrmm4dillegq4tiljugmztillbmq4weljqga3wezrwmq3tozjwmu=?FollowLocation=true',
        { 'cover-cc-fees': false, 'radio-call-letters': 'WXYZ', 'tsys-device': '', 'recaptcha-token': null }
      ).respond(200, purchaseResponse)

      self.orderService.submit()
        .subscribe((data) => {
          expect(data).toEqual(purchaseResponse)
          done()
        })

      self.$httpBackend.flush()
    })

    it('should send the tsys device id to the server', (done) => {
      self.tsysService.device = 'test-env'

      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/enhancedpurchases/orders/crugive/me3gkzrrmm4dillegq4tiljugmztillbmq4weljqga3wezrwmq3tozjwmu=?FollowLocation=true',
        { 'cover-cc-fees': false, 'radio-call-letters': null, 'tsys-device': 'test-env', 'recaptcha-token': null }
      ).respond(200, purchaseResponse)

      self.orderService.submit()
        .subscribe((data) => {
          expect(data).toEqual(purchaseResponse)
          done()
        })

      self.$httpBackend.flush()
    })

    it('should send the (false) cover fees flag to the server', (done) => {
      self.$window.localStorage.setItem('coverFees', 'false')

      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/enhancedpurchases/orders/crugive/me3gkzrrmm4dillegq4tiljugmztillbmq4weljqga3wezrwmq3tozjwmu=?FollowLocation=true',
        { 'cover-cc-fees': false, 'radio-call-letters': null, 'tsys-device':'', 'recaptcha-token': null }
      ).respond(200, purchaseResponse)

      self.orderService.submit()
        .subscribe((data) => {
          expect(data).toEqual(purchaseResponse)
          done()
        })

      self.$httpBackend.flush()
    })

    it('should send the (false) cover fees flag to the server if the flag is not set in local storage', (done) => {
      expect(self.$window.localStorage.getItem('coverFees')).toEqual(null)

      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/enhancedpurchases/orders/crugive/me3gkzrrmm4dillegq4tiljugmztillbmq4weljqga3wezrwmq3tozjwmu=?FollowLocation=true',
        { 'cover-cc-fees': false, 'radio-call-letters': null, 'tsys-device':'', 'recaptcha-token': null }
      ).respond(200, purchaseResponse)

      self.orderService.submit()
        .subscribe((data) => {
          expect(data).toEqual(purchaseResponse)
          done()
        })

      self.$httpBackend.flush()
    })

    it('should send the recaptcha data to the server', (done) => {
      const token = 'token'
      self.$window.sessionStorage.setItem('recaptchaToken', token)

      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/enhancedpurchases/orders/crugive/me3gkzrrmm4dillegq4tiljugmztillbmq4weljqga3wezrwmq3tozjwmu=?FollowLocation=true',
        { 'cover-cc-fees': false, 'radio-call-letters': null, 'tsys-device':'', 'recaptcha-token': token }
      ).respond(200, purchaseResponse)

      self.orderService.submit()
        .subscribe((data) => {
          expect(data).toEqual(purchaseResponse)
          done()
        })

      self.$httpBackend.flush()
    })

    it('should clear the recaptcha data from session storage', (done) => {
      const token = 'token'
      self.$window.sessionStorage.setItem('recaptchaToken', token)

      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/enhancedpurchases/orders/crugive/me3gkzrrmm4dillegq4tiljugmztillbmq4weljqga3wezrwmq3tozjwmu=?FollowLocation=true',
        { 'cover-cc-fees': false, 'radio-call-letters': null, 'tsys-device':'', 'recaptcha-token': token }
      ).respond(200, purchaseResponse)

      self.orderService.submit()
        .subscribe((data) => {
          expect(self.$window.sessionStorage.getItem('recaptchaToken')).toEqual(null)
          done()
        })

      self.$httpBackend.flush()
    })
  })

  describe('storeCardSecurityCode', () => {
    it('should save the cvv to session storage', () => {
      self.orderService.storeCardSecurityCode('123', 'new id')

      expect(self.$window.sessionStorage.getItem('cvv')).toEqual('123')
      expect(self.$window.sessionStorage.getItem('storedCvvs')).toEqual('{"new id":"123"}')
    })

    it('should remember previous the encrypted cvv', () => {
      self.orderService.storeCardSecurityCode('321', 'new id')
      self.orderService.storeCardSecurityCode('845', 'new id2')

      expect(self.$window.sessionStorage.getItem('cvv')).toEqual('845')
      expect(self.$window.sessionStorage.getItem('storedCvvs')).toEqual('{"new id":"321","new id2":"845"}')
    })

    it('should set the session storage cvv to be null if a null cvv is passed', () => {
      self.orderService.storeCardSecurityCode('654', 'new id')
      self.orderService.storeCardSecurityCode(null, 'new id3')

      expect(self.$window.sessionStorage.getItem('cvv')).toBeNull()
      expect(self.$window.sessionStorage.getItem('storedCvvs')).toEqual('{"new id":"654"}')
    })

    it('should set the session storage cvv to a stored cvv if a null cvv is passed with a payment method uri that had been previously stored', () => {
      self.orderService.storeCardSecurityCode('654', 'new id')
      self.orderService.storeCardSecurityCode('789', 'new id2')
      self.orderService.storeCardSecurityCode(null, 'new id')

      expect(self.$window.sessionStorage.getItem('cvv')).toEqual('654')
      expect(self.$window.sessionStorage.getItem('storedCvvs')).toEqual('{"new id":"654","new id2":"789"}')
    })
  })

  describe('retrieveCardSecurityCode', () => {
    it('should return the cvv from session storage', () => {
      self.$window.sessionStorage.setItem('cvv', '123')

      expect(self.orderService.retrieveCardSecurityCode()).toEqual('123')
    })
  })

  describe('retrieveCardSecurityCodes', () => {
    it('should return the stored cvvs', () => {
      self.$window.sessionStorage.setItem('storedCvvs', '{"/paymentmethods/crugive/giydsnjqgi=":"123","/paymentmethods/crugive/giydsnjqgy=":"321"}')

      expect(self.orderService.retrieveCardSecurityCodes()).toEqual({
        '/paymentmethods/crugive/giydsnjqgi=': '123',
        '/paymentmethods/crugive/giydsnjqgy=': '321'
      })
    })
  })

  describe('clearCardSecurityCodes', () => {
    it('should clear the stored the encrypted cvv', () => {
      self.$window.sessionStorage.setItem('cvv', '123')
      self.$window.sessionStorage.setItem('storedCvvs', { 'some uri': '456' })
      self.orderService.clearCardSecurityCodes()

      expect(self.$window.sessionStorage.getItem('cvv')).toBeNull()
      expect(self.$window.sessionStorage.getItem('storedCvvs')).toBeNull()
    })
  })

  describe('storeLastPurchaseLink', () => {
    it('should save the link to the completed purchase', () => {
      self.orderService.storeLastPurchaseLink('/purchases/crugive/giydanbt=')

      expect(self.$window.sessionStorage.getItem('lastPurchaseLink')).toEqual('/purchases/crugive/giydanbt=')
    })
  })

  describe('retrieveLastPurchaseLink', () => {
    it('should save the link to the completed purchase', () => {
      self.$window.sessionStorage.setItem('lastPurchaseLink', '/purchases/crugive/hiydanbt=')

      expect(self.orderService.retrieveLastPurchaseLink()).toEqual('/purchases/crugive/hiydanbt=')
    })
  })

  describe('storeCoverFeeDecision', () => {
    it('should save the choice to cover fees', () => {
      self.orderService.storeCoverFeeDecision(true)
      expect(self.$window.localStorage.getItem('coverFees')).toEqual('true')
    })

    it('should save the choice to not cover fees', () => {
      self.orderService.storeCoverFeeDecision(false)
      expect(self.$window.localStorage.getItem('coverFees')).toEqual('false')
    })
  })

  describe('retrieveCoverFeeDecision', () => {
    it('should remember the choice to cover fees', () => {
      self.$window.localStorage.setItem('coverFees', 'true')
      expect(self.orderService.retrieveCoverFeeDecision()).toEqual(true)
    })

    it('should remember the choice to not cover fees', () => {
      self.$window.localStorage.setItem('coverFees', 'false')
      expect(self.orderService.retrieveCoverFeeDecision()).toEqual(false)
    })
  })

  describe('clearCoverFees', () => {
    it('should clear out any knowledge of the donor choosing whether or not to cover fees', () => {
      self.$window.localStorage.setItem('coverFees', 'false')
      self.orderService.clearCoverFees()

      expect(self.$window.localStorage.getItem('coverFees')).toBeNull()
    })
  })

  describe('storeRadioStationData', () => {
    it('should save the choice of radio station', () => {
      self.orderService.storeRadioStationData({ WXYZ: 'Radio Station' })
      expect(self.$window.sessionStorage.getItem('radioStationName')).toEqual('Radio Station')
      expect(self.$window.sessionStorage.getItem('radioStationCallLetters')).toEqual('WXYZ')
    })
  })

  describe('retrieveRadioStationName', () => {
    it('should remember the choice of radio station name', () => {
      self.$window.sessionStorage.setItem('radioStationName', 'Radio Station')
      expect(self.orderService.retrieveRadioStationName()).toEqual('Radio Station')
    })
  })

  describe('retrieveRadioStationCallLetters', () => {
    it('should remember the choice of radio station call letters', () => {
      self.$window.sessionStorage.setItem('radioStationCallLetters', 'WXYZ')
      expect(self.orderService.retrieveRadioStationCallLetters()).toEqual('WXYZ')
    })
  })

  describe('spouseEditableForOrder', () => {
    it('should not be editable for staff', () => {
      expect(self.orderService.spouseEditableForOrder({ staff: true })).toEqual(false)
    })

    it('should be editable during a new order when the spouse name fields are empty', () => {
      expect(self.orderService.spouseEditableForOrder({
        'spouse-name': {}
      })).toEqual(true)

      expect(self.$window.localStorage.getItem('startedOrderWithoutSpouse')).toEqual('true')
    })

    it('should not be editable during a new order when the spouse has a first name', () => {
      expect(self.orderService.spouseEditableForOrder({
        'spouse-name': {
          'given-name': 'Name'
        }
      })).toEqual(false)

      expect(self.$window.localStorage.getItem('startedOrderWithoutSpouse')).toEqual('false')
    })

    it('should not be editable during a new order when the spouse has a last name', () => {
      expect(self.orderService.spouseEditableForOrder({
        'spouse-name': {
          'family-name': 'Name'
        }
      })).toEqual(false)

      expect(self.$window.localStorage.getItem('startedOrderWithoutSpouse')).toEqual('false')
    })

    it('should store the current order uri during a new order', () => {
      expect(self.orderService.spouseEditableForOrder({
        'spouse-name': {},
        links: [
          {
            rel: 'order',
            uri: 'order id'
          }
        ]
      })).toEqual(true)

      expect(self.$window.localStorage.getItem('startedOrderWithoutSpouse')).toEqual('true')
      expect(self.$window.localStorage.getItem('currentOrder')).toEqual('order id')
    })

    it('should be editable during an order that started without a spouse', () => {
      self.$window.localStorage.setItem('startedOrderWithoutSpouse', 'true')
      self.$window.localStorage.setItem('currentOrder', 'order id')

      expect(self.orderService.spouseEditableForOrder({
        'spouse-name': {
          'given-name': 'Name',
          'family-name': 'Name'
        },
        links: [
          {
            rel: 'order',
            uri: 'order id'
          }
        ]
      })).toEqual(true)

      expect(self.$window.localStorage.getItem('startedOrderWithoutSpouse')).toEqual('true')
    })

    it('should not be editable during an order that started with a spouse', () => {
      self.$window.localStorage.setItem('startedOrderWithoutSpouse', 'false')
      self.$window.localStorage.setItem('currentOrder', 'order id')

      expect(self.orderService.spouseEditableForOrder({
        'spouse-name': {},
        links: [
          {
            rel: 'order',
            uri: 'order id'
          }
        ]
      })).toEqual(false)

      expect(self.$window.localStorage.getItem('startedOrderWithoutSpouse')).toEqual('false')
    })

    it('should reset startedOrderWithoutSpouse flag when order id changes', () => {
      self.$window.localStorage.setItem('startedOrderWithoutSpouse', 'false')
      self.$window.localStorage.setItem('currentOrder', 'order id')

      expect(self.orderService.spouseEditableForOrder({
        'spouse-name': {},
        links: [
          {
            rel: 'order',
            uri: 'order id 2'
          }
        ]
      })).toEqual(true)

      expect(self.$window.localStorage.getItem('startedOrderWithoutSpouse')).toEqual('true')
      expect(self.$window.localStorage.getItem('currentOrder')).toEqual('order id 2')
    })
  })
})

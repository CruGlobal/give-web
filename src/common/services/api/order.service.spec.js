import angular from 'angular'
import 'angular-mocks'
import omit from 'lodash/omit'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import formatAddressForTemplate from '../addressHelpers/formatAddressForTemplate'

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

  beforeEach(inject((orderService, cartService, $httpBackend, $window, $log) => {
    self.orderService = orderService
    self.cartService = cartService
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

  const cartResponseZoomMapped = {
    bankAccount: cartResponse._order[0]._paymentmethodinfo[0]._bankaccountform[0],
    creditCard: cartResponse._order[0]._paymentmethodinfo[0]._creditcardform[0],
    rawData: cartResponse
  }

  const purchaseFormResponseZoomMapped = {
    enhancedpurchaseform: purchaseFormResponse._order[0]._enhancedpurchaseform[0],
    rawData: purchaseFormResponse
  }

  describe('getDonorDetails', () => {
    it('should load the donorDetails', () => {
      const donorDetailsResponseZoomMapped = {
        donorDetails: donorDetailsResponse._order[0]._donordetails[0],
        email: donorDetailsResponse._order[0]._emailinfo[0]._email[0],
        emailForm: donorDetailsResponse._order[0]._emailinfo[0]._emailform[0],
        rawData: donorDetailsResponse
      }

      //
      const expectedDonorDetails = omit(donorDetailsResponseZoomMapped.donorDetails, 'mailing-address')
      expectedDonorDetails.mailingAddress = formatAddressForTemplate(donorDetailsResponseZoomMapped.donorDetails['mailing-address'])
      expectedDonorDetails.email = donorDetailsResponseZoomMapped.email.email
      expectedDonorDetails.emailFormUri = donorDetailsResponseZoomMapped.emailForm.links[0].uri

      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:donordetails,order:emailinfo:email,order:emailinfo:emailform')
        .respond(200, donorDetailsResponse)
      self.orderService.getDonorDetails()
        .subscribe((data) => {
          expect(data).toEqual(expectedDonorDetails)
        })
      self.$httpBackend.flush()
    })

    it('should set the mailingAddress country to US if undefined', () => {
      donorDetailsResponse._order[0]._donordetails[0]['mailing-address']['country-name'] = ''
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:donordetails,order:emailinfo:email,order:emailinfo:emailform')
        .respond(200, donorDetailsResponse)
      self.orderService.getDonorDetails()
        .subscribe((data) => {
          expect(data).toEqual(expect.objectContaining({
            mailingAddress: expect.objectContaining({ country: 'US' })
          }))
        })
      self.$httpBackend.flush()
    })

    it('should handle an undefined response', () => {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:donordetails,order:emailinfo:email,order:emailinfo:emailform')
        .respond(200, {})
      self.orderService.getDonorDetails()
        .subscribe((data) => {
          expect(data).toEqual({
            name: {},
            mailingAddress: { country: 'US' },
            email: undefined,
            emailFormUri: undefined
          })
        })
      self.$httpBackend.flush()
    })
  })

  describe('updateDonorDetails', () => {
    it('should send a request to save the donor details', () => {
      self.$httpBackend.expectPUT(
        'https://give-stage2.cru.org/cortex/donordetails/orders/crugive/mjstoztgmqydaljrmeytqljumm3dmljymnrdallbhfsdqnbrmq2wimrqgu=',
        {
          self: {
            type: 'elasticpath.donordetails.donor',
            uri: '/donordetails/orders/crugive/mjstoztgmqydaljrmeytqljumm3dmljymnrdallbhfsdqnbrmq2wimrqgu=',
            href: 'https://give-stage2.cru.org/cortex/donordetails/orders/crugive/mjstoztgmqydaljrmeytqljumm3dmljymnrdallbhfsdqnbrmq2wimrqgu='
          },
          'mailing-address': {
            'country-name': 'US',
            'street-address': '123 First St',
            'extended-address': 'Apt 123',
            locality: 'Sacramento',
            'postal-code': '12345',
            region: 'CA'
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
        })
      self.$httpBackend.flush()
    })
  })

  describe('addEmail', () => {
    it('should send a request to save the email', () => {
      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/emails/crugive',
        { email: 'someemail@somedomain.com' }
      ).respond(200, 'somedata')
      self.orderService.addEmail('someemail@somedomain.com', '/emails/crugive')
        .subscribe((data) => {
          expect(data).toEqual('somedata')
        })
      self.$httpBackend.flush()
    })
  })

  describe('getPaymentMethodForms', () => {
    function setupRequest () {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:paymentmethodinfo:bankaccountform,order:paymentmethodinfo:creditcardform')
        .respond(200, cartResponse)
    }

    function initiateRequest () {
      self.orderService.getPaymentMethodForms()
        .subscribe((data) => {
          expect(data).toEqual(cartResponseZoomMapped)
        })
    }

    it('should send a request to get the payment form links', () => {
      setupRequest()
      initiateRequest()
      self.$httpBackend.flush()
    })

    it('should use the cached response if called a second time', () => {
      setupRequest()
      initiateRequest()
      self.$httpBackend.flush()
      initiateRequest()
    })
  })

  describe('addBankAccountPayment', () => {
    it('should send a request to save the bank account payment info', () => {
      const paymentInfo = {
        'account-type': 'checking',
        'bank-name': 'First Bank',
        'display-account-number': '************9012',
        'encrypted-account-number': '**fake*encrypted**123456789012**',
        'routing-number': '123456789'
      }

      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/bankaccounts/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=?followLocation=true',
        paymentInfo
      ).respond(200, 'success')

      // cache getPaymentForms response to avoid another http request while testing
      self.orderService.paymentMethodForms = cartResponseZoomMapped

      self.orderService.addBankAccountPayment(paymentInfo)
        .subscribe((data) => {
          expect(data).toEqual('success')
        })

      self.$httpBackend.flush()
    })
  })

  describe('addCreditCardPayment', () => {
    beforeEach(() => {
      jest.spyOn(self.orderService, 'storeCardSecurityCode').mockImplementation(() => {})
    })

    it('should send a request to save the credit card payment info with no billing address', () => {
      const paymentInfo = {
        'card-number': '**fake*encrypted**1234567890123456**',
        'card-type': 'VISA',
        'cardholder-name': 'Test Name',
        'expiry-month': '06',
        'expiry-year': '12',
        cvv: '456'
      }

      const paymentInfoWithoutCVV = angular.copy(paymentInfo)
      delete paymentInfoWithoutCVV.cvv

      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/creditcards/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=?followLocation=true',
        paymentInfoWithoutCVV
      ).respond(200, { self: { uri: 'new cc uri' } })

      // cache getPaymentForms response to avoid another http request while testing
      self.orderService.paymentMethodForms = cartResponseZoomMapped

      self.orderService.addCreditCardPayment(paymentInfo)
        .subscribe((data) => {
          expect(data).toEqual({ self: { uri: 'new cc uri' } })
        })

      self.$httpBackend.flush()

      expect(self.orderService.storeCardSecurityCode).toHaveBeenCalledWith('456', 'new cc uri')
    })

    it('should send a request to save the credit card payment info with a billing address', () => {
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

      const paymentInfoWithoutCVV = angular.copy(paymentInfo)
      delete paymentInfoWithoutCVV.cvv
      paymentInfoWithoutCVV.address = {
        'country-name': 'US',
        'street-address': '123 First St',
        'extended-address': 'Apt 123',
        locality: 'Sacramento',
        'postal-code': '12345',
        region: 'CA'
      }

      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/creditcards/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=?followLocation=true',
        paymentInfoWithoutCVV
      ).respond(200, { self: { uri: 'new cc uri' } })

      // cache getPaymentForms response to avoid another http request while testing
      self.orderService.paymentMethodForms = cartResponseZoomMapped

      self.orderService.addCreditCardPayment(paymentInfo)
        .subscribe((data) => {
          expect(data).toEqual({ self: { uri: 'new cc uri' } })
        })

      self.$httpBackend.flush()

      expect(self.orderService.storeCardSecurityCode).toHaveBeenCalledWith('789', 'new cc uri')
    })
  })

  describe('addPaymentMethod', () => {
    it('should save a new bank account payment method', () => {
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
      })

      expect(self.orderService.addBankAccountPayment).toHaveBeenCalledWith(paymentInfo)
    })

    it('should save a new credit card payment method', () => {
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
      })

      expect(self.orderService.addCreditCardPayment).toHaveBeenCalledWith(paymentInfo)
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
      runTestWith = (paymentInfo, expectedRequestData, expectedCvv) => {
        jest.spyOn(self.orderService, 'storeCardSecurityCode').mockImplementation(() => {})
        jest.spyOn(self.orderService, 'selectPaymentMethod').mockReturnValue(Observable.of('placeholder'))
        self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:paymentmethodinfo:creditcardupdateform')
          .respond(200, {
            _order: [{
              _paymentmethodinfo: [{
                _creditcardupdateform: [{
                  links: [
                    {
                      rel: 'updatecreditcardfororderaction',
                      uri: '/creditcards/orders/crugive/default=/update/<payment id>='
                    }
                  ]
                }]
              }]
            }]
          })

        self.$httpBackend.expectPOST('https://give-stage2.cru.org/cortex/creditcards/orders/crugive/default=/update/<payment id>=',
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
      runTestWith({ 'cardholder-name': 'New name', 'last-four-digits': '8888', 'card-type': 'Visa', cvv: '963' },
        { 'cardholder-name': 'New name', 'last-four-digits': '8888', 'card-type': 'Visa' }, '963')
    })

    it('should update the given payment method with an address', () => {
      runTestWith({ 'cardholder-name': 'New name', cvv: '789', address: { country: 'US' } },
        { 'cardholder-name': 'New name', address: { 'country-name': 'US' } }, '789')
    })

    it('should call storeCardSecurityCode with undefined when the cvv wasn\'t changed', () => {
      runTestWith({ 'cardholder-name': 'New name', 'card-number': '0000' },
        { 'cardholder-name': 'New name', 'card-number': '0000' }, undefined)
    })
  })

  describe('getExistingPaymentMethods', () => {
    let expectedResponse, clonedPaymentMethodSelectorResponse
    beforeEach(() => {
      clonedPaymentMethodSelectorResponse = angular.copy(paymentMethodSelectorResponse)
      expectedResponse = [{
        self: {
          type: 'elasticpath.bankaccounts.bank-account',
          uri: '/paymentmethods/crugive/giydcmzyge=',
          href: 'https://give-stage2.cru.org/cortex/paymentmethods/crugive/giydcmzyge='
        },
        links: [{
          rel: 'list',
          type: 'elasticpath.collections.links',
          uri: '/paymentmethods/crugive',
          href: 'https://give-stage2.cru.org/cortex/paymentmethods/crugive'
        }, {
          rel: 'bankaccount',
          type: 'elasticpath.bankaccounts.bank-account',
          uri: '/bankaccounts/paymentmethods/crugive/giydcmzyge=',
          href: 'https://give-stage2.cru.org/cortex/bankaccounts/paymentmethods/crugive/giydcmzyge='
        }],
        'account-type': 'Checking',
        'bank-name': 'First Bank',
        'display-account-number': '6548',
        'encrypted-account-number': 'FAecKEPeUdW6KjbHo/na/hXlAS9OjZR51dlBgKKInf2mJh4bSP9WMvsKfAAL1rW7o6P9Rmx87dp0rDz0NArbWGIdsYeoFVOaIATzQqAe4ECuy0gfHcDva26HmgriGqRWkWPDeQvEdU9jENu0XKskxAjk2sBLJOHhoTCi8+LTLUrNwu40CSdT/PGNK8/lnO27wTZDPmc221xJ6hzB/F+0sRRvJhWky2oxA491MG+SRk7lWhccqSq5KtrijfA88Ebb/EivnsSJwqZgv/WNIP2u/V3dsMF1YRtyEsEAkmgxCCYBye2TT5ehIVOChQdlUbHxF+z/izrmn+0u2IYXvyX4dw==',
        'routing-number': '121042882',
        chosen: true,
        selectAction: '/paymentmethods/crugive/giydcmzyge=/selector/orders/crugive/mm2tsnrrg5qtqljshfsteljuhe2dellcgrrweljugftdgndcg4zweztbmq='
      }, {
        self: {
          type: 'elasticpath.bankaccounts.bank-account',
          uri: '/paymentmethods/crugive/giydcnzyga=',
          href: 'https://give-stage2.cru.org/cortex/paymentmethods/crugive/giydcnzyga='
        },
        links: [{
          rel: 'list',
          type: 'elasticpath.collections.links',
          uri: '/paymentmethods/crugive',
          href: 'https://give-stage2.cru.org/cortex/paymentmethods/crugive'
        }, {
          rel: 'bankaccount',
          type: 'elasticpath.bankaccounts.bank-account',
          uri: '/bankaccounts/paymentmethods/crugive/giydcnzyga=',
          href: 'https://give-stage2.cru.org/cortex/bankaccounts/paymentmethods/crugive/giydcnzyga='
        }],
        'account-type': 'Savings',
        'bank-name': '2nd Bank',
        'display-account-number': '3456',
        'encrypted-account-number': '',
        'routing-number': '021000021',
        selectAction: '/paymentmethods/crugive/giydcnzyga=/selector/orders/crugive/mm2tsnrrg5qtqljshfsteljuhe2dellcgrrweljugftdgndcg4zweztbmq='
      }, {
        self: {
          type: 'cru.creditcards.named-credit-card',
          uri: '/paymentmethods/crugive/giydembug4=',
          href: 'https://give-stage2.cru.org/cortex/paymentmethods/crugive/giydembug4='
        },
        links: [{
          rel: 'list',
          type: 'elasticpath.collections.links',
          uri: '/paymentmethods/crugive',
          href: 'https://give-stage2.cru.org/cortex/paymentmethods/crugive'
        }, {
          rel: 'creditcard',
          type: 'cru.creditcards.named-credit-card',
          uri: '/creditcards/paymentmethods/crugive/giydembug4=',
          href: 'https://give-stage2.cru.org/cortex/creditcards/paymentmethods/crugive/giydembug4='
        }],
        'card-number': '1111',
        'card-type': 'Visa',
        'cardholder-name': 'Test Card',
        'expiry-month': '11',
        'expiry-year': '2019',
        selectAction: '/paymentmethods/crugive/giydembug4=/selector/orders/crugive/mm2tsnrrg5qtqljshfsteljuhe2dellcgrrweljugftdgndcg4zweztbmq='
      }]
    })

    it('should load a user\'s existing payment methods', () => {
      self.$httpBackend.expectGET(
        'https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:paymentmethodinfo:selector:choice,order:paymentmethodinfo:selector:choice:description,order:paymentmethodinfo:selector:chosen,order:paymentmethodinfo:selector:chosen:description'
      ).respond(200, clonedPaymentMethodSelectorResponse)

      self.orderService.getExistingPaymentMethods()
        .subscribe(data => {
          expect(data).toEqual(expectedResponse)
        })

      self.$httpBackend.flush()
    })

    it('should load a user\'s existing payment methods even if there is no chosen one', () => {
      // Move the payment method in chosen to be one of the choices for this test
      clonedPaymentMethodSelectorResponse._order[0]._paymentmethodinfo[0]._selector[0]._choice.push(clonedPaymentMethodSelectorResponse._order[0]._paymentmethodinfo[0]._selector[0]._chosen[0])
      delete clonedPaymentMethodSelectorResponse._order[0]._paymentmethodinfo[0]._selector[0]._chosen

      self.$httpBackend.expectGET(
        'https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:paymentmethodinfo:selector:choice,order:paymentmethodinfo:selector:choice:description,order:paymentmethodinfo:selector:chosen,order:paymentmethodinfo:selector:chosen:description'
      ).respond(200, clonedPaymentMethodSelectorResponse)

      // Since there is no chosen element, this payment method should not be marked as chosen
      delete expectedResponse[0].chosen

      self.orderService.getExistingPaymentMethods()
        .subscribe(data => {
          expect(data).toEqual(expectedResponse)
        })

      self.$httpBackend.flush()
    })

    it('should load a user\'s existing payment methods even if there is no choice element and only a chosen one', () => {
      // Delete all the choices so there is only a chosen element for this test
      delete clonedPaymentMethodSelectorResponse._order[0]._paymentmethodinfo[0]._selector[0]._choice

      self.$httpBackend.expectGET(
        'https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:paymentmethodinfo:selector:choice,order:paymentmethodinfo:selector:choice:description,order:paymentmethodinfo:selector:chosen,order:paymentmethodinfo:selector:chosen:description'
      ).respond(200, clonedPaymentMethodSelectorResponse)

      // Since there are no choices, there should only be one the one chosen paymentMethod
      expectedResponse = [expectedResponse[0]]

      self.orderService.getExistingPaymentMethods()
        .subscribe(data => {
          expect(data).toEqual(expectedResponse)
        })

      self.$httpBackend.flush()
    })

    it('should format payment addresses while loading existing payment methods', () => {
      clonedPaymentMethodSelectorResponse._order[0]._paymentmethodinfo[0]._selector[0]._chosen[0]._description[0].address = { 'country-name': 'US' }
      expectedResponse[0].address = { country: 'US', streetAddress: undefined, extendedAddress: undefined, locality: undefined, region: undefined, postalCode: undefined }

      self.$httpBackend.expectGET(
        'https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:paymentmethodinfo:selector:choice,order:paymentmethodinfo:selector:choice:description,order:paymentmethodinfo:selector:chosen,order:paymentmethodinfo:selector:chosen:description'
      ).respond(200, clonedPaymentMethodSelectorResponse)

      self.orderService.getExistingPaymentMethods()
        .subscribe(data => {
          expect(data).toEqual(expectedResponse)
        })

      self.$httpBackend.flush()
    })
  })

  describe('selectPaymentMethod', () => {
    it('should post the URI of the selected payment method for cortex to select it', () => {
      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/paymentmethods/crugive/giydembug4=/selector/orders/crugive/mm2tsnrrg5qtqljshfsteljuhe2dellcgrrweljugftdgndcg4zweztbmq=',
        {}
      ).respond(200, 'success')

      self.orderService.selectPaymentMethod('/paymentmethods/crugive/giydembug4=/selector/orders/crugive/mm2tsnrrg5qtqljshfsteljuhe2dellcgrrweljugftdgndcg4zweztbmq=')
        .subscribe((data) => {
          expect(data).toEqual('success')
        })

      self.$httpBackend.flush()
    })
  })

  describe('getCurrentPayment', () => {
    it('should retrieve the current payment details', () => {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:paymentmethodinfo:paymentmethod')
        .respond(200, paymentMethodBankAccountResponse)

      self.orderService.getCurrentPayment()
        .subscribe((data) => {
          expect(data).toEqual(paymentMethodBankAccountResponse._order[0]._paymentmethodinfo[0]._paymentmethod[0])
        })

      self.$httpBackend.flush()
    })

    it('should retrieve the current payment details with a billing address', () => {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:paymentmethodinfo:paymentmethod')
        .respond(200, paymentMethodCreditCardResponse)

      const expectedPaymentInfo = angular.copy(paymentMethodCreditCardResponse._order[0]._paymentmethodinfo[0]._paymentmethod[0])
      expectedPaymentInfo.address = {
        country: 'US',
        extendedAddress: '',
        locality: 'Sacramento',
        postalCode: '12345',
        region: 'CA',
        streetAddress: '1234 First Street'
      }
      self.orderService.getCurrentPayment()
        .subscribe((data) => {
          expect(data).toEqual(expectedPaymentInfo)
        })

      self.$httpBackend.flush()
    })
  })

  describe('getPurchaseForms', () => {
    it('should send a request to get the payment form links', () => {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:enhancedpurchaseform').respond(200, purchaseFormResponse)
      self.orderService.getPurchaseForm()
        .subscribe((data) => {
          expect(data).toEqual(purchaseFormResponseZoomMapped)
        })
      self.$httpBackend.flush()
    })
  })

  describe('checkErrors', () => {
    it('should send a request to get the payment form links', () => {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:needinfo').respond(200, needInfoResponse)
      self.orderService.checkErrors()
        .subscribe((data) => {
          expect(data).toEqual(['email-info', 'billing-address-info', 'payment-method-info'])
        })
      self.$httpBackend.flush()

      expect(self.$log.error.logs[0]).toEqual(['The user was presented with these `needinfo` errors. They should have been caught earlier in the checkout process.', ['email-info', 'billing-address-info', 'payment-method-info']])
    })

    it('should return undefined and not log anything if there are no errors', () => {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/carts/crugive/default?zoom=order:needinfo').respond(200, undefined)
      self.orderService.checkErrors()
        .subscribe((data) => {
          expect(data).toBeUndefined()
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

    it('should send a request to finalize the purchase', () => {
      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/enhancedpurchases/orders/crugive/me3gkzrrmm4dillegq4tiljugmztillbmq4weljqga3wezrwmq3tozjwmu=?followLocation=true',
        { 'cover-cc-fees': false, 'radio-call-letters': null }
      ).respond(200, purchaseResponse)

      self.orderService.submit()
        .subscribe((data) => {
          expect(data).toEqual(purchaseResponse)
        })

      self.$httpBackend.flush()
    })

    it('should send a request to finalize the purchase and with a CVV', () => {
      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/enhancedpurchases/orders/crugive/me3gkzrrmm4dillegq4tiljugmztillbmq4weljqga3wezrwmq3tozjwmu=?followLocation=true',
        { 'security-code': '123', 'cover-cc-fees': false, 'radio-call-letters': null }
      ).respond(200, purchaseResponse)

      self.orderService.submit('123')
        .subscribe((data) => {
          expect(data).toEqual(purchaseResponse)
        })

      self.$httpBackend.flush()
    })

    it('should send the (true) cover fees flag to the server', () => {
      self.$window.localStorage.setItem('coverFees', 'true')

      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/enhancedpurchases/orders/crugive/me3gkzrrmm4dillegq4tiljugmztillbmq4weljqga3wezrwmq3tozjwmu=?followLocation=true',
        { 'cover-cc-fees': true, 'radio-call-letters': null }
      ).respond(200, purchaseResponse)

      self.orderService.submit()
        .subscribe((data) => {
          expect(data).toEqual(purchaseResponse)
        })

      self.$httpBackend.flush()
    })

    it('should send the radio cover letters to the server', (done) => {
      self.$window.sessionStorage.setItem('radioStationCallLetters', 'WXYZ')

      self.$httpBackend.expectPOST(
        'https://give-stage2.cru.org/cortex/enhancedpurchases/orders/crugive/me3gkzrrmm4dillegq4tiljugmztillbmq4weljqga3wezrwmq3tozjwmu=?followLocation=true',
        { 'cover-cc-fees': false, 'radio-call-letters': 'WXYZ' }
      ).respond(200, purchaseResponse)

      self.orderService.submit()
        .subscribe((data) => {
          expect(data).toEqual(purchaseResponse)
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
      self.orderService.storeRadioStationData({ Description: 'Radio Station', MediaId: 'WXYZ' })
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

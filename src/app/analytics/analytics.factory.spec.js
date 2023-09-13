import angular from 'angular'
import 'angular-mocks'

import module from './analytics.factory'

describe('branded analytics factory', () => {
  beforeEach(angular.mock.module(module.name, 'environment'))

  const self = {}
  beforeEach(inject((analyticsFactory, envService, $window) => {
    self.analyticsFactory = analyticsFactory
    self.envService = envService
    self.$window = $window
    self.$window.dataLayer = []
  }))

  describe('handleCheckoutFormErrors', () => {
    const form = {
      $valid: false,
      $dirty: true,
      firstName: {
        $invalid: true,
        $error: {
          required: true
        }
      },
      lastName: {
        $invalid: false,
        $error: {}
      },
      middleName: {
        $invalid: true,
        $error: {
          capitalized: true,
          maxLength: true
        }
      }
    }

    it('calls checkoutFieldError for each error', () => {
      jest.spyOn(self.analyticsFactory, 'checkoutFieldError')
      jest.spyOn(self.envService, 'read').mockImplementation(name => name === 'isCheckout')

      self.analyticsFactory.handleCheckoutFormErrors(form)
      expect(self.analyticsFactory.checkoutFieldError.mock.calls).toEqual([
        ['firstName', 'required'],
        ['middleName', 'capitalized'],
        ['middleName', 'maxLength']
      ])
    })

    it('does nothing when not checkout out', () => {
      jest.spyOn(self.analyticsFactory, 'checkoutFieldError')
      jest.spyOn(self.envService, 'read').mockReturnValue(false)

      self.analyticsFactory.handleCheckoutFormErrors(form)
      expect(self.analyticsFactory.checkoutFieldError).not.toHaveBeenCalled()
    })
  })

  describe('cartAdd', () => {
    const itemConfig = {
      "campaign-page": "",
      "jcr-title": "John Doe",
      "recurring-day-of-month": "13",
      "recurring-start-month": "09",
      "amount": 50
    }
    const productData = {
      "uri": "items/crugive/a5t4fmspmfpwpqv3le7hgksifu=",
      "frequencies": [
          {
              "name": "SEMIANNUAL",
              "display": "Semi-Annually",
              "selectAction": "/itemselections/crugive/a5t4fmspmfpwpqv3le7hgksifu=/options/izzgk4lvmvxgg6i=/values/kncu2skbjzhfkqkm=/selector"
          },
          {
              "name": "QUARTERLY",
              "display": "Quarterly",
              "selectAction": "/itemselections/crugive/a5t4fmspmfpwpqv3le7hgksifu=/options/izzgk4lvmvxgg6i=/values/kfkucusuivjeywi=/selector"
          },
          {
              "name": "MON",
              "display": "Monthly",
              "selectAction": "/itemselections/crugive/a5t4fmspmfpwpqv3le7hgksifu=/options/izzgk4lvmvxgg6i=/values/jvhu4=/selector"
          },
          {
              "name": "ANNUAL",
              "display": "Annually",
              "selectAction": "/itemselections/crugive/a5t4fmspmfpwpqv3le7hgksifu=/options/izzgk4lvmvxgg6i=/values/ifhe4vkbjq=/selector"
          },
          {
              "name": "NA",
              "display": "Single",
              "selectAction": ""
          }
      ],
      "frequency": "NA",
      "displayName": "International Staff",
      "designationType": "Staff",
      "code": "0643021",
      "designationNumber": "0643021",
      "orgId": "STAFF"
    }


    it('calls checkoutFieldError for each error', () => {
      jest.spyOn(self.envService, 'read').mockImplementation(name => name === 'isCheckout')

      self.analyticsFactory.cartAdd(itemConfig, productData)

      expect(self.$window.dataLayer.length).toEqual(1)
      expect(self.$window.dataLayer[0].event).toEqual('add-to-cart')
      expect(self.$window.dataLayer[0].ecommerce.add.products[0]).toEqual({
        item_id: productData.code,
        item_name: productData.displayName,
        item_brand: productData.orgId,
        item_category: productData.designationType.toLowerCase(),
        item_variant: 'single',
        currency: 'USD',
        price: itemConfig.amount.toString(),
        quantity: '1',
        recurring_date: 'September 13, 2023'
      })
    })

  });
});

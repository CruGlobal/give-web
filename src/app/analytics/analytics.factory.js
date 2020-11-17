import './analytics.module'
import angular from 'angular'
import get from 'lodash/get'
import find from 'lodash/find'
import sha3 from 'crypto-js/sha3'
import merge from 'lodash/merge'
import isEmpty from 'lodash/isEmpty'
/* global localStorage */

const analyticsFactory = /* @ngInject */ function ($window, $timeout, sessionService) {
  return {
    buildProductVar: function (cartData) {
      try {
        var item, donationType

        // Instantiate cart data layer
        const hash = sha3(cartData.id, { outputLength: 80 }) // limit hash to 20 characters
        $window.digitalData.cart = {
          id: cartData.id,
          hash: cartData.id ? hash.toString() : null,
          item: []
        }

        // Build cart data layer
        $window.digitalData.cart.price = {
          cartTotal: cartData && cartData.cartTotal
        }

        if (cartData && cartData.items) {
          for (var i = 0; i < cartData.items.length; i++) {
            // Set donation type
            if (cartData.items[i].frequency.toLowerCase() === 'single') {
              donationType = 'one-time donation'
            } else {
              donationType = 'recurring donation'
            }

            item = {
              productInfo: {
                productID: cartData.items[i].designationNumber,
                designationType: cartData.items[i].designationType
              },
              price: {
                basePrice: cartData.items[i].amount
              },
              attributes: {
                donationType: donationType,
                donationFrequency: cartData.items[i].frequency.toLowerCase(),
                siebel: {
                  productType: 'designation',
                  campaignCode: cartData.items[i].config['campaign-code']
                }
              }
            }

            $window.digitalData.cart.item.push(item)
          }
        }
      } catch (e) {
        // Error caught in analyticsFactory.buildProductVar
      }
    },
    cartAdd: function (itemConfig, productData) {
      try {
        var siteSubSection
        var cart = {
          item: [{
            productInfo: {
              productID: productData.designationNumber,
              designationType: productData.designationType
            },
            price: {
              basePrice: itemConfig.amount
            },
            attributes: {
              siebel: {
                productType: 'designation'
              }
            }
          }]
        }

        // Set site sub-section
        if (typeof $window.digitalData.page !== 'undefined') {
          if (typeof $window.digitalData.page.category !== 'undefined') {
            $window.digitalData.page.category.subCategory1 = siteSubSection
          } else {
            $window.digitalData.page.category = {
              subCategory1: siteSubSection
            }
          }
        } else {
          $window.digitalData.page = {
            category: {
              subcategory1: siteSubSection
            }
          }
        }

        // Set donation type
        if (productData.frequency === 'NA') {
          cart.item[0].attributes.donationType = 'one-time donation'
        } else {
          cart.item[0].attributes.donationType = 'recurring donation'
        }

        // Set donation frequency
        const frequencyObj = find(productData.frequencies, { name: productData.frequency })
        cart.item[0].attributes.donationFrequency = frequencyObj && frequencyObj.display.toLowerCase()

        // Set data layer
        $window.digitalData.cart = cart
        // Send GTM Advance Ecommerce event
        if (typeof $window.dataLayer !== 'undefined') {
          $window.dataLayer.push({
            event: 'add-to-cart',
            ecommerce: {
              currencyCode: 'USD',
              add: {
                products: [{
                  name: productData.displayName.toLowerCase(),
                  id: productData.designationNumber,
                  price: itemConfig.amount.toString(),
                  brand: 'cru',
                  category: productData.designationType.toLowerCase(),
                  variant: frequencyObj.display.toLowerCase(),
                  quantity: '1'
                }]
              }
            }
          })
        }

        // Call DTM direct call rule
        if (typeof $window._satellite !== 'undefined') {
          $window._satellite.track('aa-add-to-cart')
        }
      } catch (e) {
        // Error caught in analyticsFactory.cartAdd
      }
    },
    cartRemove: function (item) {
      try {
        if (item) {
          $window.digitalData.cart.item = [{
            productInfo: {
              productID: item.designationNumber,
              designationType: item.designationType
            },
            price: {
              basePrice: item.amount
            },
            attributes: {
              donationType: item.frequency.toLowerCase() === 'single' ? 'one-time donation' : 'recurring donation',
              donationFrequency: item.frequency.toLowerCase(),
              siebel: {
                productType: 'designation',
                campaignCode: item.config['campaign-code']
              }
            }
          }]
          if (typeof $window._satellite !== 'undefined') {
            $window._satellite.track('aa-cart-remove')
          }
          // Send GTM Advance Ecommerce event
          if (typeof $window.dataLayer !== 'undefined') {
            $window.dataLayer.push({
              event: 'remove-from-cart',
              ecommerce: {
                currencyCode: 'USD',
                remove: {
                  products: [{
                    name: item.displayName.toLowerCase(),
                    id: item.designationNumber,
                    price: item.amount.toString(),
                    brand: 'cru',
                    category: item.designationType.toLowerCase(),
                    variant: item.frequency.toLowerCase(),
                    quantity: '1'
                  }]
                }
              }
            })
          }
        }
      } catch (e) {
        // Error caught in analyticsFactory.cartRemove
      }
    },
    cartView: function (isMiniCart = false) {
      try {
        // Send GTM Advance Ecommerce event
        if (typeof $window.dataLayer !== 'undefined') {
          $window.dataLayer.push({
            event: isMiniCart ? 'view-mini-cart' : 'view-cart'
          })
        }
      } catch (e) {
        // Error caught in analyticsFactory.cartView
      }
    },
    checkoutStepEvent: function (step, cart) {
      const cartObject = cart.items.map((cartItem) => {
        return {
          name: cartItem.displayName.toLowerCase(),
          id: cartItem.code,
          price: cartItem.amount.toString(),
          branch: 'cru',
          category: cartItem.designationType.toLowerCase(),
          variant: cartItem.frequency.toLowerCase(),
          quantity: '1'
        }
      })
      try {
        if (typeof $window.dataLayer !== 'undefined') {
          $window.dataLayer.push({
            event: 'checkout-step',
            cartId: cart.id,
            ecommerce: {
              currencyCode: 'USD',
              checkout: {
                actionField: {
                  step: step,
                  option: ''
                },
                products: [
                  ...cartObject
                ]
              }
            }
          })
        }
      } catch (e) {
        // Error caught in analyticsFactory.checkoutStepEvent
      }
    },
    checkoutStepOptionEvent: function (option, step) {
      try {
        $window.dataLayer.push({
          event: 'checkout-option',
          ecommerce: {
            checkout_option: {
              actionField: {
                step: step.toLowerCase(),
                option: option.toLowerCase()
              }
            }
          }
        })
      } catch (e) {
        // Error caught in analyticsFactory.checkoutStepOptionEvent
      }
    },
    editRecurringDonation: function (giftData) {
      try {
        var frequency = ''

        if (giftData && giftData.length) {
          if (get(giftData, '[0].gift["updated-rate"].recurrence.interval')) {
            frequency = giftData[0].gift['updated-rate'].recurrence.interval.toLowerCase()
          } else {
            const interval = get(giftData, '[0].parentDonation.rate.recurrence.interval')
            frequency = interval && interval.toLowerCase()
          }

          if (typeof $window.digitalData !== 'undefined') {
            if (typeof $window.digitalData.recurringGift !== 'undefined') {
              $window.digitalData.recurringGift.originalFrequency = frequency
            } else {
              $window.digitalData.recurringGift = {
                originalFrequency: frequency
              }
            }
          } else {
            $window.digitalData = {
              recurringGift: {
                originalFrequency: frequency
              }
            }
          }
        }

        this.pageLoaded()
      } catch (e) {
        // Error caught in analyticsFactory.editRecurringDonation
      }
    },
    getPath: function () {
      try {
        var pagename = ''
        var delim = ' : '
        var path = $window.location.pathname

        if (path !== '/') {
          var extension = ['.html', '.htm']

          for (var i = 0; i < extension.length; i++) {
            if (path.indexOf(extension[i]) > -1) {
              path = path.split(extension[i])
              path = path.splice(0, 1)
              path = path.toString()

              break
            }
          }

          path = path.split('/')

          if (path[0].length === 0) {
            path.shift()
          }

          // Capitalize first letter of each page
          for (i = 0; i < path.length; i++) {
            path[i] = path[i].charAt(0).toUpperCase() + path[i].slice(1)
          }

          // Set pageName
          pagename = 'Give' + delim + path.join(delim)
        } else {
          // Set pageName
          pagename = 'Give' + delim + 'Home'
        }

        this.setPageNameObj(pagename)

        return path
      } catch (e) {
        // Error caught in analyticsFactory.getPath
      }
    },
    getSetProductCategory: function (path) {
      try {
        var allElements = $window.document.getElementsByTagName('*')

        for (var i = 0, n = allElements.length; i < n; i++) {
          var desigType = allElements[i].getAttribute('designationtype')

          if (desigType !== null) {
            const productConfig = $window.document.getElementsByTagName('product-config')
            $window.digitalData.product = [{
              productInfo: {
                productID: productConfig.length ? productConfig[0].getAttribute('product-code') : null
              },
              category: {
                primaryCategory: 'donation ' + desigType.toLowerCase(),
                siebelProductType: 'designation',
                organizationId: path[0]
              }
            }]

            return path[0]
          }
        }

        return false
      } catch (e) {
        // Error caught in analyticsFactory.getSetProductCategory
      }
    },
    giveGiftModal: function (productData) {
      try {
        var product = [{
          productInfo: {
            productID: productData.designationNumber
          },
          attributes: {
            siebel: {
              producttype: 'designation'
            }
          }
        }]

        $window.digitalData.product = product
        $window.dataLayer.push({
          event: 'give-gift-modal',
          ecommerce: {
            currencyCode: 'USD',
            detail: {
              products: [{
                name: productData.displayName.toLowerCase(),
                id: productData.designationNumber,
                price: undefined,
                brand: 'cru',
                category: productData.designationType.toLowerCase(),
                variant: undefined,
                quantity: '1'
              }]
            }
          }
        })
        this.setEvent('give gift modal')
        this.pageLoaded()
      } catch (e) {
        // Error caught in analyticsFactory.giveGiftModal
      }
    },
    pageLoaded: function (skipImageRequests) {
      try {
        const path = this.getPath()
        this.getSetProductCategory(path)
        this.setSiteSections(path)
        this.setLoggedInStatus()

        if (typeof $window.digitalData.page.attributes !== 'undefined') {
          if ($window.digitalData.page.attributes.angularLoaded === 'true') {
            $window.digitalData.page.attributes.angularLoaded = 'false'
          } else {
            $window.digitalData.page.attributes.angularLoaded = 'true'
          }
        } else {
          $window.digitalData.page.attributes = {
            angularLoaded: 'true'
          }
        }

        if (!skipImageRequests) {
          // Allow time for data layer changes to be consumed & fire image request
          $timeout(function () {
            try {
              $window.s.t()
              $window.s.clearVars()
            } catch (e) {
              // Error caught in analyticsFactory.pageLoaded while trying to fire analytics image request or clearVars
            }
          }, 1000)
        }
      } catch (e) {
        // Error caught in analyticsFactory.pageLoaded
      }
    },
    productViewDetailsEvent: function (product) {
      try {
        if (typeof $window.dataLayer !== 'undefined') {
          $window.dataLayer.push({
            event: 'product-detail-click',
            ecommerce: {
              currencyCode: 'USD',
              click: {
                actionField: {
                  list: 'search results'
                },
                products: [
                  {
                    name: product.name,
                    id: product.designationNumber,
                    price: undefined,
                    brand: 'cru',
                    category: product.type,
                    variant: undefined,
                    position: undefined
                  }
                ]
              }
            }
          })
        }
      } catch (e) {
        // Error caught in analyticsFactory.productViewDetailsEvent
      }
    },
    purchase: function (donorDetails, cartData) {
      try {
        // Build cart data layer
        this.setDonorDetails(donorDetails)
        this.buildProductVar(cartData)
      } catch (e) {
        // Error caught in analyticsFactory.purchase
      }
    },
    setPurchaseNumber: function (purchaseNumber) {
      try {
        $window.digitalData.purchaseNumber = purchaseNumber
      } catch (e) {
        // Error caught in analyticsFactory.setPurchaseNumber
      }
    },
    transactionEvent: function (purchaseData, cartData) {
      try {
        const cartObject = cartData.items.map((cartItem) => {
          return {
            name: cartItem.displayName.toLowerCase(),
            id: cartItem.code,
            price: cartItem.amount.toString(),
            branch: 'cru',
            category: cartItem.designationType.toLowerCase(),
            variant: cartItem.frequency.toLowerCase(),
            quantity: '1'
          }
        })

        if (typeof $window.dataLayer !== 'undefined') {
          $window.dataLayer.push({
            event: 'transaction',
            paymentType: purchaseData.paymentMeans['account-type'].toLowerCase(),
            ecommerce: {
              currencyCode: 'USD',
              purchase: {
                actionField: {
                  id: purchaseData.rawData['purchase-number'],
                  affiliation: undefined,
                  revenue: purchaseData.rawData['monetary-total'][0].amount.toString(),
                  shipping: undefined,
                  tax: undefined,
                  coupon: undefined
                },
                products: [
                  ...cartObject
                ]
              }
            }
          })
        }
      } catch (e) {
        // Error in analyticsFactory.transactionEvent
      }
    },
    search: function (params, results) {
      try {
        if (typeof params !== 'undefined') {
          if (typeof $window.digitalData.page !== 'undefined') {
            if (typeof $window.digitalData.page.pageInfo !== 'undefined') {
              $window.digitalData.page.pageInfo.onsiteSearchTerm = params.keyword
              $window.digitalData.page.pageInfo.onsiteSearchFilter = params.type
            } else {
              $window.digitalData.page.pageInfo = {
                onsiteSearchTerm: params.keyword,
                onsiteSearchFilter: params.type
              }
            }
          } else {
            $window.digitalData.page = {
              pageInfo: {
                onsiteSearchTerm: params.keyword,
                onsiteSearchFilter: params.type
              }
            }
          }
        }

        if (typeof results !== 'undefined' && results.length > 0) {
          if (typeof $window.digitalData.page !== 'undefined') {
            if (typeof $window.digitalData.page.pageInfo !== 'undefined') {
              $window.digitalData.page.pageInfo.onsiteSearchResults = results.length
            } else {
              $window.digitalData.page.pageInfo = {
                onsiteSearchResults: results.length
              }
            }
          } else {
            $window.digitalData.page = {
              pageInfo: {
                onsiteSearchResults: results.length
              }
            }
          }
        } else {
          $window.digitalData.page.pageInfo.onsiteSearchResults = 0
        }
      } catch (e) {
        // Error caught in analyticsFactory.search
      }
    },
    setLoggedInStatus: function () {
      try {
        const profileInfo = {}
        if (typeof sessionService !== 'undefined') {
          let ssoGuid
          if (typeof sessionService.session['sso_guid'] !== 'undefined') {
            ssoGuid = sessionService.session['sso_guid']
          } else if (typeof sessionService.session['sub'] !== 'undefined') {
            ssoGuid = sessionService.session['sub'].split('|').pop()
          }
          if (typeof ssoGuid !== 'undefined' && ssoGuid !== 'cas') {
            profileInfo['ssoGuid'] = ssoGuid
          }

          if (typeof sessionService.session['gr_master_person_id'] !== 'undefined') {
            profileInfo['grMasterPersonId'] = sessionService.session['gr_master_person_id']
          }
        }

        if (isEmpty(profileInfo)) {
          return
        }

        // Use lodash merge to deep merge with existing data or new empty hash
        $window.digitalData = merge($window.digitalData || {}, {
          user: [{ profile: [{ profileInfo: profileInfo }] }]
        })
      } catch (e) {
        // Error caught in analyticsFactory.setLoggedInStatus
      }
    },
    setDonorDetails: function (donorDetails) {
      try {
        const profileInfo = {}
        if (typeof sessionService !== 'undefined') {
          if (typeof sessionService.session['sso_guid'] !== 'undefined') {
            profileInfo['ssoGuid'] = sessionService.session['sso_guid']
          } else if (typeof sessionService.session['sub'] !== 'undefined') {
            profileInfo['ssoGuid'] = sessionService.session['sub'].split('|').pop()
          }

          if (typeof sessionService.session['gr_master_person_id'] !== 'undefined') {
            profileInfo['grMasterPersonId'] = sessionService.session['gr_master_person_id']
          }

          if (donorDetails) {
            profileInfo['donorType'] = donorDetails['donor-type'].toLowerCase()
            profileInfo['donorAcct'] = donorDetails['donor-number'].toLowerCase()
          }
        }

        // Use lodash merge to deep merge with existing data or new empty hash
        $window.digitalData = merge($window.digitalData || {}, {
          user: [{ profile: [{ profileInfo: profileInfo }] }]
        })

        // Store data for use on following page load
        localStorage.setItem('aaDonorType', $window.digitalData.user[0].profile[0].profileInfo.donorType)
        localStorage.setItem('aaDonorAcct', $window.digitalData.user[0].profile[0].profileInfo.donorAcct)
      } catch (e) {
        // Error caught in analyticsFactory.setDonorDetails
      }
    },
    setEvent: function (eventName) {
      try {
        var evt = {
          eventInfo: {
            eventName: eventName
          }
        }

        $window.digitalData.event = []
        $window.digitalData.event.push(evt)
      } catch (e) {
        // Error caught in analyticsFactory.setEvent
      }
    },
    setPageNameObj: function (pageName) {
      try {
        if (typeof $window.digitalData.page !== 'undefined') {
          if (typeof $window.digitalData.page.pageInfo !== 'undefined') {
            $window.digitalData.page.pageInfo.pageName = pageName
          } else {
            $window.digitalData.page.pageInfo = {
              pageName: pageName
            }
          }
        } else {
          $window.digitalData.page = {
            pageInfo: {
              pageName: pageName
            }
          }
        }
      } catch (e) {
        // Error caught in analyticsFactory.setPageNameObj
      }
    },
    setSiteSections: function (path) {
      try {
        var primaryCat = 'give'

        if (!path) {
          path = this.getPath()
        }

        if (typeof $window.digitalData !== 'undefined') {
          if (typeof $window.digitalData.page !== 'undefined') {
            $window.digitalData.page.category = {
              primaryCategory: primaryCat
            }
          } else {
            $window.digitalData.page = {
              category: {
                primaryCategory: primaryCat
              }
            }
          }
        } else {
          $window.digitalData = {
            page: {
              category: {
                primaryCategory: primaryCat
              }
            }
          }
        }

        if (path.length >= 1) {
          // Check if product page
          if (/^\d+$/.test(path[0])) {
            this.getSetProductCategory(path)
            $window.digitalData.page.category.subCategory1 = 'designation detail'
          } else {
            $window.digitalData.page.category.subCategory1 = path[0] === '/' ? '' : path[0]
          }

          if (path.length >= 2) {
            $window.digitalData.page.category.subCategory2 = path[1]

            if (path.length >= 3) {
              $window.digitalData.page.category.subCategory3 = path[2]
            }
          }
        }
      } catch (e) {
        // Error caught in analyticsFactory.setSiteSections
      }
    },
    track: function (event) {
      try {
        $window._satellite.track(event)
      } catch (e) {
        // Error caught in analyticsFactory.track
      }
    },
    trackGTM: function (eventName) {
      try {
        $window.dataLayer.push({
          event: eventName
        })
      } catch (e) {
        // Error caught in analyticsFactory.trackGTM
      }
    }
  }
}

export default angular
  .module('analytics')
  .factory('analyticsFactory', analyticsFactory)

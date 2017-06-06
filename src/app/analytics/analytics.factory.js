import './analytics.module';

import get from 'lodash/get';
import find from 'lodash/find';
import sha3 from 'crypto-js/sha3';

/* @ngInject */
function analyticsFactory($window, $timeout, sessionService) {
  return {
    buildProductVar: function(cartData) {
      try {
        var item, donationType;

        // Instantiate cart data layer
        const hash = sha3(cartData.id, { outputLength: 20*4 });
        $window.digitalData.cart = {
          id: cartData.id,
          hash: cartData.id ? hash.toString() : null,
          item: []
        };

        // Build cart data layer
        $window.digitalData.cart.price = {
          cartTotal: cartData && cartData.cartTotal
        };

        if (cartData && cartData.items) {

          for (var i = 0; i < cartData.items.length; i++) {

            // Set donation type
            if (cartData.items[i].frequency.toLowerCase() == 'single') {
              donationType = 'one-time donation';
            } else {
              donationType = 'recurring donation';
            }

            item = {
              productInfo: {
                productID: cartData.items[i].designationNumber
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
            };

            $window.digitalData.cart.item.push(item);

          }
        }
      }catch(e){
        // Error caught in analyticsFactory.buildProductVar
      }
    },
    cartAdd: function(itemConfig, productData) {
      try {
        var siteSubSection,
          cart = {
            item: [{
              productInfo: {
                productID: productData.designationNumber
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
          };

        // Set site sub-section
        if (typeof $window.digitalData.page !== 'undefined') {
          if (typeof $window.digitalData.page.category !== 'undefined') {
            $window.digitalData.page.category.subCategory1 = siteSubSection;
          } else {
            $window.digitalData.page.category = {
              subCategory1: siteSubSection
            };
          }
        } else {
          $window.digitalData.page = {
            category: {
              subcategory1: siteSubSection
            }
          };
        }

        // Set donation type
        if (productData.frequency == 'NA') {
          cart.item[0].attributes.donationType = 'one-time donation';
        } else {
          cart.item[0].attributes.donationType = 'recurring donation';
        }

        // Set donation frequency
        const frequencyObj = find(productData.frequencies, {name: productData.frequency});
        cart.item[0].attributes.donationFrequency = frequencyObj && frequencyObj.display.toLowerCase();

        // Set data layer
        $window.digitalData.cart = cart;

        // Call DTM direct call rule
        if (typeof $window._satellite !== 'undefined') {
          $window._satellite.track('aa-add-to-cart');
        }
      }catch(e){
        // Error caught in analyticsFactory.cartAdd
      }
    },
    cartRemove: function(designationNumber) {
      try {
        if (typeof designationNumber !== 'undefined') {
          var products = $window.s.products;

          $window.digitalData.cart.item = [{
            productInfo: {
              productID: designationNumber
            }
          }];

          $window._satellite.track('aa-cart-remove');

          // Curate events variable for subsequent scView event
          if ($window.s.events.length > -1) {
            var eventsArr = $window.s.events.split(',');

            for (let i = 0; i < eventsArr.length; i++) {
              if (eventsArr[i] == 'scRemove') {
                eventsArr.splice(i, 1);
              }
            }

            $window.s.events = eventsArr.join(',');
            $window.s.events = $window.s.apl($window.s.events, 'scView', ',', 2);
          }

          // Curate products variable for subsequent scView event
          if (products.length > -1) {
            var productsArr = products.split(',');

            for (let i = 0; i < productsArr.length; i++) {
              if (productsArr[i].slice(1) == designationNumber) {
                productsArr.splice(i, 1);
              }
            }

            $window.s.products = productsArr.join(',');
          }
        }
      }catch(e){
        // Error caught in analyticsFactory.cartRemove
      }
    },
    cartView: function(cartData, callType) {
      try {
        // Build products variable
        this.buildProductVar(cartData);

        // Call DTM direct call rule
        if (typeof callType !== 'undefined' && callType == 'customLink') {
          if (typeof $window._satellite !== 'undefined') {
            $window.s.clearVars();
            $window._satellite.track('aa-view-minicart');
          }
        }
      }catch(e){
        // Error caught in analyticsFactory.cartView
      }
    },
    editRecurringDonation: function(giftData) {
      try {
        var frequency = '';

        if (giftData && giftData.length) {
          if (get(giftData, '[0].gift["updated-rate"].recurrence.interval')) {
            frequency = giftData[0].gift['updated-rate'].recurrence.interval.toLowerCase();
          } else {
            const interval = get(giftData, '[0].parentDonation.rate.recurrence.interval');
            frequency = interval && interval.toLowerCase();
          }

          if (typeof $window.digitalData !== 'undefined') {
            if (typeof $window.digitalData.recurringGift !== 'undefined') {
              $window.digitalData.recurringGift.originalFrequency = frequency;
            } else {
              $window.digitalData.recurringGift = {
                originalFrequency: frequency
              };
            }
          } else {
            $window.digitalData = {
              recurringGift: {
                originalFrequency: frequency
              }
            };
          }
        }

        this.pageLoaded();
      }catch(e){
        // Error caught in analyticsFactory.editRecurringDonation
      }
    },
    getPath: function() {
      try {
        var pagename = '',
          delim = ' : ',
          path = $window.location.pathname;

        if (path !== '/') {
          var extension = ['.html', '.htm'];

          for (var i = 0; i < extension.length; i++) {
            if (path.indexOf(extension[i]) > -1) {
              path = path.split(extension[i]);
              path = path.splice(0, 1);
              path = path.toString();

              break;
            }
          }

          path = path.split('/');

          if (path[0].length == 0) {
            path.shift();
          }

          // Capitalize first letter of each page
          for(i = 0 ; i < path.length ; i++){
            path[i] = path[i].charAt(0).toUpperCase() + path[i].slice(1);
          }

          // Set pageName
          pagename = 'Give' + delim + path.join(delim);
        } else {
          // Set pageName
          pagename = 'Give' + delim + 'Home';
        }

        this.setPageNameObj(pagename);

        return path;
      }catch(e){
        // Error caught in analyticsFactory.getPath
      }
    },
    getSetProductCategory: function(path) {
      try {
        var allElements = $window.document.getElementsByTagName('*');

        for (var i = 0, n = allElements.length; i < n; i++) {
          var desigType = allElements[i].getAttribute('designationtype');

          if (desigType !== null) {
            $window.digitalData.product = [{
              category: {
                primaryCategory: 'donation ' + desigType.toLowerCase(),
                siebelProductType: 'designation',
                organizationId: path[0]
              }
            }];

            return path[0];
          }
        }

        return false;
      }catch(e){
        // Error caught in analyticsFactory.getSetProductCategory
      }
    },
    giveGiftModal: function(productCode) {
      try {
        var product = [{
          productInfo: {
            productID: productCode
          },
          attributes: {
            siebel: {
              producttype: 'designation'
            }
          }
        }];

        $window.digitalData.product = product;
        this.setEvent('give gift modal');
        this.pageLoaded();
      }catch(e){
        // Error caught in analyticsFactory.giveGiftModal
      }
    },
    pageLoaded: function() {
      try {
        let path = this.getPath();
        this.getSetProductCategory(path);
        this.setSiteSections(path);
        this.setLoggedInStatus();

        if (typeof $window.digitalData.page.attributes !== 'undefined') {
          if ($window.digitalData.page.attributes.angularLoaded == 'true') {
            $window.digitalData.page.attributes.angularLoaded = 'false';
          } else {
            $window.digitalData.page.attributes.angularLoaded = 'true';
          }
        } else {
          $window.digitalData.page.attributes = {
            angularLoaded: 'true'
          };
        }

        // Allow time for data layer changes to be consumed & fire image request
        $timeout(function () {
          try {
            $window.s.t();
            $window.s.clearVars();
          }catch(e){
            // Error caught in analyticsFactory.pageLoaded while trying to fire analytics image request or clearVars
          }
        }, 1000);
      }catch(e){
        // Error caught in analyticsFactory.pageLoaded
      }
    },
    purchase: function(donorDetails, cartData) {
      try {
        // Build cart data layer
        this.setDonorDetails(donorDetails);
        this.buildProductVar(cartData);
      }catch(e){
        // Error caught in analyticsFactory.purchase
      }
    },
    setPurchaseNumber: function(purchaseNumber) {
      try {
        $window.digitalData.purchaseNumber = purchaseNumber;
      }catch(e){
        // Error caught in analyticsFactory.setPurchaseNumber
      }
    },
    search: function(params, results) {
      try {
        if (typeof params !== 'undefined') {
          if (typeof $window.digitalData.page !== 'undefined') {
            if (typeof $window.digitalData.page.pageInfo !== 'undefined') {
              $window.digitalData.page.pageInfo.onsiteSearchTerm = params.keyword;
              $window.digitalData.page.pageInfo.onsiteSearchFilter = params.type;
            } else {
              $window.digitalData.page.pageInfo = {
                onsiteSearchTerm: params.keyword,
                onsiteSearchFilter: params.type
              };
            }
          } else {
            $window.digitalData.page = {
              pageInfo: {
                onsiteSearchTerm: params.keyword,
                onsiteSearchFilter: params.type
              }
            };
          }
        }

        if (typeof results !== 'undefined' && results.length > 0) {
          if (typeof $window.digitalData.page !== 'undefined') {
            if (typeof $window.digitalData.page.pageInfo !== 'undefined') {
              $window.digitalData.page.pageInfo.onsiteSearchResults = results.length;
            } else {
              $window.digitalData.page.pageInfo = {
                onsiteSearchResults: results.length
              };
            }
          } else {
            $window.digitalData.page = {
              pageInfo: {
                onsiteSearchResults: results.length
              }
            };
          }
        } else {
          $window.digitalData.page.pageInfo.onsiteSearchResults = 0;
        }
      }catch(e){
        // Error caught in analyticsFactory.search
      }
    },
    setLoggedInStatus: function(){
      try {
        let ssoGuid = '';
        if (typeof sessionService !== 'undefined') {
          if (typeof sessionService.session['sub'] !== 'undefined') {
            ssoGuid = sessionService.session['sub'].split('|').pop();
          }
        }

        if (!ssoGuid) {
          return;
        }

        if (!$window.digitalData.user) {
          $window.digitalData.user = [{
            profile: [{
              profileInfo: {
                ssoGuid: ssoGuid
              }
            }]
          }];
        }
      }catch(e){
        // Error caught in analyticsFactory.setLoggedInStatus
      }
    },
    setDonorDetails: function(donorDetails) {
      try {
        var ssoGuid = '',
          donorType = '',
          donorAcct = '';

        if (donorDetails) {
          donorType = donorDetails['donor-type'].toLowerCase();
          donorAcct = donorDetails['donor-number'].toLowerCase();
        }

        if (typeof sessionService !== 'undefined') {
          if (typeof sessionService.session['sub'] !== 'undefined') {
            ssoGuid = sessionService.session['sub'].split('|').pop();
          }
        }

        if (typeof $window.digitalData.user !== 'undefined') {
          if (typeof $window.digitalData.user[0].profile !== 'undefined') {
            if (typeof $window.digitalData.user[0].profile[0].profileInfo !== 'undefined') {
              $window.digitalData.user[0].profile[0].profileInfo.ssoGuid = ssoGuid;
              $window.digitalData.user[0].profile[0].profileInfo.donorType = donorType;
              $window.digitalData.user[0].profile[0].profileInfo.donorAcct = donorAcct;
            } else {
              $window.digitalData.user[0].profile[0].profileInfo = {
                ssoGuid: ssoGuid,
                donorType: donorType,
                donorAcct: donorAcct
              };
            }
          } else {
            $window.digitalData.user[0].profile = [{
              profileInfo: {
                ssoGuid: ssoGuid,
                donorType: donorType,
                donorAcct: donorAcct
              }
            }];
          }
        } else {
          $window.digitalData.user = [{
            profile: [{
              profileInfo: {
                ssoGuid: ssoGuid,
                donorType: donorType,
                donorAcct: donorAcct
              }
            }]
          }];
        }

        // Store data for use on following page load
        localStorage.setItem('aaDonorType', $window.digitalData.user[0].profile[0].profileInfo.donorType);
        localStorage.setItem('aaDonorAcct', $window.digitalData.user[0].profile[0].profileInfo.donorAcct);
      }catch(e){
        // Error caught in analyticsFactory.setDonorDetails
      }
    },
    setEvent: function(eventName) {
      try {
        var evt = {
          eventInfo: {
            eventName: eventName
          }
        };

        $window.digitalData.event = [];
        $window.digitalData.event.push(evt);
      }catch(e){
        // Error caught in analyticsFactory.setEvent
      }
    },
    setPageNameObj: function(pageName) {
      try {
        if (typeof $window.digitalData.page !== 'undefined') {
          if (typeof $window.digitalData.page.pageInfo !== 'undefined') {
            $window.digitalData.page.pageInfo.pageName = pageName;
          } else {
            $window.digitalData.page.pageInfo = {
              pageName: pageName
            };
          }
        } else {
          $window.digitalData.page = {
            pageInfo: {
              pageName: pageName
            }
          };
        }
      }catch(e){
        // Error caught in analyticsFactory.setPageNameObj
      }
    },
    setSiteSections: function(path) {
      try{
        var primaryCat = 'give';

        if (!path) {
          path = this.getPath();
        }

        if (typeof $window.digitalData !== 'undefined') {
          if (typeof $window.digitalData.page !== 'undefined') {
            $window.digitalData.page.category = {
              primaryCategory: primaryCat
            };
          } else {
            $window.digitalData.page = {
              category: {
                primaryCategory: primaryCat
              }
            };
          }
        } else {
          $window.digitalData = {
            page: {
              category: {
                primaryCategory: primaryCat
              }
            }
          };
        }

        if (path.length >= 1) {

          // Check if product page
          if (/^\d+$/.test(path[0])) {
            this.getSetProductCategory(path);
            $window.digitalData.page.category.subCategory1 = 'designation detail';
          } else {
            $window.digitalData.page.category.subCategory1 = path[0] === '/' ? '' : path[0];
          }

          if (path.length >= 2) {
            $window.digitalData.page.category.subCategory2 = path[1];

            if (path.length >= 3) {
              $window.digitalData.page.category.subCategory3 = path[2];
            }
          }

        }
      }catch(e){
        // Error caught in analyticsFactory.setSiteSections
      }
    },
    track: function(event){
      try{
        $window._satellite.track(event);
      }catch(e){
        // Error caught in analyticsFactory.track
      }
    }
  };
}

export default angular
  .module('analytics')
  .factory('analyticsFactory', analyticsFactory);

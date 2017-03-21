import './analytics.module';

import get from 'lodash/get';
import find from 'lodash/find';

/* @ngInject */
function analyticsFactory($window, $timeout, $log, sessionService) {
  return {
    buildProductVar: function(cartData) {
      try {
        var item, donationType;

        // Instantiate cart data layer
        $window.digitalData.cart = {
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
        $log.warn('Error caught in analyticsFactory.buildProductVar', e);
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
        $log.warn('Error caught in analyticsFactory.cartAdd', e);
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
        $log.warn('Error caught in analyticsFactory.cartRemove', e);
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
        $log.warn('Error caught in analyticsFactory.cartView', e);
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
        $log.warn('Error caught in analyticsFactory.editRecurringDonation', e);
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
        $log.warn('Error caught in analyticsFactory.getPath', e);
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
        $log.warn('Error caught in analyticsFactory.getSetProductCategory', e);
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
        $log.warn('Error caught in analyticsFactory.giveGiftModal', e);
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
          $window.s.t();
          $window.s.clearVars();
        }, 1000);
      }catch(e){
        $log.warn('Error caught in analyticsFactory.pageLoaded', e);
      }
    },
    purchase: function(donorDetails, cartData) {
      try {
        // Build cart data layer
        this.setDonorDetails(donorDetails);
        this.buildProductVar(cartData);

        var aaProducts = $window.s && $window.s.setProducts('checkout');

        // Store data for use on following page load
        localStorage.setItem('aaProducts', aaProducts);
      }catch(e){
        $log.warn('Error caught in analyticsFactory.purchase', e);
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
        $log.warn('Error caught in analyticsFactory.search', e);
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
        $log.warn('Error caught in analyticsFactory.setLoggedInStatus', e);
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
        $log.warn('Error caught in analyticsFactory.setDonorDetails', e);
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
        $log.warn('Error caught in analyticsFactory.setEvent', e);
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
        $log.warn('Error caught in analyticsFactory.setPageNameObj', e);
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
        $log.warn('Error caught in analyticsFactory.setSiteSections', e);
      }
    },
    track: function(event){
      try{
        $window._satellite.track(event);
      }catch(e){
        $log.warn('Error caught in analyticsFactory.track', e);
      }
    }
  };
}

export default angular
  .module('analytics')
  .factory('analyticsFactory', analyticsFactory);

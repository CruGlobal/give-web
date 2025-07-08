import './analytics.module';
import angular from 'angular';
import get from 'lodash/get';
import find from 'lodash/find';
import sha3 from 'crypto-js/sha3';
import merge from 'lodash/merge';
import isEmpty from 'lodash/isEmpty';
import moment from 'moment';
/* global localStorage */

function suppressErrors(func) {
  return function wrapper(...args) {
    try {
      return func.apply(this, args);
    } catch (e) {
      console.error(e);
    }
  };
}

function testingTransactionName(item) {
  const designationNumber = item.designationNumber;
  const frequencyObj = find(item.frequencies, { name: item.frequency });
  const frequency = frequencyObj?.display || item.frequency;
  if (designationNumber && frequency) {
    return `isItemTestingTransaction_${designationNumber}_${frequency.toLowerCase()}`;
  } else {
    return undefined;
  }
}

// Generate a datalayer product object
const generateProduct = suppressErrors(function (item, additionalData = {}) {
  const sessionStorageTestName = testingTransactionName(item);
  const testingTransaction = Boolean(
    sessionStorageTestName &&
      window.sessionStorage.getItem(sessionStorageTestName) === 'true',
  ).toString();
  const price = additionalData?.price || item.amount;
  const category = additionalData?.category || item.designationType;
  const name = additionalData?.name || item.displayName || undefined;
  const recurringDate = additionalData.recurringDate
    ? additionalData.recurringDate.format('MMMM D, YYYY')
    : item.giftStartDate
      ? moment(item.giftStartDate).format('MMMM D, YYYY')
      : undefined;
  const frequencyObj = find(item.frequencies, { name: item.frequency });
  const variant =
    additionalData?.variant || frequencyObj?.display || item.frequency;

  return {
    item_id: item.designationNumber,
    item_name: name,
    item_brand: item.orgId,
    item_category: category ? category.toLowerCase() : undefined,
    item_variant: variant ? variant.toLowerCase() : undefined,
    currency: 'USD',
    price: price ? price.toString() : undefined,
    quantity: '1',
    recurring_date: recurringDate,
    testing_transaction: testingTransaction,
  };
});

const analyticsFactory = /* @ngInject */ function (
  $window,
  $timeout,
  envService,
  sessionService,
) {
  return {
    checkoutFieldError: suppressErrors((field, error) => {
      $window.dataLayer = $window.dataLayer || [];
      $window.dataLayer.push({
        event: 'checkout_error',
        error_type: field,
        error_details: error,
      });
    }),

    // Send checkoutFieldError events for any invalid fields in a form
    handleCheckoutFormErrors: function (form) {
      if (
        !envService.read('isCheckout') &&
        !envService.read('isBrandedCheckout')
      ) {
        // Ignore errors not during checkout, like a logged-in user updating their payment methods
        return;
      }

      Object.entries(form).forEach(([fieldName, field]) => {
        if (!fieldName.startsWith('$') && field.$invalid) {
          // The keys of $error are the validators that failed for this field
          Object.keys(field.$error).forEach((validator) => {
            this.checkoutFieldError(fieldName, validator);
          });
        }
      });
    },

    buildProductVar: suppressErrors(function (cartData) {
      if (!cartData) return;
      let donationType;

      const { id } = cartData;
      // Instantiate cart data layer
      const hash = id ? sha3(id, { outputLength: 80 }).toString() : null; // limit hash to 20 characters
      if ($window?.digitalData) {
        $window.digitalData.cart = {
          id: id,
          hash: hash,
          item: [],
        };
      } else {
        $window.digitalData = {
          cart: {
            id: id,
            hash: hash,
            item: [],
          },
        };
      }

      // Build cart data layer
      $window.digitalData.cart.price = {
        cartTotal: cartData?.cartTotal,
      };

      if (cartData.items?.length) {
        cartData.items.forEach((item) => {
          const frequency = item?.frequency
            ? item.frequency.toLowerCase()
            : undefined;
          // Set donation type
          if (frequency === 'single') {
            donationType = 'one-time donation';
          } else {
            donationType = 'recurring donation';
          }

          item = {
            productInfo: {
              productID: item.designationNumber,
              designationType: item.designationType,
              orgId: item.orgId ? item.orgId : 'cru',
            },
            price: {
              basePrice: item.amount,
            },
            attributes: {
              donationType: donationType,
              donationFrequency: frequency,
              siebel: {
                productType: 'designation',
                campaignCode: item.config.CAMPAIGN_CODE,
              },
            },
          };

          $window.digitalData.cart.item.push(item);
        });
      }
    }),
    saveTestingTransaction: suppressErrors(function (item, testingTransaction) {
      if (testingTransaction) {
        $window.sessionStorage.setItem(
          testingTransactionName(item),
          testingTransaction,
        );
      }
    }),
    cartAdd: suppressErrors(function (itemConfig, productData) {
      let siteSubSection;
      const cart = {
        item: [
          {
            productInfo: {
              productID: productData.designationNumber,
              designationType: productData.designationType,
            },
            price: {
              basePrice: itemConfig.AMOUNT,
            },
            attributes: {
              siebel: {
                productType: 'designation',
              },
            },
          },
        ],
      };

      // Set site sub-section
      if ($window?.digitalData?.page) {
        if ($window.digitalData.page?.category) {
          $window.digitalData.page.category.subCategory1 = siteSubSection;
        } else {
          $window.digitalData.page.category = {
            subCategory1: siteSubSection,
          };
        }
      } else {
        if ($window?.digitalData) {
          $window.digitalData.page = {
            category: {
              subcategory1: siteSubSection,
            },
          };
        } else {
          $window.digitalData = {
            page: {
              category: {
                subcategory1: siteSubSection,
              },
            },
          };
        }
      }

      let recurringDate = null;
      // Set donation type
      if (productData.frequency === 'NA') {
        cart.item[0].attributes.donationType = 'one-time donation';
      } else {
        cart.item[0].attributes.donationType = 'recurring donation';
        recurringDate = moment(
          `${moment().year()}-${itemConfig.RECURRING_START_MONTH}-${itemConfig.RECURRING_DAY_OF_MONTH}`,
          'YYYY-MM-DD',
        );
      }

      // Set donation frequency
      const frequencyObj = find(productData.frequencies, {
        name: productData.frequency,
      });
      cart.item[0].attributes.donationFrequency =
        frequencyObj && frequencyObj.display.toLowerCase();

      // Set data layer
      $window.digitalData.cart = cart;
      // Send GTM Advance Ecommerce event
      $window.dataLayer = $window.dataLayer || [];
      $window.dataLayer.push({
        event: 'add_to_cart',
        ecommerce: {
          currencyCode: 'USD',
          value: itemConfig.AMOUNT.toFixed(2),
          items: [
            generateProduct(productData, {
              price: itemConfig.AMOUNT,
              recurringDate,
            }),
          ],
        },
      });
    }),
    cartRemove: suppressErrors(function (item) {
      if (!item) return;
      const frequency = item.frequency
        ? item.frequency.toLowerCase()
        : undefined;
      $window.digitalData.cart.item = [
        {
          productInfo: {
            productID: item.designationNumber,
            designationType: item.designationType,
          },
          price: {
            basePrice: item.amount,
          },
          attributes: {
            donationType:
              frequency === 'single'
                ? 'one-time donation'
                : 'recurring donation',
            donationFrequency: frequency,
            siebel: {
              productType: 'designation',
              campaignCode: item.config.CAMPAIGN_CODE,
            },
          },
        },
      ];
      // Send GTM Advance Ecommerce event
      $window.dataLayer = $window.dataLayer || [];
      $window.dataLayer.push({
        event: 'remove_from_cart',
        ecommerce: {
          currencyCode: 'USD',
          value: item.amount.toFixed(2),
          items: [generateProduct(item)],
        },
      });
    }),
    cartView: suppressErrors(function (isMiniCart = false) {
      // Send GTM Advance Ecommerce event
      $window.dataLayer = $window.dataLayer || [];
      $window.dataLayer.push({
        event: isMiniCart ? 'view-mini-cart' : 'view-cart',
      });
    }),
    checkoutStepEvent: suppressErrors(function (step, cart) {
      $window.dataLayer = $window.dataLayer || [];
      const cartObject = cart.items.map((cartItem) =>
        generateProduct(cartItem),
      );
      let stepNumber;
      switch (step) {
        case 'contact':
          stepNumber = 1;
          $window.dataLayer.push({
            event: 'begin_checkout',
            ecommerce: {
              items: cartObject,
            },
          });
          break;
        case 'payment':
          stepNumber = 2;
          $window.dataLayer.push({
            event: 'add_payment_info',
          });
          break;
        case 'review':
          stepNumber = 3;
          $window.dataLayer.push({
            event: 'review_order',
          });
          break;
      }
      $window.dataLayer.push({
        event: 'checkout-step',
        cartId: cart.id,
        ecommerce: {
          currencyCode: 'USD',
          checkout: {
            actionField: {
              step: stepNumber,
              option: '',
            },
            products: [...cartObject],
          },
        },
      });
    }),
    checkoutStepOptionEvent: suppressErrors(function (option, step) {
      let stepNumber;
      switch (step) {
        case 'contact':
          stepNumber = 1;
          break;
        case 'payment':
          stepNumber = 2;
          break;
        case 'review':
          stepNumber = 3;
          break;
      }
      $window.dataLayer = $window.dataLayer || [];
      $window.dataLayer.push({
        event: 'checkout-option',
        ecommerce: {
          checkout_option: {
            actionField: {
              step: stepNumber,
              option: option ? option.toLowerCase() : undefined,
            },
          },
        },
      });
    }),
    editRecurringDonation: suppressErrors(function (giftData) {
      let frequency = '';

      if (giftData?.length) {
        if (get(giftData, '[0].gift["updated-rate"].recurrence.interval')) {
          frequency =
            giftData[0].gift['updated-rate'].recurrence.interval.toLowerCase();
        } else {
          const interval = get(
            giftData,
            '[0].parentDonation.rate.recurrence.interval',
          );
          frequency = interval && interval.toLowerCase();
        }

        if ($window?.digitalData) {
          if ($window.digitalData?.recurringGift) {
            $window.digitalData.recurringGift.originalFrequency = frequency;
          } else {
            $window.digitalData.recurringGift = {
              originalFrequency: frequency,
            };
          }
        } else {
          $window.digitalData = {
            recurringGift: {
              originalFrequency: frequency,
            },
          };
        }
      }

      this.pageLoaded();
    }),
    getPath: suppressErrors(function () {
      let pagename = '';
      const delim = ' : ';
      let path = $window.location.pathname;

      if (path !== '/') {
        const extension = ['.html', '.htm'];

        for (let i = 0; i < extension.length; i++) {
          if (path.indexOf(extension[i]) > -1) {
            path = path.split(extension[i]);
            path = path.splice(0, 1);
            path = path.toString();

            break;
          }
        }

        path = path.split('/');

        if (path[0].length === 0) {
          path.shift();
        }

        // Capitalize first letter of each page
        for (let i = 0; i < path.length; i++) {
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
    }),
    getSetProductCategory: suppressErrors(function (path) {
      const allElements = $window.document.getElementsByTagName('*');

      for (let i = 0, n = allElements.length; i < n; i++) {
        const desigType = allElements[i].getAttribute('designationtype');

        if (desigType !== null) {
          const productConfig =
            $window.document.getElementsByTagName('product-config');
          $window.digitalData.product = [
            {
              productInfo: {
                productID: productConfig.length
                  ? productConfig[0].getAttribute('product-code')
                  : null,
              },
              category: {
                primaryCategory:
                  'donation ' + desigType ? desigType.toLowerCase() : '',
                siebelProductType: 'designation',
                organizationId: path[0],
              },
            },
          ];

          return path[0];
        }
      }

      return false;
    }),
    giveGiftModal: suppressErrors(function (productData) {
      const product = [
        {
          productInfo: {
            productID: productData.designationNumber,
          },
          attributes: {
            siebel: {
              producttype: 'designation',
            },
          },
        },
      ];
      const modifiedProductData = { ...productData };
      modifiedProductData.frequency = undefined;
      $window.digitalData.product = product;
      $window.dataLayer = $window.dataLayer || [];
      $window.dataLayer.push({
        event: 'view_item',
        ecommerce: {
          currencyCode: 'USD',
          // value is unavailable until the user selects a gift amount
          value: undefined,
          items: [generateProduct(modifiedProductData)],
        },
      });
      this.setEvent('give gift modal');
      this.pageLoaded();
    }),
    pageLoaded: suppressErrors(function (skipImageRequests) {
      const path = this.getPath();
      this.getSetProductCategory(path);
      this.setSiteSections(path);
      this.setLoggedInStatus();

      if (typeof $window.digitalData.page.attributes !== 'undefined') {
        if ($window.digitalData.page.attributes.angularLoaded === 'true') {
          $window.digitalData.page.attributes.angularLoaded = 'false';
        } else {
          $window.digitalData.page.attributes.angularLoaded = 'true';
        }
      } else {
        $window.digitalData.page.attributes = {
          angularLoaded: 'true',
        };
      }

      if (!skipImageRequests) {
        // Allow time for data layer changes to be consumed & fire image request
        $timeout(function () {
          try {
            $window.s.t();
            $window.s.clearVars();
          } catch (e) {
            // Error caught in analyticsFactory.pageLoaded while trying to fire analytics image request or clearVars
          }
        }, 1000);
      }
    }),
    pageReadyForOptimize: suppressErrors(function () {
      $window.dataLayer = $window.dataLayer || [];
      let found = false;
      angular.forEach($window.dataLayer, (value) => {
        if (value.event && value.event === 'angular.loaded') {
          found = true;
        }
      });
      if (!found) {
        $window.dataLayer.push({ event: 'angular.loaded' });
      }
    }),
    productViewDetailsEvent: suppressErrors(function (product) {
      $window.dataLayer = $window.dataLayer || [];
      $window.dataLayer.push({
        event: 'product-detail-click',
        ecommerce: {
          currencyCode: 'USD',
          click: {
            actionField: {
              list: 'search results',
            },
            products: [
              generateProduct(product, {
                category: product.type,
                name: product.name,
              }),
            ],
          },
        },
      });
    }),
    purchase: suppressErrors(
      function (donorDetails, cartData, coverFeeDecision) {
        // Build cart data layer
        this.setDonorDetails(donorDetails);
        this.buildProductVar(cartData);
        // Stringify the cartObject and store in localStorage for the transactionEvent
        localStorage.setItem('transactionCart', JSON.stringify(cartData));
        // Store value of coverFeeDecision in sessionStorage for the transactionEvent
        sessionStorage.setItem('coverFeeDecision', coverFeeDecision);
      },
    ),
    setPurchaseNumber: suppressErrors(function (purchaseNumber) {
      if ($window?.digitalData) {
        $window.digitalData.purchaseNumber = purchaseNumber;
      } else {
        $window.digitalData = {
          purchaseNumber,
        };
      }
    }),
    transactionEvent: suppressErrors(function (purchaseData) {
      // The value of whether or not user is covering credit card fees for the transaction
      const coverFeeDecision = JSON.parse(
        sessionStorage.getItem('coverFeeDecision'),
      );
      // Parse the cart object of the last purchase
      const transactionCart = JSON.parse(
        localStorage.getItem('transactionCart'),
      );
      // The purchaseId number from the last purchase
      const lastTransactionId = sessionStorage.getItem('transactionId');
      // The purchaseId number from the pruchase data being passed in
      const currentTransactionId =
        purchaseData && purchaseData.rawData['purchase-number'];
      let purchaseTotal = 0;
      let purchaseTotalWithFees = 0;
      // If the lastTransactionId and the current one do not match, we need to send an analytics event for the transaction
      if (purchaseData && lastTransactionId !== currentTransactionId) {
        const paymentType = purchaseData.paymentInstruments['account-type']
          ? 'bank account'
          : 'credit card';

        // Set the transactionId in localStorage to be the one that is passed in
        sessionStorage.setItem('transactionId', currentTransactionId);
        const cartObject = transactionCart.items.map((cartItem) => {
          const { amount, amountWithFees } = cartItem;
          purchaseTotal += amount;
          purchaseTotalWithFees += amountWithFees || 0;
          const frequency = cartItem?.frequency
            ? cartItem.frequency.toLowerCase()
            : undefined;
          return {
            ...generateProduct(cartItem),
            processingFee:
              amountWithFees && coverFeeDecision
                ? (amountWithFees - amount).toFixed(2)
                : undefined,
            ga_donator_type: localStorage.getItem('gaDonorType'),
            donation_type: frequency === 'single' ? 'one-time' : 'recurring',
            donation_frequency: frequency,
            payment_type: paymentType,
            purchase_number: purchaseData.rawData['purchase-number'],
            campaign_code:
              cartItem.config.CAMPAIGN_CODE !== ''
                ? cartItem.config.CAMPAIGN_CODE
                : undefined,
          };
        });
        // Send the transaction event if the dataLayer is defined
        $window.dataLayer = $window.dataLayer || [];
        $window.dataLayer.push({
          event: 'purchase',
          paymentType: paymentType,
          ecommerce: {
            currency: 'USD',
            payment_type: paymentType,
            donator_type: purchaseData.donorDetails['donor-type'],
            pays_processing:
              purchaseTotalWithFees && coverFeeDecision ? 'yes' : 'no',
            value:
              purchaseTotalWithFees && coverFeeDecision
                ? purchaseTotalWithFees.toFixed(2).toString()
                : purchaseTotal.toFixed(2).toString(),
            processing_fee:
              purchaseTotalWithFees && coverFeeDecision
                ? (purchaseTotalWithFees - purchaseTotal).toFixed(2)
                : undefined,
            transaction_id: purchaseData.rawData['purchase-number'],
            items: [...cartObject],
          },
        });
        // Send cover fees event if value is true
        if (coverFeeDecision) {
          $window.dataLayer.push({
            event: 'ga-cover-fees-checkbox',
          });
        }
      }
      // Remove the transactionCart from localStorage since it is no longer needed
      localStorage.removeItem('transactionCart');
      // Remove the coverFeeDecision from sessionStorage since it is no longer needed
      sessionStorage.removeItem('coverFeeDecision');
      // Remove testingTransaction from sessionStorage for each item if any since it is no longer needed
      transactionCart.items.forEach((item) => {
        $window.sessionStorage.removeItem(testingTransactionName(item));
      });
    }),
    search: suppressErrors(function (params, results) {
      if (params) {
        if ($window?.digitalData?.page) {
          if ($window.digitalData.page?.pageInfo) {
            $window.digitalData.page.pageInfo.onsiteSearchTerm = params.keyword;
            $window.digitalData.page.pageInfo.onsiteSearchFilter = params.type;
          } else {
            $window.digitalData.page.pageInfo = {
              onsiteSearchTerm: params.keyword,
              onsiteSearchFilter: params.type,
            };
          }
        } else {
          $window.digitalData.page = {
            pageInfo: {
              onsiteSearchTerm: params.keyword,
              onsiteSearchFilter: params.type,
            },
          };
        }
      }

      if (results?.length) {
        if ($window?.digitalData?.page) {
          if ($window?.digitalData?.page?.pageInfo) {
            $window.digitalData.page.pageInfo.onsiteSearchResults =
              results.length;
          } else {
            $window.digitalData.page.pageInfo = {
              onsiteSearchResults: results.length,
            };
          }
        } else {
          $window.digitalData.page = {
            pageInfo: {
              onsiteSearchResults: results.length,
            },
          };
        }
      } else {
        $window.digitalData.page.pageInfo.onsiteSearchResults = 0;
      }
    }),
    setLoggedInStatus: suppressErrors(function () {
      const profileInfo = {};
      if (sessionService) {
        let ssoGuid;
        if (sessionService?.session?.sso_guid) {
          ssoGuid = sessionService.session.sso_guid;
        } else if (sessionService?.session?.sub) {
          ssoGuid = sessionService.session.sub.split('|').pop();
        }
        if (ssoGuid && ssoGuid !== 'cas') {
          profileInfo.ssoGuid = ssoGuid;
        }

        if (sessionService?.session?.gr_master_person_id) {
          profileInfo.grMasterPersonId =
            sessionService.session.gr_master_person_id;
        }
      }

      if (isEmpty(profileInfo)) {
        return;
      }

      // Use lodash merge to deep merge with existing data or new empty hash
      $window.digitalData = merge($window.digitalData || {}, {
        user: [{ profile: [{ profileInfo: profileInfo }] }],
      });
    }),
    setDonorDetails: suppressErrors(function (donorDetails) {
      const profileInfo = {};
      if (sessionService) {
        if (sessionService?.session?.sso_guid) {
          profileInfo.ssoGuid = sessionService.session.sso_guid;
        } else if (sessionService?.session?.sub) {
          profileInfo.ssoGuid = sessionService.session.sub.split('|').pop();
        }

        if (sessionService?.session?.gr_master_person_id) {
          profileInfo.grMasterPersonId =
            sessionService.session.gr_master_person_id;
        }

        if (donorDetails) {
          profileInfo.donorType = donorDetails['donor-type']
            ? donorDetails['donor-type'].toLowerCase()
            : undefined;
          profileInfo.donorAcct = donorDetails['donor-number']
            ? donorDetails['donor-number'].toLowerCase()
            : undefined;
        }
      }

      // Use lodash merge to deep merge with existing data or new empty hash
      $window.digitalData = merge($window.digitalData || {}, {
        user: [{ profile: [{ profileInfo: profileInfo }] }],
      });

      // Store data for use on following page load
      localStorage.setItem(
        'gaDonorType',
        $window.digitalData.user[0].profile[0].profileInfo.donorType,
      );
      localStorage.setItem(
        'gaDonorAcct',
        $window.digitalData.user[0].profile[0].profileInfo.donorAcct,
      );
    }),
    setEvent: suppressErrors(function (eventName) {
      const evt = {
        eventInfo: {
          eventName: eventName,
        },
      };

      if ($window?.digitalData) {
        $window.digitalData.event = [];
      } else {
        $window.digitalData = {
          event: [],
        };
      }
      $window.digitalData.event.push(evt);
    }),
    setPageNameObj: suppressErrors(function (pageName) {
      if ($window?.digitalData?.page) {
        if ($window.digitalData.page?.pageInfo) {
          $window.digitalData.page.pageInfo.pageName = pageName;
        } else {
          $window.digitalData.page.pageInfo = {
            pageName: pageName,
          };
        }
      } else {
        if ($window?.digitalData) {
          $window.digitalData.page = {
            pageInfo: {
              pageName: pageName,
            },
          };
        } else {
          $window.digitalData = {
            page: {
              pageInfo: {
                pageName: pageName,
              },
            },
          };
        }
      }
    }),
    setSiteSections: suppressErrors(function (path) {
      const primaryCat = 'give';

      if (!path) {
        path = this.getPath();
      }

      if ($window?.digitalData) {
        if ($window.digitalData?.page) {
          $window.digitalData.page.category = {
            primaryCategory: primaryCat,
          };
        } else {
          $window.digitalData.page = {
            category: {
              primaryCategory: primaryCat,
            },
          };
        }
      } else {
        $window.digitalData = {
          page: {
            category: {
              primaryCategory: primaryCat,
            },
          },
        };
      }

      if (path?.length) {
        // Check if product page
        if (/^\d+$/.test(path[0])) {
          this.getSetProductCategory(path);
          $window.digitalData.page.category.subCategory1 = 'designation detail';
        } else {
          $window.digitalData.page.category.subCategory1 =
            path[0] === '/' ? '' : path[0];
        }

        if (path.length >= 2) {
          $window.digitalData.page.category.subCategory2 = path[1];

          if (path.length >= 3) {
            $window.digitalData.page.category.subCategory3 = path[2];
          }
        }
      }
    }),
    track: suppressErrors(function (eventName) {
      $window.dataLayer = $window.dataLayer || [];
      $window.dataLayer.push({
        event: eventName,
      });
    }),
  };
};

export default angular
  .module('analytics')
  .factory('analyticsFactory', analyticsFactory);

import angular from 'angular';
import 'angular-cookies';
import moment from 'moment';
import map from 'lodash/map';
import omit from 'lodash/omit';
import find from 'lodash/find';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/from';

import cortexApiService from '../cortexApi.service';
import commonService from './common.service';
import designationsService from './designations.service';
import hateoasHelperService from 'common/services/hateoasHelper.service';
import sessionService, { Roles } from 'common/services/session/session.service';
import { startMonth } from '../giftHelpers/giftDates.service';

const cartTotalCookie = 'giveCartItemCount';
const cartTotalCookieDomain = 'cru.org';

const serviceName = 'cartService';

class Cart {
  /* @ngInject */
  constructor(
    cortexApiService,
    commonService,
    designationsService,
    sessionService,
    hateoasHelperService,
    $cookies,
    $location,
    $window,
  ) {
    this.cortexApiService = cortexApiService;
    this.commonService = commonService;
    this.designationsService = designationsService;
    this.sessionService = sessionService;
    this.hateoasHelperService = hateoasHelperService;
    this.$cookies = $cookies;
    this.$location = $location;
    this.$window = $window;
  }

  setCartCountCookie(quantity) {
    if (
      ![
        'give.cru.org',
        'give-stage2.cru.org',
        'give-stage2-next.cru.org',
        'give-stage-cloud.cru.org',
        'give-prod-cloud.cru.org',
      ].includes(this.$location.host())
    ) {
      return;
    }

    if (quantity) {
      this.$cookies.put(cartTotalCookie, quantity, {
        path: '/',
        domain: cartTotalCookieDomain,
        expires: moment().add(58, 'days').toISOString(),
      });
    } else {
      this.$cookies.remove(cartTotalCookie, {
        path: '/',
        domain: cartTotalCookieDomain,
      });
    }
  }

  get() {
    // To fetch product-code, offer resource is used and added it in zoom parameter.
    return Observable.forkJoin(
      this.cortexApiService.get({
        path: ['carts', this.cortexApiService.scope, 'default'],
        zoom: {
          lineItems:
            'lineitems:element[],lineitems:element:availability,lineitems:element:item,lineitems:element:item:code,lineitems:element:item:offer:code,lineitems:element:item:definition,lineitems:element:rate,lineitems:element:total,lineitems:element:itemfields',
          rateTotals: 'ratetotals:element[]',
          total: 'total,total:cost',
        },
      }),
      this.commonService.getNextDrawDate(),
    ).map(([cartResponse, nextDrawDate]) => {
      if (!cartResponse || !cartResponse.lineItems) {
        this.setCartCountCookie(0);
        return {};
      }
      return this.handleCartResponse(cartResponse, nextDrawDate);
    });
  }

  handleCartResponse(cartResponse, nextDrawDate) {
    const items = map(cartResponse.lineItems, (item) => {
      const frequency = item.rate.recurrence.display;
      //  Changed the 'itemfields' property to 'configuration' with in the item object.
      const itemConfig = omit(item.configuration, ['self', 'links']);
      //  Based on EP 8.1 JSON Object item config properties are changed to uppercase
      const giftStartDate =
        frequency !== 'Single'
          ? startMonth(
              itemConfig.RECURRING_DAY_OF_MONTH,
              itemConfig.RECURRING_START_MONTH,
              nextDrawDate,
            )
          : null;
      const giftStartDateDaysFromNow = giftStartDate
        ? giftStartDate.diff(new Date(), 'days')
        : 0;

      let designationType;
      let orgId;
      angular.forEach(item.itemDefinition.details, (v, k) => {
        if (v.name === 'designation_type') {
          designationType = v['display-value'];
        }
        if (v.name === 'org_id') {
          orgId = v['display-value'];
        }
      });

      return {
        uri: item.self.uri,
        code: item.itemCode.code,
        orgId: orgId,
        displayName: item.itemDefinition['display-name'],
        designationType: designationType,
        price: item.rate.cost[0].display, // cost object was changed to array
        priceWithFees: item.rate.cost[0]['display-with-fees'],
        config: itemConfig,
        frequency: frequency,
        amount: item.rate.cost[0].amount, // cost object was changed to array
        amountWithFees: item.rate.cost[0]['amount-with-fees'],
        designationNumber: item.item._offer[0]._code[0].code, // product code is fetched from offer resource
        productUri: item.item.self.uri,
        giftStartDate: giftStartDate,
        giftStartDateDaysFromNow: giftStartDateDaysFromNow,
        giftStartDateWarning: giftStartDateDaysFromNow >= 275,
      };
    });

    let cartTotal;
    let cartTotalDisplay;
    const frequencyTotals = map(cartResponse.rateTotals, (rateTotal) => {
      if (rateTotal.recurrence.interval === 'NA') {
        cartTotal = rateTotal.cost.amount;
        cartTotalDisplay = rateTotal.cost.display;
      }
      return {
        frequency: rateTotal.recurrence.display,
        amount: rateTotal.cost.amount,
        amountWithFees: rateTotal.cost['amount-with-fees'],
        total: rateTotal.cost.display,
        totalWithFees: rateTotal.cost['display-with-fees'],
      };
    });
    // The API returns Single gift rate totals as the last item in the list, so we should move it to the first item
    // to preserve the ordering in the UI (Single gift totals first).
    if (cartTotal) {
      frequencyTotals.unshift(frequencyTotals.pop());
    }

    // set cart item count cookie
    this.setCartCountCookie(items.length);

    return {
      id: this.hateoasHelperService
        .getLink(cartResponse.total, 'cart')
        .split('/')
        .pop(),
      items: items.reverse(), // Show most recent cart items first
      frequencyTotals: frequencyTotals,
      cartTotal:
        cartTotal || (cartResponse.total && cartResponse.total.cost.amount),
      cartTotalDisplay:
        cartTotalDisplay ||
        (cartResponse.total && cartResponse.total.cost.display),
    };
  }

  getTotalQuantity() {
    return this.cortexApiService
      .get({ path: ['carts', this.cortexApiService.scope, 'default'] })
      .map((cart) => {
        return cart['total-quantity'];
      });
  }

  addItem(uri, data, disableSessionRestart) {
    data.quantity = 1;

    if (
      !disableSessionRestart &&
      this.sessionService.getRole() === Roles.public
    ) {
      return this.getTotalQuantity().mergeMap((total) => {
        if (total <= 0) {
          return this.sessionService
            .oktaIsUserAuthenticated()
            .mergeMap((isAuthenticated) => {
              if (!isAuthenticated) {
                return this._addItem(uri, data);
              }
              // SignOut() will redirect user to Okta to clear session,
              // but will be brought back to this page with an error message shown.
              return this.sessionService.signOut(false).mergeMap(() => {
                return this._addItem(uri, data);
              });
            });
        }
        return this._addItem(uri, data);
      });
    }
    return this._addItem(uri, data);
  }

  /**
   * @private
   */
  _addItem(uri, data) {
    const obj = {
      ...data,
    };
    const res = {};
    //  Converted payload keys lowercase to uppercase and converted format as per API request
    for (const [key, value] of Object.entries(obj)) {
      res[key.toUpperCase()] = value;
    }
    delete res.QUANTITY;
    const payLoad = {
      configuration: {
        ...res,
      },
      quantity: data.quantity,
    };

    return this.cortexApiService.post({
      path: uri,
      data: payLoad,
      followLocation: true,
    });
  }

  editItem(oldUri, uri, data) {
    return this.deleteItem(oldUri).switchMap(() =>
      this.addItem(uri, data, true),
    );
  }

  deleteItem(uri) {
    return this.cortexApiService.delete({
      path: uri,
    });
  }

  bulkAdd(configuredDesignations) {
    let rawCartObservable;
    const cart = Observable.defer(() => {
      rawCartObservable = rawCartObservable || this.get(); // Only request cart once but wait until subscription before sending request
      return rawCartObservable;
    });
    return this.designationsService
      .bulkLookup(map(configuredDesignations, 'designationNumber'))
      .mergeMap((response) => {
        if (!response.links || !response.links.length > 0) {
          return Observable.throw('No results found during lookup');
        }
        return map(response.links, (link, index) => {
          const configuredDesignation = configuredDesignations[index];
          configuredDesignation.uri = `carts/${link.uri.replace(/^\//, '')}/form`;
          return this.addItemAndReplaceExisting(
            cart,
            configuredDesignation.uri,
            configuredDesignation,
          );
        });
      })
      .mergeAll();
  }

  addItemAndReplaceExisting(cart, uri, configuredDesignation) {
    return Observable.defer(() =>
      this.addItem(uri, { amount: configuredDesignation.amount }),
    )
      .catch((response) => {
        if (response.status === 409) {
          return cart.switchMap((cart) => {
            const oldUri = find(cart.items, {
              code: configuredDesignation.designationNumber,
            }).uri.replace(/^\//, '');
            return this.editItem(oldUri, uri, {
              amount: configuredDesignation.amount,
            });
          });
        } else {
          return Observable.throw(response);
        }
      })
      .map(() => ({ configuredDesignation: configuredDesignation }))
      .catch((response) => {
        return Observable.of({
          error: response,
          configuredDesignation: configuredDesignation,
        });
      });
  }

  buildCartUrl() {
    const url = new URL(this.$window.location.href);
    const queryParameters = url.searchParams;
    const parametersToDelete = ['modal', 'd', 'a', 'q'];
    parametersToDelete.forEach((parameterToDelete) => {
      queryParameters.delete(parameterToDelete);
    });

    return queryParameters.toString()
      ? `cart.html?${queryParameters.toString()}`
      : 'cart.html';
  }
}

export default angular
  .module(serviceName, [
    cortexApiService.name,
    commonService.name,
    designationsService.name,
    sessionService.name,
    hateoasHelperService.name,
    'ngCookies',
  ])
  .service(serviceName, Cart);

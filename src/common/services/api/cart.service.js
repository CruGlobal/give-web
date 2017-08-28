import angular from 'angular';
import map from 'lodash/map';
import omit from 'lodash/omit';
import concat from 'lodash/concat';
import find from 'lodash/find';
import {Observable} from 'rxjs/Observable';
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
import sessionService, {Roles} from 'common/services/session/session.service';
import {startMonth} from '../giftHelpers/giftDates.service';

let serviceName = 'cartService';

class Cart {

  /*@ngInject*/
  constructor(cortexApiService, commonService, designationsService, sessionService, hateoasHelperService){
    this.cortexApiService = cortexApiService;
    this.commonService = commonService;
    this.designationsService = designationsService;
    this.sessionService = sessionService;
    this.hateoasHelperService = hateoasHelperService;
  }

  get() {
    return Observable.forkJoin(this.cortexApiService.get({
      path: ['carts', this.cortexApiService.scope, 'default'],
      zoom: {
        lineItems: 'lineitems:element[],lineitems:element:availability,lineitems:element:item:code,lineitems:element:item:definition,lineitems:element:rate,lineitems:element:total,lineitems:element:itemfields',
        rateTotals: 'ratetotals:element[]',
        total: 'total,total:cost'
      }
    }), this.commonService.getNextDrawDate())
      .map(([cartResponse, nextDrawDate]) => {
        if (!cartResponse || !cartResponse.lineItems) {
          return {};
        }

        let items = map(cartResponse.lineItems, item => {
          let frequency = item.rate.recurrence.display;
          let itemConfig = omit(item.itemfields, ['self', 'links']);

          return {
            uri: item.self.uri,
            code: item.itemCode.code,
            displayName: item.itemDefinition['display-name'],
            price: item.rate.cost.display,
            config: itemConfig,
            frequency: frequency,
            amount: item.rate.cost.amount,
            designationNumber: item.itemCode['product-code'],
            giftStartDate: frequency !== 'Single' ?
              startMonth(itemConfig['recurring-day-of-month'], itemConfig['recurring-start-month'], nextDrawDate) : null
          };
        });

        let frequencyTotals = concat({
            frequency: 'Single',
            amount: cartResponse.total && cartResponse.total.cost.amount,
            total: cartResponse.total && cartResponse.total.cost.display
          },
          map(cartResponse.rateTotals, rateTotal => {
            return {
              frequency: rateTotal.recurrence.display,
              amount: rateTotal.cost.amount,
              total: rateTotal.cost.display
            };
          })
        );

        return {
          id: this.hateoasHelperService.getLink(cartResponse.total, 'cart').split('/').pop(),
          items: items.reverse(), // Show most recent cart items first
          frequencyTotals: frequencyTotals,
          cartTotal: frequencyTotals[0].amount
        };
      });
  }

  getTotalQuantity() {
    return this.cortexApiService
      .get({path: ['carts', this.cortexApiService.scope, 'default']})
      .map((cart) => {
        return cart['total-quantity'];
      });
  }

  addItem(uri, data, disableSessionRestart) {
    data.quantity = 1;

    if(!disableSessionRestart && this.sessionService.getRole() == Roles.public) {
      return this.getTotalQuantity().mergeMap((total) => {
        if(total <= 0) {
          return this.sessionService.signOut().mergeMap(() => {
            return this._addItem(uri, data);
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
    return this.cortexApiService.post({
      path: ['itemfieldslineitem', uri],
      data: data,
      followLocation: true
    });
  }

  editItem(oldUri, uri, data){
    return this.deleteItem(oldUri)
      .switchMap(() => this.addItem(uri, data, true));
  }

  deleteItem(uri){
    return this.cortexApiService.delete({
      path: uri
    });
  }

  bulkAdd(configuredDesignations){
    let rawCartObservable;
    let cart = Observable.defer(() => {
      return rawCartObservable = rawCartObservable || this.get(); // Only request cart once but wait until subscription before sending request
    });
    return this.designationsService.bulkLookup(map(configuredDesignations, 'designationNumber'))
      .mergeMap(response => {
        if(!response.links || !response.links.length > 0){
          return Observable.throw('No results found during lookup');
        }
        return map(response.links, (link, index) => {
          let configuredDesignation = configuredDesignations[index];
          configuredDesignation.uri = link.uri.replace(/^\//, '');
          return this.addItemAndReplaceExisting(cart, configuredDesignation.uri, configuredDesignation);
        });
      })
      .mergeAll();
  }

  addItemAndReplaceExisting(cart, uri, configuredDesignation){
    return Observable.defer(() => this.addItem(uri, {amount: configuredDesignation.amount}))
      .catch(response => {
        if(response.status === 409){
          return cart
            .switchMap(cart => {
              const oldUri = find(cart.items, { code: configuredDesignation.designationNumber }).uri.replace(/^\//, '');
              return this.editItem(oldUri, uri, {amount: configuredDesignation.amount});
            });
        }else{
          return Observable.throw(response);
        }
      })
      .map(() => ({ configuredDesignation: configuredDesignation }))
      .catch(response => {
        return Observable.of({ error: response, configuredDesignation: configuredDesignation });
      });
  }
}

export default angular
  .module(serviceName, [
    cortexApiService.name,
    commonService.name,
    designationsService.name,
    sessionService.name,
    hateoasHelperService.name
  ])
  .service(serviceName, Cart);

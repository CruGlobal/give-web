import angular from 'angular';
import map from 'lodash/map';
import omit from 'lodash/omit';
import concat from 'lodash/concat';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import cortexApiService from '../cortexApi.service';
import commonService from './common.service';
import {startDate} from '../giftHelpers/giftDates.service';

let serviceName = 'cartService';

class Cart {

  /*@ngInject*/
  constructor(cortexApiService, commonService){
    this.cortexApiService = cortexApiService;
    this.commonService = commonService;
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
            giftStartDate: frequency !== 'Single' ? startDate(itemConfig['recurring-day-of-month'], nextDrawDate) : null
          };
        });

        let frequencyTotals = concat({
            frequency: 'Single',
            amount: cartResponse.total.cost.amount,
            total: cartResponse.total.cost.display
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
          items: items,
          frequencyTotals: frequencyTotals,
          cartTotal: frequencyTotals[0].amount
        };
      });
  }

  addItem(uri, data){
    data.quantity = 1;

    return this.cortexApiService.post({
      path: ['itemfieldslineitem', uri],
      data: data
    });
  }

  editItem(oldUri, uri, data){
    return this.deleteItem(oldUri)
      .switchMap(() => this.addItem(uri, data));
  }

  deleteItem(uri){
    return this.cortexApiService.delete({
      path: uri
    });
  }
}

export default angular
  .module(serviceName, [
    cortexApiService.name,
    commonService.name
  ])
  .service(serviceName, Cart);

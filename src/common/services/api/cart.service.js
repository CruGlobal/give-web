import angular from 'angular';
import JSONPath from 'common/lib/jsonPath';
import 'rxjs/add/operator/map';

import cortexApiService from '../cortexApi.service';

let serviceName = 'cartService';

/*@ngInject*/
function cart(cortexApiService){
  return {
    get: get,
    addItem: addItem,
    updateItem: updateItem,
    deleteItem: deleteItem
  };

  function get() {
    return cortexApiService.get({
      path: ['carts', cortexApiService.scope, 'default'],
      params: {
        zoom: 'lineitems:element:availability,lineitems:element:item:code,lineitems:element:item:definition,lineitems:element:rate,lineitems:element:total,ratetotals:element,total,lineitems:element:itemfields'
      }
    }).map((data) => {
      if (!data || !data._lineitems) {
        return {};
      }
      var items = [];
      var frequencyTotals = [];
      var total = 0;
      var elements = JSONPath.query(data, "$._lineitems[0]._element")[0];
      var rateTotals = JSONPath.query(data, "$._ratetotals[0]._element")[0];

      if (elements){
        angular.forEach(elements, function(element) {
          var displayName = JSONPath.query(element, "$._item[0]._definition[0]['display-name']")[0];
          var frequencyInterval = JSONPath.query(element, "$._rate[0].recurrence.interval")[0];
          var frequencyTitle = JSONPath.query(element, "$._rate[0].recurrence.display")[0];
          var price = JSONPath.query(element, "$._rate[0].cost.display")[0];
          var code = JSONPath.query(element, "$._item[0]._code[0].code")[0];
          var designationNumber = JSONPath.query(element, "$._item[0]._code[0]['product-code']")[0];
          var itemConfig = JSONPath.query(element, "$._itemfields[0]")[0];
          delete itemConfig.links;
          delete itemConfig.self;

          var itemAmount = 0;
          if (frequencyTitle && frequencyTitle === "Single"){
            itemAmount = JSONPath.query(element, "$._total[0].cost[0].amount")[0];
          } else {
            itemAmount = JSONPath.query(element, "$._rate[0].cost.amount")[0];
          }

          var itemResource = JSONPath.query(element, "$._availability[0].links[0].uri")[0];
          itemResource = itemResource ? btoa(itemResource) : '';

          frequencyTitle = (!frequencyInterval || frequencyInterval === 'NA') ? frequencyTitle = 'Single' : frequencyTitle;

          items.push({
            uri: itemResource,
            code: code,
            displayName: displayName,
            price: price,
            config: itemConfig,
            frequency: frequencyTitle,
            amount: itemAmount,
            designationNumber: designationNumber
          });
        });
      }

      // total frequency for single
      if (data._total){
        var amountSingle = JSONPath.query(data, "$._total[0].cost[0].amount")[0];
        var totalSingle = JSONPath.query(data, "$._total[0].cost[0].display")[0];

        if (amountSingle){
          total = total + amountSingle;
        }

        frequencyTotals.push({
          frequency: 'Single',
          amount: total,
          total: totalSingle
        });
      }

      // total frequency for monthly | annually ...
      if (rateTotals){
        angular.forEach(rateTotals, function(element) {
          var recurrenceDisplay = JSONPath.query(element, "$.recurrence.display")[0];
          var cost = JSONPath.query(element, "$.cost.display")[0];
          var amount = JSONPath.query(element, "$.cost.amount")[0];
          var totalFreq = 0;
          if (amount){
            totalFreq = totalFreq + amount;
          }

          frequencyTotals.push({
            frequency: recurrenceDisplay,
            amount: totalFreq,
            total: cost
          });
        });
      }

      return {
        items: items,
        frequencyTotals: frequencyTotals,
        cartTotal: total
      };
    });
  }

  function addItem(id, data){
    data.quantity = 1;

    return cortexApiService.post({
      path: ['itemfieldlineitem', 'items', cortexApiService.scope, id],
      data: data
    });
  }

  function updateItem(uri){
    return cortexApiService.post({
      path: uri,
      data: {
        quantity: 1
      }
    });
  }

  function deleteItem(uri){
    return cortexApiService.delete({
      path: uri
    });
  }
}

export default angular
  .module(serviceName, [
    cortexApiService.name
  ])
  .factory(serviceName, cart);

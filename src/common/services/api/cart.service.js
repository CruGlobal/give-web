import angular from 'angular';
import JSONPath from 'jsonpath';
import keyBy from 'lodash/keyBy';
import map from 'lodash/map';

import apiService from '../api.service';

let serviceName = 'cartService';

/*@ngInject*/
function cart(apiService){
  var cartId = null;

  return {
    get: get,
    addItem: addItem,
    updateItem: updateItem,
    deleteItem: deleteItem,
    getDonorDetails: getDonorDetails,
    updateDonorDetails: updateDonorDetails
  };

  function get() {
    return apiService.get({
      path: ['carts', apiService.scope, 'default'],
      params: {
        zoom: 'total,' +
        'lineitems:element:item:price,' +
        'lineitems:element:item:amount,' +
        'lineitems:element:item:definition,' +
        'lineitems:element:total,' +
        'lineitems:element:item:definition'
      }
    }).then((response) => {
      let lineItems = JSONPath.query(response.data, '$.._lineitems.._element.*');
      return {
        items: map(lineItems, (item) => {
          return {
            name: JSONPath.query(item, '$.._item.._definition.*["display-name"]')[0],
            details: keyBy(JSONPath.query(item, '$.._item.._definition..details')[0], 'name'),
            listPrice: JSONPath.query(item, '$.._item.._price..["list-price"].*')[0],
            purchasePrice: JSONPath.query(item, '$.._item.._price..["purchase-price"].*')[0]
          };
        })
      };
    });
  }

  function addItem(itemId){
    return apiService.post({
      path: ['carts', apiService.scope, 'default/lineitems/items', apiService.scope, itemId],
      data: {
        quantity: 1
      }
    });
  }

  function updateItem(itemId){
    return apiService.post({
      path: ['carts', apiService.scope, 'default/lineitems/items', apiService.scope, itemId],
      data: {
        quantity: 1
      }
    });
  }

  function deleteItem(itemId){
    return apiService.delete({
      path: ['carts', apiService.scope, cartId, 'lineitems', itemId]
    });
  }

  function getDonorDetails(){
    return apiService.get({
        path: ['carts', apiService.scope, 'default'],
        params: {
          zoom: 'order:donordetails'
        }
      })
      .then((response) => {
        return JSONPath.query(response.data, '$.._order.._donordetails.*')[0];
      });
  }

  function updateDonorDetails(uri, details){
    return apiService.put({
      path: uri,
      data: details
    });
  }
}

export default angular
  .module(serviceName, [
    apiService.name
  ])
  .factory(serviceName, cart);

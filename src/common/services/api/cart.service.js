import angular from 'angular';
import JSONPath from 'jsonpath';

import apiService from '../api.service';

let serviceName = 'cartService';

/*@ngInject*/
function cart(apiService){
  var cartId = null;

  return {
    get: get,
    addItem: addItem,
    deleteItem: deleteItem,
    getDonorDetails: getDonorDetails
  };

  function get(){
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
    return apiService.put({
      path: ['carts', apiService.scope, cartId, 'lineitems', itemId],
      data: {
        quantity: 0
      }
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
}

export default angular
  .module(serviceName, [
    apiService.name
  ])
  .factory(serviceName, cart);

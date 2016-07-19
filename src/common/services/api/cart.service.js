import angular from 'angular';

import apiService from '../api.service';

let serviceName = 'cart';

/*@ngInject*/
function cart(api){
  var cartId = null;

  return {
    get: get,
    addItem: addItem,
    deleteItem: deleteItem
  };

  function get(){
    return api.get({
      path: ['carts', api.scope, 'default'],
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
    return api.post({
      path: ['carts', api.scope, 'default/lineitems/items', api.scope, itemId],
      data: {
        quantity: 1
      }
    });
  }

  function updateItem(itemId){
    return api.post({
      path: ['carts', api.scope, 'default/lineitems/items', api.scope, itemId],
      data: {
        quantity: 1
      }
    });
  }

  function deleteItem(itemId){
    return api.put({
      path: ['carts', api.scope, cartId, 'lineitems', itemId],
      data: {
        quantity: 0
      }
    });
  }
}

export default angular
  .module(serviceName, [
    apiService.name
  ])
  .factory(serviceName, cart);

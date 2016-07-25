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
    updateDonorDetails: updateDonorDetails,
    getGeographies: {
      countries: getGeographiesCountries,
      regions: getGeographiesRegions
    },
    addEmail: addEmail
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
          zoom: 'order:donordetails,order:emailinfo:email'
        }
      })
      .then((response) => {
        let details = JSONPath.query(response.data, '$.._order.._donordetails.*')[0];
        let email = JSONPath.query(response.data, '$.._order.._emailinfo.*')[0];
        details.email = email ? email['_email'][0]['email'] : '';
        return details;
      });
  }

  function updateDonorDetails(uri, details){
    return apiService.put({
      path: uri,
      data: details
    });
  }

  function addEmail(email){
    return apiService.post({
      path: ['emails', apiService.scope],
      data: {email: email}
    });
  }

  function getGeographiesCountries(){
    return apiService.get({
      path: ['geographies', apiService.scope, 'countries'],
      params: {
        zoom: 'element'
      },
      cache: true
    })
    .then((response) => {
      return response.data._element;
    });
  }

  function getGeographiesRegions(uri){
    return apiService.get({
      path: uri,
      params: {
        zoom: 'element'
      },
      cache: true
    })
    .then((response) => {
      return response.data._element;
    });
  }
}

export default angular
  .module(serviceName, [
    apiService.name
  ])
  .factory(serviceName, cart);

import angular from 'angular';
import JSONPath from 'jsonpath';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import cortexApiService from '../cortexApi.service';

let serviceName = 'designationsService';

/*@ngInject*/
function designations(cortexApiService){

  return {
    createSearch: createSearch,
    getSearchResults: getSearchResults,
    productLookup: productLookup
  };

  function createSearch(keywords){
    return cortexApiService.post({
        path: ['searches', cortexApiService.scope, 'keywords', 'items'],
        params: {
          FollowLocation: true
        },
        data: {
          keywords: keywords,
          'page-size': 1
        }
      })
      .map((data) => {
        return data.self.uri.split('/').pop();
      });
  }

  function getSearchResults(id, page){
    return cortexApiService.get({
      path: ['searches', cortexApiService.scope, 'keywords', 'items', id, 'pages', page],
      params: {
        zoom: 'element:definition'
      }
    });
  }

  function productLookup(query, selectQuery){
    var httpRequest = selectQuery ? cortexApiService.post({
      path: query,
      data: { },
      followLocation: true,
      params: {
        zoom: 'code,definition,definition:options:element:selector:choice:description,definition:options:element:selector:chosen:description,definition:options:element:selector:choice:selectaction'
      }
    }) : cortexApiService.post({
      path: ['lookups', cortexApiService.scope, 'items'],
      followLocation: true,
      data: {
        code: query
      },
      params: {
        zoom: 'code,definition,definition:options:element:selector:choice:description,definition:options:element:selector:chosen:description,definition:options:element:selector:choice:selectaction'
      }
    });

    return httpRequest.map((data) => {
      var idUri = JSONPath.query(data, "$._definition[0].links[?(@.rel=='item')]['uri']")[0];
      var choiceCurrent = JSONPath.query(data, "$._definition[0]._options[0]._element[0]._selector[0]._chosen")[0];
      var choicesArray = JSONPath.query(data, "$._definition[0]._options[0]._element[0]._selector[0]._choice")[0];
      var choices = [];
      angular.forEach(choicesArray.concat(choiceCurrent), function(choice){
        choices.push({
          name: JSONPath.query(choice, "$._description[0]['name']")[0],
          display: JSONPath.query(choice, "$._description[0]['display-name']")[0],
          selectAction: JSONPath.query(choice, "$._selectaction[0].links[?(@.rel=='selectaction')]['uri']")[0]
        });
      });
      var displayName = JSONPath.query(data, "$._definition[0]['display-name']")[0];
      var code = JSONPath.query(data, "$._code[0].code")[0];
      var designationNumber = JSONPath.query(data, "$._definition[0].details[?(@.name=='replacement_designation_id')]['display-value']")[0];

      return {
        id: idUri.split('/').pop(),
        frequencies: choices,
        frequency: JSONPath.query(choiceCurrent[0], "$._description[0]['name']")[0],
        displayName: displayName,
        code: code,
        designationNumber: designationNumber
      };
    });
  }
}

export default angular
  .module(serviceName, [
    cortexApiService.name
  ])
  .factory(serviceName, designations);

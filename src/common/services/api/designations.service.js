import angular from 'angular';
import JSONPath from 'common/lib/jsonPath';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/map';

import cortexApiService from '../cortexApi.service';

let serviceName = 'designationsService';

/*@ngInject*/
function designations($http, envService, cortexApiService){

  return {
    productSearch: productSearch,
    productLookup: productLookup
  };

  function productSearch(params){
    return Observable.from($http({
      method: 'get',
      url: envService.read('apiUrl') + '/search',
      params: params,
      cache: true
    })).map((response) => {
      var results = [];

      angular.forEach(response.data.hits.hit, function(d){
        var fields = d.fields;
        var designation_number = fields.designation_number ? fields.designation_number[0] : null;
        var replacement_designation_number = fields.replacement_designation_number ? fields.replacement_designation_number[0] : null;
        var description = fields.description ? fields.description[0] : null;
        var type = fields.designation_type ? fields.designation_type[0] : null;

        results.push({
          designationNumber: designation_number,
          replacementDesignationNumber: replacement_designation_number,
          name: description,
          type: type
        });
      });

      return results;
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
      var designationNumber = JSONPath.query(data, "$._code[0]['product-code']")[0];

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
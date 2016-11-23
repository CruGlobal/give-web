import angular from 'angular';
import map from 'lodash/map';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/map';

import cortexApiService from '../cortexApi.service';
import hateoasHelperService from '../hateoasHelper.service';

let serviceName = 'designationsService';

class DesignationsService {

  /*@ngInject*/
  constructor($http, envService, cortexApiService, hateoasHelperService){
    this.$http = $http;
    this.envService = envService;
    this.cortexApiService = cortexApiService;
    this.hateoasHelperService = hateoasHelperService;
  }

  productSearch(params){
    return Observable.from(this.$http({
      method: 'get',
      url: this.envService.read('apiUrl') + '/search',
      params: params,
      cache: true
    })).map((response) => {
      return map(response.data.hits.hit, (d) => {
        const fields = d.fields;
        return {
          designationNumber: fields.designation_number ? fields.designation_number[0] : null,
          replacementDesignationNumber: fields.replacement_designation_number ? fields.replacement_designation_number[0] : null,
          name: fields.description ? fields.description[0] : null,
          type: fields.designation_type ? fields.designation_type[0] : null
        };
      });
    });
  }

  productLookup(query, selectQuery){
    const zoomObj = {
      code: 'code',
      definition: 'definition,definition:options:element:selector:chosen:description',
      choices: 'definition:options:element:selector:choice[],definition:options:element:selector:choice:description,definition:options:element:selector:choice:selectaction',
      chosen: 'definition:options:element:selector:chosen,definition:options:element:selector:chosen:description'
    };

    var httpRequest = selectQuery ? this.cortexApiService.post({
      path: query,
      data: { },
      followLocation: true,
      zoom: zoomObj
    }) : this.cortexApiService.post({
      path: ['lookups', this.cortexApiService.scope, 'items'],
      followLocation: true,
      data: {
        code: query
      },
      zoom: zoomObj
    });

    return httpRequest.map((data) => {
      const choices = map(data.choices.concat(data.chosen), (choice) => {
        return {
          name: choice.description.name,
          display: choice.description['display-name'],
          selectAction: choice.selectaction && choice.selectaction.self.uri || ''
        };
      });

      return {
        uri: this.hateoasHelperService.getLink(data.definition, 'item'),
        frequencies: choices,
        frequency: data.chosen.description.name,
        displayName: data.definition['display-name'],
        code: data.code.code,
        designationNumber: data.code['product-code']
      };
    });
  }

  bulkLookup(designationNumbers){
    return this.cortexApiService.post({
      path: ['lookups', this.cortexApiService.scope, 'batches', 'items'],
      data: {
        codes: designationNumbers
      },
      followLocation: true
    });
  }
}

export default angular
  .module(serviceName, [
    cortexApiService.name,
    hateoasHelperService.name
  ])
  .service(serviceName, DesignationsService);

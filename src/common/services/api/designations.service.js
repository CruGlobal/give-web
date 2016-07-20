import angular from 'angular';

import apiService from '../api.service';

let serviceName = 'designationsService';

/*@ngInject*/
function designations(apiService){

  return {
    createSearch: createSearch,
    getSearchResults: getSearchResults
  };

  function createSearch(keywords){
    return apiService.post({
      path: ['searches', apiService.scope, 'keywords', 'items'],
      params: {
        FollowLocation: true
      },
      data: {
        keywords: keywords,
        'page-size': 1
      }
    })
      .then((response) => {
        return response.data.self.uri.split('/').pop();
      });
  }

  function getSearchResults(id, page){
    return apiService.get({
      path: ['searches', apiService.scope, 'keywords', 'items', id, 'pages', page],
      params: {
        zoom: 'element:definition'
      }
    });
  }
}

export default angular
  .module(serviceName, [
    apiService.name
  ])
  .factory(serviceName, designations);

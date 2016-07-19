import angular from 'angular';

import apiService from '../api.service';

let serviceName = 'designations';

/*@ngInject*/
function designations(api){

  return {
    createSearch: createSearch,
    getSearchResults: getSearchResults
  };

  function createSearch(keywords){
    return api.post({
      path: ['searches', api.scope, 'keywords', 'items'],
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
    return api.get({
      path: ['searches', api.scope, 'keywords', 'items', id, 'pages', page],
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

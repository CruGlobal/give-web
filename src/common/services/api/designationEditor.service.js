import angular from 'angular';

import designationConstants from './designationEditor.constants';

let serviceName = 'designationEditorService';

class designationEditorService {

  /*@ngInject*/
  constructor($http){
    this.$http = $http;
  }

  getContent(designationNumber) {
    return this.$http.get(designationConstants.designationSecurityEndpoint, {
      params: {
        designationNumber: designationNumber
      },
      withCredentials: true
    });
  }

  getPhotos(designationNumber){
    return this.$http.get(designationConstants.designationImagesEndpoint, {
      params: {
        designationNumber: designationNumber
      },
      withCredentials: true
    });
  }

  save(designationContent){
    return this.$http.post(designationConstants.saveEndpoint, designationContent, {
      withCredentials: true
    });
  }
}

export default angular
  .module(serviceName, [
  ])
  .service(serviceName, designationEditorService);

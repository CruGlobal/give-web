import angular from 'angular';

import designationConstants from './designationEditor.constants';

let serviceName = 'designationEditorService';

class designationEditorService {

  /*@ngInject*/
  constructor($http){
    this.$http = $http;
  }

  checkPermission(designationNumber, campaign) {
    return this.$http.get(designationConstants.designationCanEdit, {
      params: {
        designationNumber: designationNumber,
        campaign: campaign
      },
      withCredentials: true
    });
  }

  getContent(designationNumber, campaign) {
    return this.$http.get(designationConstants.designationSecurityEndpoint, {
      params: {
        designationNumber: designationNumber,
        campaign: campaign
      },
      withCredentials: true
    });
  }

  getPhotos(designationNumber, campaign){
    return this.$http.get(designationConstants.designationImagesEndpoint, {
      params: {
        designationNumber: designationNumber,
        campaign: campaign
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

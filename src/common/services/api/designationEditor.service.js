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

  getPhotos(designationNumber){
    return this.$http.get(designationConstants.designationImagesEndpoint, {
      params: {
        designationNumber: designationNumber
      },
      withCredentials: true
    });
  }

  save(designationContent, designationNumber, campaignPage){
    return this.$http.post(designationConstants.saveEndpoint, designationContent, {
      withCredentials: true,
      params: {
        designationNumber: designationNumber,
        campaign: campaignPage
      }
    });
  }
}

export default angular
  .module(serviceName, [
  ])
  .service(serviceName, designationEditorService);

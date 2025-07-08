import angular from 'angular';

import designationConstants from './designationEditor.constants';

const serviceName = 'designationEditorService';

class designationEditorService {
  /* @ngInject */
  constructor($http, $q) {
    this.$http = $http;
    this.$q = $q;
  }

  checkPermission(designationNumber, campaign) {
    // response of 200 or 422 is valid to edit
    return this.$http
      .head(designationConstants.designationEndpoint, {
        params: {
          designationNumber: designationNumber,
          campaign: campaign,
        },
        withCredentials: true,
      })
      .then(
        () => true,
        (errorResponse) =>
          errorResponse.status === 422 ? true : this.$q.reject(),
      );
  }

  getContent(designationNumber, campaign) {
    return this.$http.get(designationConstants.designationEndpoint, {
      params: {
        designationNumber: designationNumber,
        campaign: campaign,
      },
      withCredentials: true,
    });
  }

  getPhotos(designationNumber) {
    return this.$http.get(designationConstants.designationImagesEndpoint, {
      params: {
        designationNumber: designationNumber,
      },
      withCredentials: true,
    });
  }

  hasNewsletter(designationNumber) {
    return this.$http
      .get(designationConstants.designationNewsletter, {
        params: {
          designationNumber: designationNumber,
        },
        withCredentials: true,
      })
      .then(
        (result) => result.data.user_exists === true,
        (errorResponse) => false, // TODO: check errorResponse json
      );
  }

  subscribeToNewsletter(designationNumber, attributes) {
    return this.$http.post(
      designationConstants.designationNewsletterSubscription,
      {
        designation_number: designationNumber,
        ...attributes,
      },
      {
        withCredentials: true,
      },
    );
  }

  save(designationContent, designationNumber, campaignPage) {
    return this.$http.post(
      designationConstants.designationEndpoint,
      designationContent,
      {
        withCredentials: true,
        params: {
          designationNumber: designationNumber,
          campaign: campaignPage,
        },
      },
    );
  }
}

export default angular
  .module(serviceName, [])
  .service(serviceName, designationEditorService);

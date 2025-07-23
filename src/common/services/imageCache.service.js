import angular from 'angular';
import 'angular-environment';
import retryService from './retry.service';

const serviceName = 'imageCacheService';

class ImageCache {
  /* @ngInject */
  constructor($q, $http, envService, retryService) {
    this.$q = $q;
    this.$http = $http;
    this.envService = envService;
    this.retryService = retryService;
    this.blobCache = new Map();
  }

  // Convert an image pathname into its absolute URL
  makeAbsoluteUrl(url) {
    return this.envService.read('imgDomainDesignation') + url;
  }

  // Lookup an image pathname and return its blob URL if it is cached or its absolute URL otherwise
  get(url) {
    return this.blobCache.get(url) || this.makeAbsoluteUrl(url);
  }

  // Cache an image by its pathname and return a promise that resolves to its blob URL
  cache(url) {
    return this.retryService
      .executeWithRetries(
        () =>
          this.$http.get(this.makeAbsoluteUrl(url), { responseType: 'blob' }),
        30,
        3000,
      )
      .then((response) => {
        const blob = URL.createObjectURL(response.data);
        this.blobCache.set(url, blob);
        return blob;
      });
  }
}

export default angular
  .module(serviceName, ['environment', retryService.name])
  .service(serviceName, ImageCache);

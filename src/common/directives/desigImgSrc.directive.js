import angular from 'angular';

import imageCacheService from '../services/imageCache.service';

const directiveName = 'desigImgSrc';

// Similar to ng-src, desig-img-src takes an image pathname (i.e. a URL without a domain), and sets the `src` attribute,
// adding the designation image domain and also handling locally cached images
const desigImgSrc = /* @ngInject */ (imageCacheService) => ({
  restrict: 'A',
  scope: {
    src: '@desigImgSrc',
  },
  link: (scope, element) => {
    scope.$watch('src', () => {
      element.attr('src', imageCacheService.get(scope.src));
    });
  },
});

export default angular
  .module(directiveName, [imageCacheService.name])
  .directive(directiveName, desigImgSrc);

import angular from 'angular';

let directiveName = 'desigSrc';

/* @ngInject */
function desigSrc(envService) {
  return {
    restrict: 'A',
    link:     function ( scope, element, attributes ) {
      let imgUrl = envService.read('imgDomainDesignation') + '/bin/crugive/image?thumbnailDesigNumber=' + attributes.desigSrc;
      attributes.$set('src', imgUrl);
    }
  };
}

export default angular
  .module( directiveName, [] )
  .directive( directiveName, desigSrc );

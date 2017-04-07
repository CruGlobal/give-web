import angular from 'angular';
import appConfig from 'common/app.config';

let directiveName = 'desigSrc';

/* @ngInject */
function desigSrc(envService) {
  return {
    restrict: 'A',
    link:     function ( scope, element, attributes ) {
      let imgUrl = envService.read('imgDomainDesignation') + '/bin/crugive/imageThumbnail?designationNumber=' + attributes.desigSrc;
      if(attributes.hasOwnProperty('campaignPage') && attributes.campaignPage !== '') {
        imgUrl += '&campaign=' + attributes.campaignPage;
      }
      attributes.$set('src', imgUrl);
    }
  };
}

export default angular
  .module( directiveName, [
    'environment',
    appConfig.name
  ] )
  .directive( directiveName, desigSrc );

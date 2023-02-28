import angular from 'angular'

const directiveName = 'desigImgSrc'

// Similar to ng-src, desig-img-src takes an image pathname (i.e. a URL without a domain), and sets the `src` attribute,
// adding the designation image domain
const desigImgSrc = /* @ngInject */ (envService) => ({
  restrict: 'A',
  scope: {
    src: '@desigImgSrc'
  },
  link: (scope, element) => {
    const imgDomain = envService.read('imgDomainDesignation')
    scope.$watch('src', () => {
      element.attr('src', scope.src.startsWith('blob:') ? scope.src : imgDomain + scope.src)
    })
  }
})

export default angular
  .module(directiveName, [])
  .directive(directiveName, desigImgSrc)

import angular from 'angular';

const directiveName = 'autoFocus';

const desigSrc = /* @ngInject */ function ($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element) {
      $timeout(function () {
        element[0].focus();
      }, 300);
    },
  };
};

export default angular
  .module(directiveName, [])
  .directive(directiveName, desigSrc);

import angular from 'angular';

import template from './subNav.tpl';

let directiveName = 'cruSubNav';

/* @ngInject */
function desktopSubNav($window) {
  return {
    restrict: 'E',
    templateUrl: template.name,
    link: function ( scope, element ) {

      let subNavigation = element.children()[0];
      angular.element($window).bind('scroll', () => {
        subNavigation.className = $window.scrollY > subNavigation.offsetTop ? 'out' : '';
      });

    }
  };
}

export default angular
  .module( directiveName, [
    template.name
  ] )
  .directive( directiveName, desktopSubNav );

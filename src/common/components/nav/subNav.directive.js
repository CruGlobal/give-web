import angular from 'angular';

import template from './subNav.tpl';

let directiveName = 'cruSubNav';

/* @ngInject */
function cruSubNav($window) {
  let offsetTop;
  return {
    restrict: 'E',
    templateUrl: template.name,
    link: function ( scope, element ) {

      let subNavigation = element.children()[0];
      let parent = element.parent();

      let desktopNavigation = parent.children()[0] || {};
      offsetTop = !offsetTop ? subNavigation.offsetTop : offsetTop;
      angular.element($window).bind('scroll', () => {
        subNavigation.className = $window.scrollY > offsetTop ? 'out' : '';
        desktopNavigation.className = $window.scrollY > offsetTop ? 'padded' : '';
      });

    }
  };
}

export default angular
  .module( directiveName, [
    template.name
  ] )
  .directive( directiveName, cruSubNav );

import angular from 'angular';

import template from './subNav.tpl.html';

let directiveName = 'cruSubNav';

/* @ngInject */
function cruSubNav($window) {
  let offsetTop;
  return {
    restrict: 'E',
    template: template,
    link: function ( scope, element ) {

      let subNavigation = element.children()[0];
      let parent = element.parent();

      let desktopNavigation = parent.children()[0] || {style: {}};
      offsetTop = !offsetTop ? subNavigation.offsetTop : offsetTop;
      angular.element($window).bind('scroll', () => {
        subNavigation.className = $window.scrollY > offsetTop ? 'out' : '';
        desktopNavigation.style['margin-bottom'] =
          ($window.scrollY > offsetTop ?
            subNavigation.clientHeight : 0) + 'px';
      });

    }
  };
}

export default angular
  .module( directiveName, [] )
  .directive( directiveName, cruSubNav );

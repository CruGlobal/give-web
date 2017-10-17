import angular from 'angular';

import {subNavLockEvent, subNavUnlockEvent} from 'common/components/nav/nav.component';
import template from './subNav.tpl.html';

let directiveName = 'cruSubNav';

/* @ngInject */
function cruSubNav($rootScope, $window) {
  let offsetTop;
  return {
    restrict: 'E',
    templateUrl: template,
    link: function ( scope, element ) {

      let subNavigation = element.children()[0];
      let parent = element.parent();
      let lastSubNavEvent;

      let desktopNavigation = parent.children()[0] || {style: {}};
      offsetTop = !offsetTop ? subNavigation.offsetTop : offsetTop;
      angular.element($window).bind('scroll', () => {
        subNavigation.className = $window.scrollY > offsetTop ? 'out' : '';
        desktopNavigation.style['margin-bottom'] =
          ($window.scrollY > offsetTop ?
            subNavigation.clientHeight : 0) + 'px';

        if($window.scrollY > offsetTop && lastSubNavEvent !== subNavLockEvent){
          $rootScope.$emit(subNavLockEvent);
          lastSubNavEvent = subNavLockEvent;
        }else if($window.scrollY <= offsetTop && lastSubNavEvent !== subNavUnlockEvent){
          $rootScope.$emit(subNavUnlockEvent);
          lastSubNavEvent = subNavUnlockEvent;
        }
      });
    }
  };
}

export default angular
  .module( directiveName, [] )
  .directive( directiveName, cruSubNav );

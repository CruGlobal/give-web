import angular from 'angular';
import 'angular-gettext';
import nav from 'common/components/nav/nav.component';
import 'angular-animate';

let moduleName = 'common';

export default angular
  .module( moduleName, [
    'gettext',
    'ngAnimate',
    nav.name
  ]);

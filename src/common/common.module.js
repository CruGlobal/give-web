import angular from 'angular';
import 'angular-gettext';
import nav from 'common/components/nav/nav.component';

let moduleName = 'common';

export default angular
  .module( moduleName, [
    'gettext',
    nav.name
  ]);

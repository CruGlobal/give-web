import angular from 'angular';
import 'angular-gettext';
import 'angular-animate';
import loadingComponent from './components/loading/loading.component';
import nav from 'common/components/nav/nav.component';

let moduleName = 'common';

export default angular
  .module( moduleName, [
    'gettext',
    'ngAnimate',
    nav.name,
    loadingComponent.name
  ]);

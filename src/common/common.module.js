import angular from 'angular';
import 'angular-gettext';
import 'angular-animate';

import appConfig from './app.config';
import loadingComponent from './components/loading/loading.component';
import navCartIcon from 'common/components/nav/navCartIcon.component';
import analyticsRun from 'app/analytics/analytics.run';

let moduleName = 'common';

export default angular
  .module( moduleName, [
    'gettext',
    'ngAnimate',
    appConfig.name,
    navCartIcon.name,
    loadingComponent.name,
    analyticsRun.name
  ]);

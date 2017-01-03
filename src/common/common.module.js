import angular from 'angular';
import 'angular-gettext';
import 'angular-animate';

import appConfig from './app.config';
import loadingComponent from './components/loading/loading.component';
import nav from 'common/components/nav/nav.component';
import analyticsModule from 'app/analytics/analytics.module';
import analyticsRun from 'app/analytics/analytics.run';

let moduleName = 'common';

export default angular
  .module( moduleName, [
    'gettext',
    'ngAnimate',
    appConfig.name,
    nav.name,
    loadingComponent.name,
    analyticsModule.name,
    analyticsRun.name
  ]);

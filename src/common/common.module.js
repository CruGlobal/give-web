import angular from 'angular';
import 'angular-gettext';
import 'angular-animate';

import appConfig from './app.config';
import loadingComponent from './components/loading/loading.component';
import nav from 'common/components/nav/nav.component';
import navCartIcon from 'common/components/nav/navCartIcon.component';
import navSignIn from 'common/components/nav/navSignIn.component';
import analyticsRun from 'app/analytics/analytics.run';

let moduleName = 'common';

export default angular
  .module( moduleName, [
    'gettext',
    'ngAnimate',
    appConfig.name,
    nav.name,
    navCartIcon.name,
    navSignIn.name,
    loadingComponent.name,
    analyticsRun.name
  ]);

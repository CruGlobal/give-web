import angular from 'angular';
import 'angular-gettext';
import 'angular-animate';

import appConfig from './app.config';
import loadingComponent from './components/loading/loading.component';
import navCartIcon from 'common/components/nav/navCartIcon.component';
import analyticsRun from 'app/analytics/analytics.run';

import sessionModalService from "./services/session/sessionModal.service";
import sessionService from "./services/session/session.service";

let moduleName = 'common';

export default angular
  .module( moduleName, [
    'gettext',
    'ngAnimate',
    appConfig.name,
    navCartIcon.name,
    loadingComponent.name,
    analyticsRun.name,
    sessionService.name,
    sessionModalService.name
  ]);

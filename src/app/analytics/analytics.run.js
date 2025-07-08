import angular from 'angular';
import 'app/analytics/analytics.factory';

const dataLayer = /* @ngInject */ function ($window, analyticsFactory) {
  if (
    !$window.location.hostname ||
    $window.location.hostname.indexOf('give') === -1
  ) {
    return;
  }

  /* Build data layer */
  $window.digitalData = {
    page: {
      attributes: {
        angularLoaded: 'false',
      },
    },
  };

  const path = analyticsFactory.getPath();

  analyticsFactory.setSiteSections(path);
};

export default angular.module('analytics').run(dataLayer);

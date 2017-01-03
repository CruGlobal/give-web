import 'app/analytics/analytics.factory';

function dataLayer($window, analyticsFactory) {

    /* Build data layer */
  $window.digitalData = {
      page: {
        attributes: {
          angularLoaded: 'false'
        }
      }
    };

    const path = analyticsFactory.getPath();

    analyticsFactory.setSiteSections(path);

}

export default angular
    .module('analytics')
    .run(dataLayer);

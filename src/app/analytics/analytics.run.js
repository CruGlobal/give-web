import sessionService from 'common/services/session/session.service';
import analyticsFactory from 'app/analytics/analytics.factory';

function dataLayer($rootScope,sessionService,analyticsFactory) {

    /* Build data layer */
    window.digitalData = {
      page: {
        attributes: {
          angularLoaded: 'false'
        }
      }
    };

    var path = analyticsFactory.getPath();

    analyticsFactory.setSiteSections(path);

}

export default angular
    .module('analytics')
    .run(dataLayer);
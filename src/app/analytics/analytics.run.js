import sessionService from 'common/services/session/session.service';
import analyticsFactory from 'app/analytics/analytics.factory';

function dataLayer($rootScope,sessionService,analyticsFactory) {

    /* Build data layer */
    var path = analyticsFactory.getPath();

    analyticsFactory.setSiteSections(path);

    // Logged in status
    console.log(sessionService);

}

export default angular
    .module('analytics')
    .run(dataLayer);
import sessionService from 'common/services/session/session.service';
import analyticsFactory from 'app/analytics/analytics.factory';

function dataLayer(sessionService,analyticsFactory) {

    /* Build data layer */
    var path = analyticsFactory.getPath();

    analyticsFactory.setSiteSections(path);

    // Logged in status
    if (sessionService.getRole() == 'REGISTERED') {

    }

}

export default angular
    .module('analytics')
    .run(dataLayer);
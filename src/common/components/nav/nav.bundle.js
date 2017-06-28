/* eslint-disable angular/window-service, angular/document-service */
{
  // Save a copy of the existing angular for later restoration
  const existingWindowDotAngular = window.angular;

  // create a new window.angular and a closure variable for
  // angular.js to load itself into
  const angular = (window.angular = {});

  require('./nav.component');

  //Manually bootstrap cruNav
  angular.element(document).ready(function () {
    angular.bootstrap(document.getElementsByTagName("cru-nav")[0], ["cruNav"]);
    // restore the old angular version
    window.angular = existingWindowDotAngular;
  });
}

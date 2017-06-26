const distNavPath = './dist/cruNav.js', fs = require('fs');

var navJS = '(function() {';
  // Save a copy of the existing angular for later restoration
  navJS += 'var existingWindowDotAngular = window.angular;';

  // create a new window.angular and a closure variable for
  // angular.js to load itself into
  navJS += 'var angular = (window.angular = {});';

  //cruNav
  navJS += fs.readFileSync(distNavPath, 'utf8');
  navJS += '\n';

  //Manually bootstrap cruNav
  navJS += 'angular.element(document).ready(function() {';
    navJS += 'angular.bootstrap(document.getElementsByTagName("cru-nav")[0], ["cruNav"]);';

    // restore the old angular version
    navJS += 'window.angular = existingWindowDotAngular;';
  navJS += '});';
navJS += '})();';

fs.writeFileSync(distNavPath, navJS);

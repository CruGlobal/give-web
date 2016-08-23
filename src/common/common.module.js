import angular from 'angular';

import signInButton from 'common/components/signInButton/signInButton.component';

let moduleName = 'common';

export default angular
  .module( moduleName, [
    signInButton.name
  ]);

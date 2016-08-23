import angular from 'angular';
import 'angular-gettext'
import signInButton from 'common/components/signInButton/signInButton.component';

let moduleName = 'common';

export default angular
  .module( moduleName, [
    'gettext',
    signInButton.name
  ]);

import angular from 'angular';
import appConfig from 'common/app.config';
import template from './profile.tpl';

class ProfileController {

  /* @ngInject */
  constructor() {}
}

let componentName = 'profile';

export default angular
  .module(componentName, [
    appConfig.name,
    template.name
  ])
  .component(componentName, {
    controller: ProfileController,
    templateUrl: template.name
  });

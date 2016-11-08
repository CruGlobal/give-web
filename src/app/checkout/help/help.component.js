import angular from 'angular';
import 'angular-sanitize';

import template from './help.tpl';

let componentName = 'help';

class CheckoutHelpController {

  /* @ngInject */
  constructor($http) {
    this.$http = $http;
  }

  $onInit(){
    this.$http.get('/etc/designs/give/_jcr_content/content/give-need-help.json').then((response) => {
      this.helpHTML = response.data.richtextglobal;
    });
  }
}

export default angular
  .module(componentName, [
    'ngSanitize',
    template.name
  ])
  .component(componentName, {
    controller: CheckoutHelpController,
    templateUrl: template.name
  });

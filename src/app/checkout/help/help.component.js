import angular from 'angular';
import 'angular-sanitize';

import template from './help.tpl.html';

const componentName = 'help';

class CheckoutHelpController {
  /* @ngInject */
  constructor($log, $http) {
    this.$log = $log;
    this.$http = $http;
  }

  $onInit() {
    this.$http
      .get('/designations/jcr:content/need-help-ipar/contentfragment.html')
      .then(
        (response) => {
          this.helpHTML = response.data;
        },
        (error) => {
          this.$log.error('Error loading give-need-help', error);
        },
      );
  }
}

export default angular
  .module(componentName, ['ngSanitize'])
  .component(componentName, {
    controller: CheckoutHelpController,
    templateUrl: template,
  });

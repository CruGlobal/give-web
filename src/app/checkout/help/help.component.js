import angular from 'angular'
import 'angular-sanitize'

import template from './help.tpl.html'

const componentName = 'help'

class CheckoutHelpController {
  /* @ngInject */
  constructor ($log, $http) {
    this.$log = $log
    this.$http = $http
  }

  $onInit () {
    // this.$http.get('/designations/jcr:content/need-help-ipar/contentfragment.html').then((response) => {
    //   this.helpHTML = response.data
    // }, error => {
    //   this.$log.error('Error loading give-need-help', error)
    // })

    this.helpHTML = '<div><h3 class="panel-name">Need Help?</h3>\n' +
        '<p>Call us at <b>(888)278-7233</b> from <b>9:00 a.m. to 5:00 p.m. ET,</b> Monday-Friday, or email us at <a href="mailto:eGift@cru.org" target="_top">eGift@cru.org</a>.</p>\n' +
        '<p>We have also compiled a list of answers to <a>Frequently Asked Questions.</a></p>\n' +
        '</div>'
  }
}

export default angular
  .module(componentName, [
    'ngSanitize'
  ])
  .component(componentName, {
    controller: CheckoutHelpController,
    templateUrl: template
  })

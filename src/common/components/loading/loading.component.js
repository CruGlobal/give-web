import angular from 'angular'

import './loading.scss'

import template from './loading.tpl.html'

const componentName = 'loading'

/**
 * --- Usage ---
 * <loading type="overlay|centered|block" inline="true|false">
 *     <translate>Loading my data...</translate>
 * </loading>
 *
 * -- Defaults --
 * None of the attributes are required and will default to the following:
 * <loading type="block" inline="false"></loading>
 *
 * -- Accepted attributes --
 *
 * - Loading Indicator Types - Default is "block"
 * type="overlay" - Centered horizontally and vertically in parent element with translucent white background
 * type="centered" - Centered horizontally and vertically in parent element with translucent white background
 * type="block" - Centered horizontally on a new line
 *
 * - Inline attribute - Default is "false"
 * inline="true" - Shows transcluded content inline with the loading indicator
 *
 * -- Text Label --
 *
 * Any content provided inside the <loading></loading> tag will be placed above or before the loading indicator depending on the value of inline
 */

class LoadingController {
  /* @ngInject */
  constructor () {
    this.type = 'block'
    this.inline = false
    this.iconFirst = false
  }
}

export default angular
  .module(componentName, [])
  .component(componentName, {
    controller: LoadingController,
    templateUrl: template,
    bindings: {
      type: '@',
      inline: '@',
      iconFirst: '@'
    },
    transclude: true
  })

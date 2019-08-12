import angular from 'angular'
import template from './recurring-gifts.tpl.html'

class recurringGiftsController {
}

const componentName = 'recurringGifts'

export default angular
  .module(componentName, [])
  .component(componentName, {
    controller: recurringGiftsController,
    templateUrl: template,
    bindings: {
      gifts: '<'
    }
  })

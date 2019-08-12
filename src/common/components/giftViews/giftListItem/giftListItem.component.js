import angular from 'angular'
import template from './giftListItem.tpl.html'
import desigSrc from 'common/directives/desigSrc.directive'

const componentName = 'giftListItem'

class GiftListItemController {
}

export default angular
  .module(componentName, [
    desigSrc.name
  ])
  .component(componentName, {
    controller: GiftListItemController,
    templateUrl: template,
    transclude: {
      selectInput: '?label'
    },
    bindings: {
      gift: '=',
      selectable: '@',
      selectLabel: '@',
      onSelected: '&'
    }
  })

import angular from 'angular';
import template from './giftListItem.tpl';
import desigSrc from 'common/directives/desigSrc.directive';

let componentName = 'giftListItem';

class GiftListItemController {

  /* @ngInject */
  constructor() {
  }
}

export default angular
  .module( componentName, [
    template.name,
    desigSrc.name
  ] )
  .component( componentName, {
    controller:  GiftListItemController,
    templateUrl: template.name,
    transclude:  {
      'selectInput': '?label'
    },
    bindings:    {
      gift:        '=',
      selectable:  '@',
      selectLabel: '@',
      onSelected:  '&'
    }
  } );

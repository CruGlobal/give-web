import angular from 'angular';
import template from './giftSimpleView.tpl';
import 'angular-ordinal';

let componentName = 'giftSimpleView';

class GiftSimpleViewController {

  /* @ngInject */
  constructor() {
  }
}

export default angular
  .module( componentName, [
    template.name,
    'ordinal'
  ] )
  .component( componentName, {
    controller:  GiftSimpleViewController,
    templateUrl: template.name,
    bindings:    {
      gift: '<'
    }
  } );

import angular from 'angular';
import paymentMethodDisplay from 'common/components/paymentMethods/paymentMethodDisplay.component';
import template from './giftDetail.tpl';

let componentName = 'giftDetail';

class GiftDetail {

  /* @ngInject */
  constructor() {
    console.log( this.gift );
  }
}
export default angular
  .module( componentName, [
    paymentMethodDisplay.name,
    template.name
  ] )
  .directive( componentName, () => {
    return {
      templateUrl:      template.name,
      restrict:         'A',
      scope:            false,
      bindToController: {
        gift: `<${componentName}`
      },
      controllerAs:     '$ctrl',
      controller:       GiftDetail
    }
  } )
  .component( `${componentName}2`, {
    controller:  GiftDetail,
    templateUrl: template.name,
    bindings:    {
      gift: '<'
    }
  } );

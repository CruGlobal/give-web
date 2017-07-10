import angular from 'angular';
import paymentMethodDisplay from 'common/components/paymentMethods/paymentMethodDisplay.component';
import template from './recipientDetail.tpl.html';

let componentName = 'recipientDetail';

class RecipientDetail {

  /* @ngInject */
  constructor() {
  }
}
export default angular
  .module( componentName, [
    paymentMethodDisplay.name
  ] )
  .directive( componentName, () => {
    return {
      template:      template,
      restrict:         'A',
      scope:            false,
      bindToController: {
        gift: `<${componentName}`
      },
      controllerAs:     '$ctrl',
      controller:       RecipientDetail
    };
  } );

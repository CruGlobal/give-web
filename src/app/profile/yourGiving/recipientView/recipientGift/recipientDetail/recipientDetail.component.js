import angular from 'angular';
import paymentMethodDisplay from 'common/components/paymentMethods/paymentMethodDisplay.component';
import template from './recipientDetail.tpl.html';

const componentName = 'recipientDetail';

class RecipientDetail {
  /* @ngInject */
  constructor() /* eslint-disable-line no-useless-constructor */ {}
}

export default angular
  .module(componentName, [paymentMethodDisplay.name])
  .directive(componentName, () => {
    return {
      templateUrl: template,
      restrict: 'A',
      scope: false,
      bindToController: {
        gift: `<${componentName}`,
      },
      controllerAs: '$ctrl',
      controller: RecipientDetail,
    };
  });

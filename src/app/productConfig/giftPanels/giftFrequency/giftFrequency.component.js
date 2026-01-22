import angular from 'angular';
import indexOf from 'lodash/indexOf';
import loading from 'common/components/loading/loading.component';
import template from './giftFrequency.tpl.html';

const componentName = 'giftFrequency';

class GiftFrequencyController {
  frequencyOrder(f) {
    const order = ['NA', 'MON', 'QUARTERLY', 'ANNUAL'];
    return indexOf(order, f.name);
  }
}

export default angular
  .module(componentName, [loading.name])
  .component(componentName, {
    controller: GiftFrequencyController,
    templateUrl: template,
    bindings: {
      productData: '<',
      changeFrequency: '<',
      changingFrequency: '<',
    },
  });

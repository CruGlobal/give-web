import angular from 'angular';
import loading from 'common/components/loading/loading.component';
import template from './giftFrequency.tpl.html';

const componentName = 'giftFrequency';

class GiftFrequencyController {}

export default angular
  .module(componentName, [loading.name])
  .component(componentName, {
    controller: GiftFrequencyController,
    templateUrl: template,
    bindings: {
      productData: '<',
      frequencyOrder: '<',
      changeFrequency: '<',
      changingFrequency: '<',
    },
  });

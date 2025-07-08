import angular from 'angular';
import transform from 'lodash/transform';
import sortBy from 'lodash/sortBy';

const controllerName = 'pageOptionsCtrl';

class ModalInstanceCtrl {
  /* @ngInject */
  constructor(
    parentDesignationNumber,
    organizationId,
    suggestedAmounts,
    facebookPixelId,
  ) {
    this.parentDesignationNumber = parentDesignationNumber;
    this.organizationId = organizationId;
    this.facebookPixelId = facebookPixelId;

    this.suggestedAmounts = transform(
      suggestedAmounts,
      (result, value, key) => {
        if (key === 'jcr:primaryType' || !value?.amount) return;
        result.push({
          amount: Number(value.amount),
          description: value.description,
          order: Number(key),
        });
      },
      [],
    );
    this.suggestedAmounts = sortBy(this.suggestedAmounts, 'order');
  }

  transformSuggestedAmounts() {
    const filterOutZeroAmounts = this.suggestedAmounts.filter(
      (amount) => amount?.amount,
    );
    return transform(
      filterOutZeroAmounts,
      (result, value, i) => {
        delete value.order;
        result[i + 1] = value;
      },
      {},
    );
  }
}

export default angular
  .module(controllerName, [])
  .controller(controllerName, ModalInstanceCtrl);

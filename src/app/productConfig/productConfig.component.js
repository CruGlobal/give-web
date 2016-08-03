import angular from 'angular';

import template from './productConfig.tpl';
import templateModal from './productConfigModal.tpl';
import designationsService from 'common/services/api/designations.service';

let componentName = 'productConfig';

class ProductConfigController{

  /* @ngInject */
  constructor($uibModal) {
    this.$uibModal = $uibModal;
  }

  configModal(){
    var productCode = this.productCode;

    this.$uibModal.open({
      templateUrl: templateModal.name,
      controller: ModalInstanceCtrl,
      controllerAs: '$ctrl',
      size: 'lg give-modal',
      resolve: {
        productData: [designationsService.name, function(designationsService){
          return designationsService.productLookup(productCode);
        }]
      }
    }).result.then(function () {
      //go to cart

    });
  }
}

class ModalInstanceCtrl{

  /* @ngInject */
  constructor($uibModalInstance, designationsService, cartService, productData) {
    this.$uibModalInstance = $uibModalInstance;
    this.designationsService = designationsService;
    this.cartService = cartService;

    productData.subscribe((data) => {
      this.productData = data;
    });

    this.itemConfig = {
      amount: 100
    };
  }

  frequencyOrder(f){
    let order = ['NA', 'MON', 'QUARTERLY', 'ANNUAL', 'SEMIANNUAL'];
    return _.indexOf(order, f.name);
  }

  changeFrequency(productId){
    this.designationsService.productLookup(productId, true).subscribe((data) => {
      this.productData = data;
    });
  }

  addToCart(){
    this.cartService.addItem(this.productData.id, this.itemConfig)
      .subscribe(() => {
        this.$uibModalInstance.close();
      });
  }

  daysInMonth(month){
    var daysInMonth = new Date(2001, month, 0).getDate();
    return _.range(1, daysInMonth + 1);
  }
}

export default angular
  .module(componentName, [
    template.name,
    templateModal.name,
    designationsService.name
  ])
  .component(componentName, {
    controller: ProductConfigController,
    templateUrl: template.name,
    bindings: {
      productCode: '@',
      buttonLabel: '@'
    }
  });

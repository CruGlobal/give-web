import angular from 'angular';

import template from './productConfig.tpl';
import templateModal from './productConfigModal.tpl';
import modalController from './productConfig.modal';
import designationsService from 'common/services/api/designations.service';

let componentName = 'productConfig';

class ProductConfigController{

  /* @ngInject */
  constructor($uibModal, $window) {
    this.$uibModal = $uibModal;
    this.$window = $window;
  }

  configModal(){
    var productCode = this.productCode;
    var $window = this.$window;

    this.$uibModal.open({
      templateUrl: templateModal.name,
      controller: modalController,
      controllerAs: '$ctrl',
      size: 'lg give-modal',
      resolve: {
        productData: [designationsService.name, function(designationsService){
          return designationsService.productLookup(productCode).toPromise();
        }],
        itemConfig: function(){
          return {
            amount: 100
          };
        }
      }
    }).result.then(function () {
      //go to cart
      $window.location.reload();
    });
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

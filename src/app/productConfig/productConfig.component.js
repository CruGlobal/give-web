import angular from 'angular';
import 'angular-messages';
import 'angular-bootstrap';

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
            amount: 50
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
    'ui.bootstrap',
    'ngMessages',
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

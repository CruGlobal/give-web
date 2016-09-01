import angular from 'angular';
import 'angular-messages';
import 'angular-bootstrap';

import template from './productConfig.tpl';
import templateModal from './productConfigModal.tpl';
import modalController from './productConfig.modal';
import designationsService from 'common/services/api/designations.service';
import commonModule from 'common/common.module';
import showErrors from 'common/filters/showErrors.filter';

let componentName = 'productConfig';

class ProductConfigController{

  /* @ngInject */
  constructor($uibModal, $window) {
    this.$uibModal = $uibModal;
    this.$window = $window;
  }

  $onInit(){
    this.loadingModal = false;
  }

  configModal(){
    var productCode = this.productCode;
    var $window = this.$window;
    this.loadingModal = true;

    let modalInstance = this.$uibModal.open({
      templateUrl: templateModal.name,
      controller: modalController.name,
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
    });
    modalInstance.rendered.then(() => {
      this.loadingModal = false;
    });
    modalInstance.result.then(() => {
      //go to cart
      $window.location.reload();
    });
  }
}



export default angular
  .module(componentName, [
    commonModule.name,
    'ui.bootstrap',
    'ngMessages',
    template.name,
    templateModal.name,
    designationsService.name,
    showErrors.name,
    modalController.name
  ])
  .component(componentName, {
    controller: ProductConfigController,
    templateUrl: template.name,
    bindings: {
      productCode: '@',
      buttonLabel: '@'
    }
  });

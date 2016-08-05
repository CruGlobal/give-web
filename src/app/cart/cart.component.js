import 'babel/external-helpers';
import angular from 'angular';

import appConfig from 'common/app.config';

import cartService from 'common/services/api/cart.service';
import designationsService from 'common/services/api/designations.service';

import template from './cart.tpl';
import templateModal from 'app/productConfig/productConfigModal.tpl';

let componentName = 'cart';

class CartController{

  /* @ngInject */
  constructor($uibModal, cartService) {
    this.$uibModal = $uibModal;
    this.cartService = cartService;

    this.loadCart();
  }

  loadCart(){
    this.cartService.get()
      .subscribe((data) => {
        this.cartData = data;
      });
  }

  removeItem(uri){
    this.cartData = null;

    this.cartService.deleteItem(atob(uri))
      .subscribe(() => {
        this.loadCart();
      });
  }

  editItem(item){
    var self = this;

    this.$uibModal.open({
      templateUrl: templateModal.name,
      controller: require('app/productConfig/modalCtrl'),
      controllerAs: '$ctrl',
      size: 'lg give-modal',
      resolve: {
        productData: [designationsService.name, function(designationsService){
          return designationsService.productLookup(item.code).toPromise();
        }],
        itemConfig: function(){
          return item.config;
        }
      }
    }).result.then(function () {
      //remote old gift
      self.removeItem(item.uri);
    });
  }

}

export default angular
  .module(componentName, [
    template.name,
    appConfig.name,
    cartService.name
  ])
  .component(componentName, {
    controller: CartController,
    templateUrl: template.name
  });

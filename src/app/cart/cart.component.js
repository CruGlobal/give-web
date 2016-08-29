import 'babel/external-helpers';
import angular from 'angular';
import 'angular-bootstrap';

import appConfig from 'common/app.config';

import cartService from 'common/services/api/cart.service';
import designationsService from 'common/services/api/designations.service';
import modalController from 'app/productConfig/productConfig.modal';
import sessionService from 'common/services/session/session.service';
import commonModule from 'common/common.module';

import template from './cart.tpl';
import templateModal from 'app/productConfig/productConfigModal.tpl';

let componentName = 'cart';

class CartController{

  /* @ngInject */
  constructor($window, $uibModal, cartService, sessionService) {
    this.$window = $window;
    this.$uibModal = $uibModal;
    this.cartService = cartService;
    this.sessionService = sessionService;

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
      controller: modalController.name,
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

  checkout() {
    this.$window.location.href = this.sessionService.getRole() === 'REGISTERED' ? 'checkout.html' : 'sign-in.html';
  }

  donationStartDate(month, day) {
    return new Date(0, Number(month) - 1, Number(day));
  }
}

export default angular
  .module(componentName, [
    commonModule.name,
    'ui.bootstrap',
    modalController.name,
    template.name,
    templateModal.name,
    appConfig.name,
    cartService.name,
    designationsService.name,
    sessionService.name
  ])
  .component(componentName, {
    controller: CartController,
    templateUrl: template.name
  });

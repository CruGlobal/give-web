import angular from 'angular';
import commonModule from 'common/common.module';
import pull from 'lodash/pull';

import cartService from 'common/services/api/cart.service';
import sessionService from 'common/services/session/session.service';
import productModalService from 'common/services/productModal.service';
import desigSrcDirective from 'common/directives/desigSrc.directive';

import displayRateTotals from 'common/components/displayRateTotals/displayRateTotals.component';

import template from './cart.tpl';

let componentName = 'cart';

class CartController {

  /* @ngInject */
  constructor( $window, $log, cartService, sessionService, productModalService ) {
    this.$window = $window;
    this.$log = $log;
    this.productModalService = productModalService;
    this.cartService = cartService;
    this.sessionService = sessionService;
  }

  $onInit() {
    this.loadCart();
  }

  loadCart(reload) {
    delete this.error;
    if(reload){
      this.updating = true;
    }else{
      this.loading = true;
    }
    this.cartService.get()
      .subscribe( data => {
          this.cartData = data;
          this.loading = false;
          this.updating = false;
        },
        error => {
          this.$log.error('Error loading cart', error);
          this.loading = false;
          this.updating = false;
          this.error = {
            loading: !reload,
            updating: !!reload
          };
        });
  }

  removeItem( item ) {
    delete item.removingError;
    item.removing = true;
    this.cartService.deleteItem( item.uri )
      .subscribe( () => {
          pull(this.cartData.items, item);
          this.loadCart(true);
        },
        error => {
          this.$log.error('Error deleting item from cart', error);
          item.removingError = true;
          delete item.removing;
        });
  }

  editItem( item ) {
    this.productModalService
      .configureProduct( item.code, item.config, true, item.uri )
      .result
      .then( ( result ) => {
        if ( result.isUpdated ) {
          pull(this.cartData.items, item);
          this.loadCart(true);
        }
      } );
  }

  checkout() {
    this.$window.location = this.sessionService.getRole() === 'REGISTERED' ? '/checkout.html' : '/sign-in.html';
  }
}

export default angular
  .module(componentName, [
    template.name,
    commonModule.name,
    displayRateTotals.name,
    cartService.name,
    productModalService.name,
    sessionService.name,
    desigSrcDirective.name
  ] )
  .component( componentName, {
    controller:  CartController,
    templateUrl: template.name
  } );

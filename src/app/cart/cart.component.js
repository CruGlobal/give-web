import 'babel/external-helpers';
import angular from 'angular';
import appConfig from 'common/app.config';
import cartService from 'common/services/api/cart.service';
import sessionService from 'common/services/session/session.service';
import commonModule from 'common/common.module';
import productModalService from 'common/services/productModal.service';
import desigSrcDirective from 'common/directives/desigSrc.directive';

import loadingOverlayComponent from 'common/components/loadingOverlay/loadingOverlay.component';
import displayRateTotals from 'common/components/displayRateTotals/displayRateTotals.component';

import template from './cart.tpl';

let componentName = 'cart';

class CartController {

  /* @ngInject */
  constructor( $window, cartService, sessionService, productModalService ) {
    this.$window = $window;
    this.productModalService = productModalService;
    this.cartService = cartService;
    this.sessionService = sessionService;
  }

  $onInit() {
    this.loadCart();
  }

  loadCart() {
    this.loading = true;
    this.cartService.get()
      .subscribe( ( data ) => {
        this.cartData = data;
        this.loading = false;
      } );
  }

  removeItem( uri ) {
    this.cartData = null;

    this.cartService.deleteItem( atob( uri ) )
      .subscribe( () => {
        this.loadCart();
      } );
  }

  editItem( item ) {
    this.productModalService
      .configureProduct( item.code, item.config, true, item.uri )
      .result
      .then( ( result ) => {
        if ( result.isUpdated ) {
          this.loadCart();
        }
      } );
  }

  checkout() {
    this.$window.location.href = this.sessionService.getRole() === 'REGISTERED' ? 'checkout.html' : 'sign-in.html';
  }
}

export default angular
  .module(componentName, [
    template.name,
    commonModule.name,
    loadingOverlayComponent.name,
    displayRateTotals.name,
    appConfig.name,
    cartService.name,
    productModalService.name,
    sessionService.name,
    desigSrcDirective.name
  ] )
  .component( componentName, {
    controller:  CartController,
    templateUrl: template.name
  } );

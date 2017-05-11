import angular from 'angular';
import commonModule from 'common/common.module';
import pull from 'lodash/pull';

import cartService from 'common/services/api/cart.service';
import sessionService from 'common/services/session/session.service';
import productModalService from 'common/services/productModal.service';
import desigSrcDirective from 'common/directives/desigSrc.directive';

import displayRateTotals from 'common/components/displayRateTotals/displayRateTotals.component';
import {cartUpdatedEvent} from 'common/components/nav/navCart/navCart.component';

import analyticsFactory from 'app/analytics/analytics.factory';

import template from './cart.tpl.html';

let componentName = 'cart';

class CartController {

  /* @ngInject */
  constructor( $scope, $window, $log, analyticsFactory, cartService, sessionService, productModalService ) {
    this.$scope = $scope;
    this.$window = $window;
    this.$log = $log;
    this.productModalService = productModalService;
    this.cartService = cartService;
    this.sessionService = sessionService;
    this.analyticsFactory = analyticsFactory;
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

          this.analyticsFactory.pageLoaded();
          this.analyticsFactory.buildProductVar(data);
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
          this.$scope.$emit( cartUpdatedEvent );
          this.analyticsFactory.cartRemove(item.designationNumber);
        },
        error => {
          this.$log.error('Error deleting item from cart', error);
          item.removingError = true;
          delete item.removing;
        });
  }

  editItem( item ) {
    const modal = this.productModalService
      .configureProduct( item.code, item.config, true, item.uri );
    modal && modal.result
      .then( () => {
        pull(this.cartData.items, item);
        this.loadCart(true);
      }, angular.noop );
  }

  checkout() {
    this.$window.location = this.sessionService.getRole() === 'REGISTERED' ? '/checkout.html' : '/sign-in.html';
  }
}

export default angular
  .module(componentName, [
    commonModule.name,
    displayRateTotals.name,
    cartService.name,
    productModalService.name,
    sessionService.name,
    desigSrcDirective.name,
    analyticsFactory.name
  ] )
  .component( componentName, {
    controller:  CartController,
    templateUrl: template
  } );

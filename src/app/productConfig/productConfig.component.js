import angular from 'angular';
import 'angular-messages';
import template from './productConfig.tpl';
import commonModule from 'common/common.module';
import productModalService from 'common/services/productModal.service';
import modalStateService from 'common/services/modalState.service';
import {giveGiftParams} from 'app/productConfig/productConfig.modal';

let componentName = 'productConfig';

class ProductConfigController {

  /* @ngInject */
  constructor( productModalService, $window ) {
    this.productModalService = productModalService;
    this.$window = $window;
  }

  $onInit() {
    this.loadingModal = false;
  }

  configModal() {
    this.loadingModal = true;
    let modalInstance = this.productModalService
      .configureProduct( this.productCode, {amount: 50}, false );
    modalInstance.rendered.then( () => {
      this.loadingModal = false;
    } );
    modalInstance.result.then( () => {
      this.$window.location.href = '/cart.html';
    } );
  }
}

export default angular
  .module( componentName, [
    commonModule.name,
    'ngMessages',
    modalStateService.name,
    productModalService.name,
    template.name
  ] )
  .component( componentName, {
    controller:  ProductConfigController,
    templateUrl: template.name,
    bindings:    {
      productCode: '@',
      buttonLabel: '@',
      buttonSize: '@'
    }
  } )
  // todo: Move config to designation page (individual search result).
  .config( function ( modalStateServiceProvider ) {
    modalStateServiceProvider.registerModal(
      'give-gift',
      /*@ngInject*/
      function ( $location, productModalService ) {
        let params = $location.search();
        if ( params.hasOwnProperty( giveGiftParams.designation ) ) {
          productModalService.configureProduct( params[giveGiftParams.designation], {amount: 50}, false );
        }
      } );
  } );

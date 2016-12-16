import angular from 'angular';
import 'angular-messages';
import template from './productConfig.tpl';
import commonModule from 'common/common.module';
import productModalService from 'common/services/productModal.service';
import modalStateService from 'common/services/modalState.service';
import {giveGiftParams} from './productConfigModal/productConfig.modal.component';

//include designation edit button component to be included on designation page
import designationEditButtonComponent from '../designationEditButton/designationEditButton.component';

const componentName = 'productConfig';

class ProductConfigController {

  /* @ngInject */
  constructor( productModalService, $window, $log ) {
    this.productModalService = productModalService;
    this.$window = $window;
    this.$log = $log;
  }

  $onInit() {
    this.loadingModal = false;
  }

  configModal() {
    this.loadingModal = true;
    this.error = false;
    let modalInstance = this.productModalService
      .configureProduct( this.productCode, {amount: 50, 'campaign-code': this.campaignCode}, false );
    modalInstance.rendered.then( () => {
      this.loadingModal = false;
    } );
    modalInstance.result.then( () => {
        this.$window.location = '/cart.html';
      },
      reason => {
        if(reason && reason !== 'backdrop click'){ // Avoid labeling normal closes or backdrop clicks as errors
          this.$log.error('Error opening product config modal', reason);
          this.error = true;
        }
        this.loadingModal = false;
      });
  }
}

export default angular
  .module( componentName, [
    commonModule.name,
    'ngMessages',
    modalStateService.name,
    productModalService.name,
    designationEditButtonComponent.name,
    template.name
  ] )
  .component( componentName, {
    controller:  ProductConfigController,
    templateUrl: template.name,
    bindings:    {
      campaignCode: '@',
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

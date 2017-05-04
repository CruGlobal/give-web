import angular from 'angular';
import 'angular-messages';
import template from './productConfig.tpl.html';
import commonModule from 'common/common.module';
import productModalService from 'common/services/productModal.service';
import modalStateService from 'common/services/modalState.service';
import {giveGiftParams} from './productConfigModal/productConfig.modal.component';
import analyticsFactory from 'app/analytics/analytics.factory';

//include designation edit button component to be included on designation page
import designationEditButtonComponent from '../designationEditButton/designationEditButton.component';

const componentName = 'productConfig';

class ProductConfigController {

  /* @ngInject */
  constructor( productModalService, analyticsFactory, $window, $log ) {
    this.productModalService = productModalService;
    this.analyticsFactory = analyticsFactory;
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
      .configureProduct( this.productCode, {
        'campaign-code': this.campaignCode,
        'campaign-page': this.campaignPage
      }, false );
    if(!modalInstance){
      // Another modal already opened
      this.loadingModal = false;
      return;
    }
    modalInstance.rendered.then( () => {
      this.loadingModal = false;
      this.analyticsFactory.giveGiftModal(this.productCode);
    }, angular.noop );
    modalInstance.result.then( () => {
        this.$window.location = '/cart.html';
      },
      reason => {
        if(reason && reason !== 'escape key press' && reason !== 'backdrop click'){ // Avoid labeling normal closes, escape key, or backdrop clicks as errors
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
    analyticsFactory.name
  ] )
  .component( componentName, {
    controller:  ProductConfigController,
    templateUrl: template,
    bindings:    {
      campaignCode: '@',
      campaignPage: '@',
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
          productModalService.configureProduct( params[giveGiftParams.designation], null, false );
        }
      } );
  } );

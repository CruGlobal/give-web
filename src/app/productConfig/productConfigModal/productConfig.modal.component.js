import angular from 'angular';
import isArray from 'lodash/isArray';

import productConfigForm from '../productConfigForm/productConfigForm.component';
import { giveGiftParams } from '../giveGiftParams';
import modalStateService from 'common/services/modalState.service';
import { mobileBreakpoint } from 'common/app.constants';

import template from './productConfig.modal.tpl.html';

const componentName = 'productConfigModal';

class ProductConfigModalController {

  /* @ngInject */
  constructor( $window, $location, modalStateService ) {
    this.$window = $window;
    this.$location = $location;
    this.modalStateService = modalStateService;
  }

  $onInit(){
    this.initModalData();
    this.initializeParams();

    this.isMobile = this.$window.innerWidth <= mobileBreakpoint;
  }

  $onDestroy(){
    // Clear the modal name and params when the modal closes
    this.modalStateService.name( null );
    angular.forEach( giveGiftParams, ( value ) => {
      // Remove all query params except CampaignCode
      if( value !== giveGiftParams.campaignCode ) {
        this.$location.search(value, null);
      }
    } );
  }

  initModalData() {
    this.code = this.resolve.code;
    this.itemConfig = this.resolve.itemConfig || {};
    this.isEdit = !!this.resolve.isEdit;
    this.uri =  this.resolve.uri;
  }

  initializeParams() {
    if(this.isEdit){
      return;
    }

    // Add query params for current modal
    this.modalStateService.name( 'give-gift' );
    this.updateQueryParam( giveGiftParams.designation, this.code );
    if(this.itemConfig['campaign-page']){
      this.updateQueryParam( giveGiftParams.campaignPage, this.itemConfig['campaign-page'] );
    }

    // Load query params to populate itemConfig
    let params = this.$location.search();

    this.itemConfig.amount = params[giveGiftParams.amount];

    if ( params.hasOwnProperty( giveGiftParams.frequency ) ) {
      this.defaultFrequency = params[giveGiftParams.frequency];
    }

    if ( params.hasOwnProperty( giveGiftParams.day ) ) {
      this.itemConfig['recurring-day-of-month'] = params[giveGiftParams.day];
    }

    if ( params.hasOwnProperty( giveGiftParams.month ) ) {
      this.itemConfig['recurring-start-month'] = params[giveGiftParams.month];
    }

    // If CampaignCode exists in URL, use it, otherwise use default-campaign-code if set.
    if ( params.hasOwnProperty( giveGiftParams.campaignCode ) ) {
      this.itemConfig['campaign-code'] = isArray(params[giveGiftParams.campaignCode]) ?
        params[giveGiftParams.campaignCode][0] : params[giveGiftParams.campaignCode];

      //make sure campaign code is alphanumeric
      if(this.itemConfig['campaign-code'].match(/^[a-z0-9]+$/i) === null){
        this.itemConfig['campaign-code'] = '';
      }
    }
    else if(this.itemConfig.hasOwnProperty('default-campaign-code')) {
      this.itemConfig['campaign-code'] = this.itemConfig['default-campaign-code'];
    }

    if ( params.hasOwnProperty( giveGiftParams.campaignPage ) && params[giveGiftParams.campaignPage] !== '' ) {
      this.itemConfig['campaign-page'] = params[giveGiftParams.campaignPage];
    }
  }

  updateQueryParam(param, value){
    if ( !this.isEdit ) this.$location.search( param, value );
  }

  onStateChange(state){
    this.state = state;
    this.submitted = false;
    switch(state){
      case 'submitted':
        this.close();

        if(this.isMobile && !this.isEdit){
          this.$window.location = '/cart.html';
        }
        break;
    }
  }
}

export default angular
  .module( componentName, [
    'ordinal',
    productConfigForm.name,
    modalStateService.name
  ] )
  .component( componentName, {
    controller:  ProductConfigModalController,
    templateUrl: template,
    bindings:    {
      resolve: '<',
      close: '&',
      dismiss: '&'
    }
  } );

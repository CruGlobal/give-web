import angular from 'angular';
import 'angular-ordinal';

import indexOf from 'lodash/indexOf';
import find from 'lodash/find';
import omit from 'lodash/omit';
import map from 'lodash/map';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';

import designationsService from 'common/services/api/designations.service';
import cartService from 'common/services/api/cart.service';
import modalStateService from 'common/services/modalState.service';
import { possibleTransactionDays, startDate } from 'common/services/giftHelpers/giftDates.service';
import desigSrcDirective from 'common/directives/desigSrc.directive';
import showErrors from 'common/filters/showErrors.filter';
import { giftAddedEvent, cartUpdatedEvent } from 'common/components/nav/navCart/navCart.component';
import analyticsFactory from 'app/analytics/analytics.factory';

import template from './productConfig.modal.tpl.html';

const componentName = 'productConfigModal';

export const giveGiftParams = {
  designation:  'd',
  campaignPage: 'c',
  amount:       '$',
  frequency:    'f',
  day:          'dd',
  campaignCode: 'CampaignCode'
};

class ProductConfigModalController {

  /* @ngInject */
  constructor( $window, $location, $scope, $log, designationsService, cartService, modalStateService, analyticsFactory ) {
    this.$window = $window;
    this.$location = $location;
    this.$scope = $scope;
    this.$log = $log;
    this.designationsService = designationsService;
    this.cartService = cartService;
    this.modalStateService = modalStateService;
    this.possibleTransactionDays = possibleTransactionDays;
    this.startDate = startDate;
    this.analyticsFactory = analyticsFactory;

    this.selectableAmounts = [50, 100, 250, 500, 1000, 5000];
  }

  $onInit(){
    this.initModalData();
    this.initializeParams();
    this.setDefaultAmount();
    this.waitForFormInitialization();
  }

  initModalData() {
    this.productData = this.resolve.productData;
    this.itemConfig = this.resolve.itemConfig;
    this.isEdit = this.resolve.isEdit;
    this.uri =  this.resolve.uri;
    this.suggestedAmounts =  this.resolve.suggestedAmounts;
    this.nextDrawDate = this.resolve.nextDrawDate;

    if(!this.itemConfig['recurring-day-of-month'] && this.nextDrawDate) {
      this.itemConfig['recurring-day-of-month'] = startDate(null, this.nextDrawDate).format('DD');
    }

    this.showRecipientComments = !!this.itemConfig['recipient-comments'];
    this.showDSComments = !!this.itemConfig['donation-services-comments'];

    this.useSuggestedAmounts = !isEmpty(this.suggestedAmounts);
  }

  initializeParams() {
    if(this.isEdit){
      return;
    }

    let params = this.$location.search();

    this.modalStateService.name( 'give-gift' );
    this.$location.search( giveGiftParams.designation, this.productData.code );
    this.$location.search( giveGiftParams.campaignPage, this.itemConfig['campaign-page'] );

    let amount = parseInt( params[giveGiftParams.amount], 10 );
    if ( !isNaN( amount ) ) {
      this.itemConfig.amount = amount;
    }

    if ( params.hasOwnProperty( giveGiftParams.frequency ) ) {
      let frequency = find( this.productData.frequencies, ['name', params[giveGiftParams.frequency]] );
      if ( frequency ) {
        if ( angular.isDefined( frequency.selectAction ) ) {
          this.changeFrequency( frequency );
        }
      }
    }

    if ( params.hasOwnProperty( giveGiftParams.day ) ) {
      this.itemConfig['recurring-day-of-month'] = params[giveGiftParams.day];
    }

    // If CampaignCode exists in URL, use it, otherwise use default-campaign-code if set.
    if ( params.hasOwnProperty( giveGiftParams.campaignCode ) ) {
      this.itemConfig['campaign-code'] = params[giveGiftParams.campaignCode];
    }
    else if(this.itemConfig.hasOwnProperty('default-campaign-code')) {
      this.itemConfig['campaign-code'] = this.itemConfig['default-campaign-code'];
    }
  }

  setDefaultAmount(){
    const amountOptions = isEmpty(this.suggestedAmounts) ?
      this.selectableAmounts :
      map(this.suggestedAmounts, 'amount');

    if(this.itemConfig.amount){
      if(amountOptions.indexOf(this.itemConfig.amount) === -1){
        this.changeCustomAmount(this.itemConfig.amount);
      }
    }else{
      this.itemConfig.amount = amountOptions[0];
    }
  }

  waitForFormInitialization() {
    let unregister = this.$scope.$watch('$ctrl.itemConfigForm.amount', () => {
      if(this.itemConfigForm && this.itemConfigForm.amount) {
        unregister();
        this.addCustomValidators();
      }
    });
  }

  addCustomValidators() {
    this.itemConfigForm.amount.$validators.minimum = value => {
      return !this.customInputActive || value*1.0 >= 1;
    };
    this.itemConfigForm.amount.$validators.maximum = value => {
      return !this.customInputActive || value*1.0 < 10000000;
    };
    this.itemConfigForm.amount.$validators.pattern = value => {
      const regex = /^([0-9]*)(\.[0-9]{1,2})?$/;
      return !this.customInputActive || regex.test(value);
    };
  }

  updateQueryParam(param, value){
    if ( !this.isEdit ) this.$location.search( param, value );
  }

  frequencyOrder( f ) {
    let order = ['NA', 'MON', 'QUARTERLY', 'ANNUAL'];
    return indexOf( order, f.name );
  }

  changeFrequency( product ) {
    this.errorAlreadyInCart = false;
    this.changingFrequency = true;
    this.errorChangingFrequency = false;
    const lastFrequency = this.productData.frequency;
    this.productData.frequency = product.name;
    this.updateQueryParam( giveGiftParams.frequency, product.name );
    if(product.selectAction) {
      this.designationsService.productLookup(product.selectAction, true)
        .subscribe(data => {
            this.itemConfigForm.$setDirty();
            this.productData = data;
            this.changingFrequency = false;
          },
          error => {
            this.$log.error('Error loading new product when changing frequency', error);
            this.errorChangingFrequency = true;
            this.productData.frequency = lastFrequency;
            this.updateQueryParam( giveGiftParams.frequency, lastFrequency);
            this.changingFrequency = false;
          });
    }
  }

  changeAmount( amount ) {
    this.itemConfigForm.$setDirty();
    this.itemConfig.amount = amount;
    this.customAmount = '';
    this.customInputActive = false;
    this.updateQueryParam( giveGiftParams.amount, amount );
  }

  changeCustomAmount( amount ) {
    this.itemConfig.amount = amount;
    this.customAmount = amount;
    this.customInputActive = true;
    this.updateQueryParam( giveGiftParams.amount, amount );
  }

  changeStartDay( day ) {
    this.errorAlreadyInCart = false;
    this.updateQueryParam( giveGiftParams.day, day );
  }

  saveGiftToCart() {
    this.submittingGift = false;
    this.errorAlreadyInCart = false;
    this.errorSavingGeneric = false;
    if ( !this.itemConfigForm.$valid ) {
      return;
    }
    this.submittingGift = true;

    let data = this.productData.frequency === 'NA' ? omit( this.itemConfig, 'recurring-day-of-month' ) : this.itemConfig;

    let savingObservable = this.isEdit ?
      this.cartService.editItem( this.uri, this.productData.uri, data ) :
      this.cartService.addItem( this.productData.uri, data );

    savingObservable.subscribe( () => {
      if ( this.isEdit ) {
        this.$scope.$emit( cartUpdatedEvent );
        this.close();
      } else {
        this.$scope.$emit( giftAddedEvent );
        this.dismiss();
        this.analyticsFactory.cartAdd(this.itemConfig, this.productData, 'cart modal');
      }
      this.submittingGift = false;
    }, error => {
      if(includes(error.data, 'already in the cart')){
        this.errorAlreadyInCart = true;
      }else{
        this.errorSavingGeneric = true;
        this.$log.error('Error adding or updating item in cart', error);
      }
      this.submittingGift = false;
    } );
  }

  displayName() {
    return this.productData.displayName === this.itemConfig['jcr-title'] ?
      this.productData.displayName : this.itemConfig['jcr-title'];
  }

  displayId() {
    let value = `#${this.productData.designationNumber}`;
    if(this.itemConfig['jcr-title'] && this.productData.displayName !== this.itemConfig['jcr-title']) {
      value += ` - ${this.productData.displayName}`;
    }
    return value;
  }
}

export default angular
  .module( componentName, [
    'ordinal',
    designationsService.name,
    cartService.name,
    modalStateService.name,
    desigSrcDirective.name,
    showErrors.name,
    analyticsFactory.name
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

import angular from 'angular';
import 'angular-ordinal';

import indexOf from 'lodash/indexOf';
import find from 'lodash/find';
import omit from 'lodash/omit';
import map from 'lodash/map';
import includes from 'lodash/includes';

import designationsService from 'common/services/api/designations.service';
import cartService from 'common/services/api/cart.service';
import modalStateService from 'common/services/modalState.service';
import {possibleTransactionDays, startDate} from 'common/services/giftHelpers/giftDates.service';
import desigSrcDirective from 'common/directives/desigSrc.directive';
import showErrors from 'common/filters/showErrors.filter';
import { giftAddedEvent, cartUpdatedEvent } from 'common/components/nav/navCart/navCart.component';
import analyticsFactory from 'app/analytics/analytics.factory';

import template from './productConfig.modal.tpl';

const componentName = 'productConfigModal';

export const giveGiftParams = {
  designation: 'd',
  campaignPage: 'c',
  amount:      '$',
  frequency:   'f',
  day:         'dd'
};

class ProductConfigModalController {

  /* @ngInject */
  constructor( $location, $scope, $log, designationsService, cartService, modalStateService, analyticsFactory ) {
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
    this.productData = this.resolve.productData;
    this.itemConfig = this.resolve.itemConfig;
    this.isEdit = this.resolve.isEdit;
    this.uri =  this.resolve.uri;
    this.suggestedAmounts =  this.resolve.suggestedAmounts;
    this.nextDrawDate = this.resolve.nextDrawDate;

    !this.isEdit && this.initializeParams();

    if( this.suggestedAmounts.length > 0 ) {
      this.customInputActive = true;
      this.customAmount = (map(this.suggestedAmounts, 'amount').indexOf(this.itemConfig.amount) === -1) ?
        this.suggestedAmounts[0].amount : this.itemConfig.amount;
      this.changeCustomAmount(this.customAmount);
    } else {
      if ( this.selectableAmounts.indexOf( this.itemConfig.amount ) === -1 ) {
        this.customAmount = this.itemConfig.amount;
        this.customInputActive = true;
      }
    }

    if(!this.itemConfig['recurring-day-of-month'] && this.nextDrawDate) {
      this.itemConfig['recurring-day-of-month'] = startDate(null, this.nextDrawDate).format('DD');
    }

    this.addedCustomValidators = false;
    this.showRecipientComments = false;
    this.showDSComments = false;
  }

  waitForFormInitialization() {
    let unregister = this.$scope.$watch(()=>this.itemConfigForm, () => {
      if(this.itemConfigForm) {
        unregister();
        this.addCustomValidators();
      }
    });
  }

  addCustomValidators() {
    this.itemConfigForm.amount.$validators.minimum = value => {
      return this.customInputActive ? (value*1.0 >= 1) : true;
    };
    this.itemConfigForm.amount.$validators.maximum = value => {
      return this.customInputActive ? (value*1.0 < 10000000) : true;
    };
    this.itemConfigForm.amount.$validators.pattern = value => {
      var regex = /^([0-9]*)(\.[0-9]{1,2})?$/;
      return this.customInputActive ? (regex.test(value)) : true;
    };
  }

  initializeParams() {
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
  }

  showDefaultAmounts() {
    if(this.suggestedAmounts.length === 0) {
      if(!this.addedCustomValidators) {
        this.waitForFormInitialization();
        this.addedCustomValidators = true;
      }
      return true;
    }
    return false;
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
    if ( !this.isEdit ) this.$location.search( giveGiftParams.frequency, product.name );
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
            if (!this.isEdit) this.$location.search(giveGiftParams.frequency, lastFrequency);
            this.changingFrequency = false;
          });
    }
  }

  changeAmount( amount ) {
    this.itemConfigForm.$setDirty();
    this.itemConfig.amount = amount;
    this.customAmount = '';
    if ( !this.isEdit ) this.$location.search( giveGiftParams.amount, amount );
    this.customInputActive = false;
  }

  changeCustomAmount( amount ) {
    this.itemConfig.amount = amount;
    if ( !this.isEdit ) this.$location.search( giveGiftParams.amount, amount );
  }

  changeStartDay( day ) {
    this.errorAlreadyInCart = false;
    if ( !this.isEdit ) this.$location.search( giveGiftParams.day, day );
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
}

export default angular
  .module( componentName, [
    template.name,
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
    templateUrl: template.name,
    bindings:    {
      resolve: '<',
      close: '&',
      dismiss: '&'
    }
  } );

import angular from 'angular';
import 'angular-gettext';
import 'angular-ordinal';

import indexOf from 'lodash/indexOf';
import find from 'lodash/find';
import omit from 'lodash/omit';
import map from 'lodash/map';

import designationsService from 'common/services/api/designations.service';
import cartService from 'common/services/api/cart.service';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';
import modalStateService from 'common/services/modalState.service';
import {possibleTransactionDays, startDate} from 'common/services/giftHelpers/giftDates.service';
import desigSrcDirective from 'common/directives/desigSrc.directive';
import showErrors from 'common/filters/showErrors.filter';

let controllerName = 'productConfigController';
export let giveGiftParams = {
  designation: 'd',
  amount:      '$',
  frequency:   'f',
  day:         'dd'
};

export let giftAddedEvent = 'giftAddedToCart';

class ModalInstanceCtrl {

  /* @ngInject */
  constructor( $location, $scope, $log, $uibModalInstance, designationsService, cartService, modalStateService, gettext, productData, nextDrawDate, suggestedAmounts, itemConfig, isEdit, uri ) {
    this.$location = $location;
    this.$scope = $scope;
    this.$log = $log;
    this.gettext = gettext;
    this.$uibModalInstance = $uibModalInstance;
    this.designationsService = designationsService;
    this.cartService = cartService;
    this.modalStateService = modalStateService;
    this.possibleTransactionDays = possibleTransactionDays;
    this.startDate = startDate;

    this.productData = productData;
    this.nextDrawDate = nextDrawDate;
    this.itemConfig = itemConfig;
    this.isEdit = isEdit;
    this.uri = uri;
    this.suggestedAmounts = suggestedAmounts;
    this.selectableAmounts = [50, 100, 250, 500, 1000, 5000];
  }

  $onInit() {
    if ( this.isEdit ) {
      this.submitLabel = this.gettext( 'Update Gift' );
    } else {
      this.submitLabel = this.gettext( 'Add to Gift Cart' );
      this.initializeParams();
    }

    if( this.suggestedAmounts.length > 0 ) {
      this.customInputActive = true;
      this.customAmount = (map(this.suggestedAmounts, 'amount').indexOf(this.itemConfig.amount) === -1) ?
        this.suggestedAmounts[0].amount : this.itemConfig.amount;
      this.changeCustomAmount(this.customAmount);
    }
    else {
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
    this.designationsService.productLookup( product.selectAction, true ).subscribe( ( data ) => {
      this.itemConfigForm.$setDirty();
      this.productData = data;
    } );
    this.productData.frequency = product.name;
    if ( !this.isEdit ) this.$location.search( giveGiftParams.frequency, product.name );

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
    if ( !this.isEdit ) this.$location.search( giveGiftParams.day, day );
  }

  saveGiftToCart() {
    this.submittingGift = false;
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
        this.$uibModalInstance.close( {isUpdated: true} );
      } else {
        this.$scope.$emit( giftAddedEvent, {uri: this.productData.uri, data: data} );
        this.$uibModalInstance.dismiss();
      }
      this.submittingGift = false;
    }, (error) => {
      this.error = error.data;
      this.submittingGift = false;
      this.$log.error('Error adding or updating item in cart', error);
    } );
  }
}

export default angular
  .module( controllerName, [
    'gettext',
    'ordinal',
    loadingOverlay.name,
    designationsService.name,
    cartService.name,
    modalStateService.name,
    desigSrcDirective.name,
    showErrors.name
  ] )
  .controller( controllerName, ModalInstanceCtrl );

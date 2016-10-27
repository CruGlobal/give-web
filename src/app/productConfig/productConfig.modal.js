import angular from 'angular';
import 'angular-gettext';
import 'angular-ordinal';

import indexOf from 'lodash/indexOf';
import find from 'lodash/find';
import omit from 'lodash/omit';

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

class ModalInstanceCtrl {

  /* @ngInject */
  constructor( $location, $scope, $uibModalInstance, designationsService, cartService, modalStateService, gettext, productData, nextDrawDate, itemConfig, isEdit, uri ) {
    this.$location = $location;
    this.$scope = $scope;
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
    this.selectableAmounts = [50, 100, 250, 500, 1000, 5000];

    if ( this.isEdit ) {
      this.submitLabel = gettext( 'Update Gift' );
    } else {
      this.submitLabel = gettext( 'Add to Gift Cart' );
      this.initializeParams();
    }

    if ( this.selectableAmounts.indexOf( this.itemConfig.amount ) === -1 ) {
      this.customAmount = this.itemConfig.amount;
      this.customInputActive = true;
    }

    if(!this.itemConfig['recurring-day-of-month'] && nextDrawDate) {
      this.itemConfig['recurring-day-of-month'] = Number(nextDrawDate.split('-')[2]).toString();
    }
  }

  $onInit() {
    this.waitForFormInitialization();
  }

  waitForFormInitialization() {
    let unregister = this.$scope.$watch('$ctrl.itemConfigForm', () => {
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

  addToCart() {
    this.giftSubmitted = false;
    this.submittingGift = false;
    if ( !this.itemConfigForm.$valid ) {
      return;
    }
    this.submittingGift = true;
    this.cartService
      .addItem( this.productData.id, this.productData.frequency === 'NA' ? omit(this.itemConfig, 'recurring-day-of-month') : this.itemConfig )
      .subscribe( () => {
        if ( this.isEdit ) {
          this.$uibModalInstance.close( {isUpdated: true} );
        } else {
          this.giftSubmitted = true;
        }
        this.submittingGift = false;
<<<<<<< HEAD
=======
        this.giftSubmitted = true;
>>>>>>> 53ab1503f001f53e8d39b16cee4f3b29cb3bc261
      }, (error) => {
        this.error = error.data;
        this.submittingGift = false;
      } );
  }

  updateGift() {
    this.submittingGift = true;
    if ( !this.itemConfigForm.$valid ) {
      return;
    }
    if (!this.itemConfigForm.$dirty ) {
      this.$uibModalInstance.close( {isUpdated: false} );
      return;
    }
    this.cartService.deleteItem( atob( this.uri ) )
      .subscribe( () => {
        this.addToCart();
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

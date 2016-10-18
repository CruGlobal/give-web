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
import giftDatesService from 'common/services/giftHelpers/giftDates.service';
import desigSrcDirective from 'common/directives/desigSrc.directive';

let controllerName = 'productConfigController';
export let giveGiftParams = {
  designation: 'd',
  amount:      '$',
  frequency:   'f',
  day:         'dd'
};

class ModalInstanceCtrl {

  /* @ngInject */
  constructor( $location, $uibModalInstance, designationsService, cartService, modalStateService, giftDatesService, gettext, productData, nextDrawDate, itemConfig, isEdit ) {
    this.$location = $location;
    this.$uibModalInstance = $uibModalInstance;
    this.designationsService = designationsService;
    this.cartService = cartService;
    this.modalStateService = modalStateService;
    this.giftDatesService = giftDatesService;
    this.productData = productData;
    this.nextDrawDate = nextDrawDate;
    this.itemConfig = itemConfig;
    this.isEdit = isEdit;
    this.selectableAmounts = [50, 100, 250, 500, 1000, 5000];

    if ( this.isEdit ) {
      this.submitLabel = gettext( 'Update Gift' );
    } else {
      this.submitLabel = gettext( 'Add to Gift Cart' );
      this.initializeParams();
    }

    if ( this.selectableAmounts.indexOf( this.itemConfig.amount ) === -1 ) {
      this.customAmount = this.itemConfig.amount;
    }

    if(!this.itemConfig['recurring-day-of-month'] && nextDrawDate) {
      this.itemConfig['recurring-day-of-month'] = Number(nextDrawDate.split('-')[2]).toString();
    }
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
    this.customAmount = undefined;
    this.itemConfigForm.amount.$setViewValue( undefined, 'change' );
    this.itemConfigForm.amount.$render();
    if ( !this.isEdit ) this.$location.search( giveGiftParams.amount, amount );
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
    if ( this.isEdit && !this.itemConfigForm.$dirty ) {
      this.$uibModalInstance.close( {isUpdated: false} );
      return;
    }
    this.submittingGift = true;
    this.cartService
      .addItem( this.productData.id, this.productData.frequency === 'NA' ? omit(this.itemConfig, 'recurring-day-of-month') : this.itemConfig )
      .subscribe( () => {
        if ( this.isEdit ) {
          this.$uibModalInstance.close( {isUpdated: true} );
        }
        this.submittingGift = false;
        this.giftSubmitted = true;
      }, () => {
        this.submittingGift = false;
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
    giftDatesService.name,
    desigSrcDirective.name
  ] )
  .controller( controllerName, ModalInstanceCtrl );

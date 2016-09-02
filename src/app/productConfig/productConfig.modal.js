import angular from 'angular';

import indexOf from 'lodash/indexOf';
import range from 'lodash/range';
import find from 'lodash/find';

import designationsService from 'common/services/api/designations.service';
import cartService from 'common/services/api/cart.service';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';

let controllerName = 'productConfigController';
export let giveGiftParams = {
  designation: 'd',
  amount:      '$',
  frequency:   'f',
  month:       'mm',
  day:         'dd'
};

class ModalInstanceCtrl {

  /* @ngInject */
  constructor( $location, $uibModalInstance, designationsService, cartService, productData, itemConfig, removingItem ) {
    this.$location = $location;
    this.$uibModalInstance = $uibModalInstance;
    this.designationsService = designationsService;
    this.cartService = cartService;
    this.productData = productData;
    this.itemConfig = itemConfig;
    this.removingItem = removingItem;
    this.selectableAmounts = [50, 100, 250, 500, 1000, 5000];

    if ( !this.removingItem ) this.initializeParams();

    if ( this.selectableAmounts.indexOf( this.itemConfig.amount ) === -1 ) {
      this.customAmount = this.itemConfig.amount;
    }
  }

  initializeParams() {
    let params = this.$location.search();

    this.$location.hash( 'give-gift' );
    this.$location.search( giveGiftParams.designation, this.productData.code );

    let amount = parseInt( params[giveGiftParams.amount], 10 );
    if ( !Number.isNaN( amount ) ) {
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

    if ( params.hasOwnProperty( giveGiftParams.month ) ) {
      this.itemConfig['start-month'] = params[giveGiftParams.month];
    }

    if ( params.hasOwnProperty( giveGiftParams.day ) ) {
      this.itemConfig['start-day'] = params[giveGiftParams.day];
    }

  }

  frequencyOrder( f ) {
    let order = ['NA', 'MON', 'QUARTERLY', 'ANNUAL'];
    return indexOf( order, f.name );
  }

  changeFrequency( product ) {
    this.designationsService.productLookup( product.selectAction, true ).subscribe( ( data ) => {
      this.productData = data;
    } );
    this.productData.frequency = product.name;
    if ( !this.removingItem ) this.$location.search( giveGiftParams.frequency, product.name );
  }

  changeAmount( amount ) {
    this.itemConfig.amount = amount;
    this.customAmount = '';
    if ( !this.removingItem ) this.$location.search( giveGiftParams.amount, amount );
  }

  changeCustomAmount( amount ) {
    this.itemConfig.amount = amount;
    if ( !this.removingItem ) this.$location.search( giveGiftParams.amount, amount );
  }

  changeStartMonth( month ) {
    if ( !this.removingItem ) this.$location.search( giveGiftParams.month, month );
  }

  changeStartDay( day ) {
    if ( !this.removingItem ) this.$location.search( giveGiftParams.day, day );
  }

  addToCart() {
    if ( !this.itemConfigForm.$valid ) {
      return;
    }
    this.submittingGift = true;
    this.giftSubmitted = false;

    this.cartService.addItem( this.productData.id, this.itemConfig )
      .subscribe( () => {
        if ( this.removingItem ) {
          this.$uibModalInstance.close();
        } else {
          this.submittingGift = false;
          this.giftSubmitted = true;
        }
      }, () => {
        this.submittingGift = false;
      } );
  }

  daysInMonth( month ) {
    var daysInMonth = new Date( 2001, month, 0 ).getDate();
    return range( 1, daysInMonth + 1 ).map( function ( n ) {
      return n.toString();
    } );
  }
}

export default angular
  .module( controllerName, [
    loadingOverlay.name,
    designationsService.name,
    cartService.name
  ] )
  .controller( controllerName, ModalInstanceCtrl );

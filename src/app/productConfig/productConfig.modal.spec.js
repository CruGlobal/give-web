import angular from 'angular';
import 'angular-mocks';
import module from './productConfig.modal';
import {giveGiftParams} from './productConfig.modal';

describe( 'product config modal', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl, uibModalInstance, productData, itemConfig, $location;

  beforeEach( inject( function ( _$controller_, _$location_ ) {
    $location = _$location_;
    uibModalInstance = jasmine.createSpyObj( 'uibModalInstance', ['close', 'dismiss'] );
    productData = {};
    itemConfig = {
      amount: 85
    };
    spyOn( $location, 'search' ).and.returnValue( {
      [giveGiftParams.designation]: '0123456',
      [giveGiftParams.amount]:      '150',
      [giveGiftParams.frequency]:   'QUARTERLY',
      [giveGiftParams.month]:       '09',
      [giveGiftParams.day]:         '21'
    } );
    spyOn( $location, 'hash' );
    $ctrl = _$controller_( module.name, {
      $uibModalInstance: uibModalInstance,
      productData:       productData,
      itemConfig:        itemConfig,
      isEdit:            false
    } );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
    expect( $ctrl.selectableAmounts ).toEqual( [50, 100, 250, 500, 1000, 5000] );
    expect( $ctrl.submitLabel ).toEqual( 'Add to Gift Cart' );
  } );

  describe( 'initializeParams', () => {
    beforeEach( () => {
      spyOn( $ctrl, 'changeFrequency' );
      $ctrl.productData.frequencies = [
        {name: 'NA', selectAction: ''},
        {name: 'MON', selectAction: ''},
        {name: 'QUARTERLY', selectAction: ''}];
    } );
    it( 'sets values from query params', () => {
      $ctrl.initializeParams();
      expect( $location.hash ).toHaveBeenCalledWith( 'give-gift' );
      expect( $location.search ).toHaveBeenCalled();
      expect( $ctrl.itemConfig.amount ).toEqual( 150 );
      expect( $ctrl.customAmount ).toEqual( 150 );
      expect( $ctrl.changeFrequency ).toHaveBeenCalled();
      expect( $ctrl.itemConfig['start-month'] ).toEqual( '09' );
      expect( $ctrl.itemConfig['start-day'] ).toEqual( '21' );
    } );
  } );

  it( 'should change amount', function () {
    $ctrl.changeAmount( 5000 );
    expect( $ctrl.itemConfig.amount ).toEqual( 5000 );
  } );

  it( 'should show loading overlay', function () {
    $ctrl.itemConfigForm = {
      $valid: true
    };
    $ctrl.addToCart();
    expect( $ctrl.submittingGift ).toEqual( true );
  } );
} );

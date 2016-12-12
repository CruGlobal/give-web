import angular from 'angular';
import 'angular-mocks';
import module from './productConfig.modal';
import {giftAddedEvent, cartUpdatedEvent} from 'common/components/nav/navCart/navCart.component';
import moment from 'moment';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import {giveGiftParams} from './productConfig.modal';

describe( 'product config modal', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl;

  beforeEach( inject( function ( _$controller_, _$rootScope_ ) {
    jasmine.clock().mockDate( moment.utc( '2016-10-01' ).toDate() );
    $ctrl = _$controller_( module.name, {
      $uibModalInstance: jasmine.createSpyObj( '$uibModalInstance', ['close', 'dismiss'] ),
      productData:       {},
      nextDrawDate:      '2016-10-01',
      itemConfig:        {amount: 85},
      isEdit:            false,
      suggestedAmounts:  [],
      uri:               'uri',
      $scope:            _$rootScope_.$new(),
      $location:         jasmine.createSpyObj( '$location', ['search', 'hash'] )
    } );
    $ctrl.$location.search.and.returnValue( {} );
    $ctrl.itemConfigForm = {
      $valid:    true,
      $dirty:    false,
      $setDirty: jasmine.createSpy( '$setDirty' ).and.callFake( () => {
        $ctrl.itemConfigForm.$dirty = true;
      } )
    };
  } ) );

  it( 'to be defined', () => {
    expect( $ctrl.$location ).toBeDefined();
    expect( $ctrl.$scope ).toBeDefined();
    expect( $ctrl.$log ).toBeDefined();
    expect( $ctrl.$uibModalInstance ).toBeDefined();
    expect( $ctrl.designationsService ).toBeDefined();
    expect( $ctrl.cartService ).toBeDefined();
    expect( $ctrl.modalStateService ).toBeDefined();
    expect( $ctrl.gettext ).toBeDefined();
    expect( $ctrl.productData ).toBeDefined();
    expect( $ctrl.nextDrawDate ).toBeDefined();
    expect( $ctrl.suggestedAmounts ).toBeDefined();
    expect( $ctrl.itemConfig ).toBeDefined();
    expect( $ctrl.isEdit ).toBeDefined();
    expect( $ctrl.uri ).toBeDefined();
  } );

  describe( '$onInit()', () => {
    describe( 'isEdit = true', () => {
      beforeEach( () => {
        $ctrl.isEdit = true;
      } );
      describe( 'with suggestedAmounts', () => {
        it( 'initializes the controller', () => {
          $ctrl.itemConfig = {
            amount:                   543.21,
            'recurring-day-of-month': '28'
          };
          $ctrl.suggestedAmounts = [{amount: 123.45, label: 'Testing'}, {amount: 543.21, label: 'gnitseT'}];
          $ctrl.$onInit();
          expect( $ctrl.submitLabel ).toEqual( 'Update Gift' );
          expect( $ctrl.customInputActive ).toEqual( true );
          expect( $ctrl.customAmount ).toEqual( 543.21 );
          expect( $ctrl.itemConfig ).toEqual( {amount: 543.21, 'recurring-day-of-month': '28'} );
          expect( $ctrl.$location.search ).not.toHaveBeenCalled();
          expect( $ctrl.addedCustomValidators ).toEqual( false );
        } );
      } );
      describe( 'with selectableAmounts', () => {
        it( 'initializes the controller', () => {
          $ctrl.itemConfig = {
            amount:                   1000,
            'recurring-day-of-month': '28'
          };
          $ctrl.$onInit();
          expect( $ctrl.selectableAmounts ).toEqual( [50, 100, 250, 500, 1000, 5000] );
          expect( $ctrl.itemConfig ).toEqual( {amount: 1000, 'recurring-day-of-month': '28'} );
          expect( $ctrl.customAmount ).not.toBeDefined();
          expect( $ctrl.customInputActive ).not.toBeDefined();
          expect( $ctrl.addedCustomValidators ).toEqual( false );
        } );
      } );
    } );

    describe( 'isEdit = false', () => {
      beforeEach( () => {
        $ctrl.isEdit = false;
        spyOn( $ctrl, 'initializeParams' );
      } );
      describe( 'with suggestedAmounts', () => {
        it( 'initializes the controller', () => {
          $ctrl.suggestedAmounts = [{amount: 123.45, label: 'Testing'}, {amount: 543.21, label: 'gnitseT'}];
          $ctrl.$onInit();
          expect( $ctrl.submitLabel ).toEqual( 'Add to Gift Cart' );
          expect( $ctrl.customInputActive ).toEqual( true );
          expect( $ctrl.customAmount ).toEqual( 123.45 );
          expect( $ctrl.itemConfig ).toEqual( {amount: 123.45, 'recurring-day-of-month': '01'} );
          expect( $ctrl.$location.search ).toHaveBeenCalledWith( giveGiftParams.amount, 123.45 );
          expect( $ctrl.addedCustomValidators ).toEqual( false );
          expect( $ctrl.initializeParams ).toHaveBeenCalled();
        } );
      } );

      describe( 'with selectableAmounts', () => {
        it( 'initializes the controller', () => {
          $ctrl.$onInit();
          expect( $ctrl.selectableAmounts ).toEqual( [50, 100, 250, 500, 1000, 5000] );
          expect( $ctrl.itemConfig ).toEqual( {amount: 85, 'recurring-day-of-month': '01'} );
          expect( $ctrl.customAmount ).toEqual( 85 );
          expect( $ctrl.customInputActive ).toEqual( true );
          expect( $ctrl.addedCustomValidators ).toEqual( false );
          expect( $ctrl.initializeParams ).toHaveBeenCalled();
        } );
      } );
    } );
  } );

  describe( 'waitForFormInitialization()', () => {
    it( 'should wait for the form to become available and then call addCustomValidators()', ( done ) => {
      spyOn( $ctrl, 'addCustomValidators' );
      delete $ctrl.itemConfigForm;
      $ctrl.waitForFormInitialization();
      $ctrl.$scope.$digest();
      expect( $ctrl.addCustomValidators ).not.toHaveBeenCalled();
      $ctrl.itemConfigForm = {
        $valid: true,
        $dirty: false
      };
      $ctrl.$scope.$digest();
      expect( $ctrl.addCustomValidators ).toHaveBeenCalled();
      done();
    } );
  } );

  describe( 'addCustomValidators()', () => {
    it( 'should create validators', () => {
      $ctrl.itemConfigForm.amount = {
        $validators: {}
      };
      $ctrl.customInputActive = true;
      $ctrl.addCustomValidators();
      expect( $ctrl.itemConfigForm.amount.$validators.minimum( '1' ) ).toBe( true );
      expect( $ctrl.itemConfigForm.amount.$validators.minimum( '0.9' ) ).toBe( false );

      expect( $ctrl.itemConfigForm.amount.$validators.maximum( '9999999.99' ) ).toBe( true );
      expect( $ctrl.itemConfigForm.amount.$validators.maximum( '10000000' ) ).toBe( false );

      expect( $ctrl.itemConfigForm.amount.$validators.pattern( '4.4' ) ).toBe( true );
      expect( $ctrl.itemConfigForm.amount.$validators.pattern( '4.' ) ).toBe( false );
      expect( $ctrl.itemConfigForm.amount.$validators.pattern( '4.235' ) ).toBe( false );

    } );

    it( 'should pass validation in any \'bad\' case', () => {
      $ctrl.itemConfigForm.amount = {
        $validators: {}
      };
      $ctrl.customInputActive = false;
      $ctrl.addCustomValidators();
      expect( $ctrl.itemConfigForm.amount.$validators.minimum( '0.3' ) ).toBe( true );
      expect( $ctrl.itemConfigForm.amount.$validators.minimum( 'dlksfjs' ) ).toBe( true );
      expect( $ctrl.itemConfigForm.amount.$validators.maximum( '4542452454524.99' ) ).toBe( true );
      expect( $ctrl.itemConfigForm.amount.$validators.pattern( '1.214' ) ).toBe( true );
    } );
  } );

  describe( 'initializeParams', () => {
    beforeEach( () => {
      spyOn( $ctrl, 'changeFrequency' );
      spyOn( $ctrl.modalStateService, 'name' );
      $ctrl.productData.frequencies = [
        {name: 'NA', selectAction: '/a'},
        {name: 'MON', selectAction: '/b'},
        {name: 'QUARTERLY', selectAction: '/c'}];
    } );

    it( 'sets all values from query params', () => {
      $ctrl.$location.search.and.returnValue( {
        [giveGiftParams.designation]: '0123456',
        [giveGiftParams.amount]:      '150',
        [giveGiftParams.frequency]:   'QUARTERLY',
        [giveGiftParams.day]:         '21'
      } );
      // $onInit calls initializeParams ans sets up some defaults.
      $ctrl.$onInit();
      expect( $ctrl.modalStateService.name ).toHaveBeenCalledWith( 'give-gift' );
      expect( $ctrl.$location.search ).toHaveBeenCalled();
      expect( $ctrl.itemConfig.amount ).toEqual( 150 );
      expect( $ctrl.customAmount ).toEqual( 150 );
      expect( $ctrl.changeFrequency ).toHaveBeenCalled();
      expect( $ctrl.itemConfig['recurring-day-of-month'] ).toEqual( '21' );
    } );

    it( 'doesn\'t set missing values', () => {
      $ctrl.$location.search.and.returnValue( {} );
      $ctrl.$onInit();
      expect( $ctrl.modalStateService.name ).toHaveBeenCalledWith( 'give-gift' );
      expect( $ctrl.$location.search ).toHaveBeenCalled();
      expect( $ctrl.itemConfig.amount ).toEqual( 85 );
      expect( $ctrl.customAmount ).toEqual( 85 );
      expect( $ctrl.changeFrequency ).not.toHaveBeenCalled();
      expect( $ctrl.itemConfig['recurring-day-of-month'] ).toEqual( '01' );
    } );

    it( 'handles unknown frequency', () => {
      $ctrl.$location.search.and.returnValue( {
        [giveGiftParams.frequency]: 'ALWAYS'
      } );
      $ctrl.$onInit();
      expect( $ctrl.modalStateService.name ).toHaveBeenCalledWith( 'give-gift' );
      expect( $ctrl.$location.search ).toHaveBeenCalled();
      expect( $ctrl.changeFrequency ).not.toHaveBeenCalled();
    } );

    it( 'handles frequency with missing selectAction', () => {
      $ctrl.productData.frequencies = [
        {name: 'NA', selectAction: '/a'},
        {name: 'MON'},
        {name: 'QUARTERLY', selectAction: '/c'}];
      $ctrl.$location.search.and.returnValue( {
        [giveGiftParams.frequency]: 'MON'
      } );
      $ctrl.$onInit();
      expect( $ctrl.modalStateService.name ).toHaveBeenCalledWith( 'give-gift' );
      expect( $ctrl.$location.search ).toHaveBeenCalled();
      expect( $ctrl.changeFrequency ).not.toHaveBeenCalled();
    } );
  } );

  describe( 'showDefaultAmounts()', () => {
    beforeEach( () => {
      spyOn( $ctrl, 'waitForFormInitialization' );
    } );
    it( 'returns true if no suggestedAmounts', () => {
      expect( $ctrl.showDefaultAmounts() ).toEqual( true );
      expect( $ctrl.waitForFormInitialization ).toHaveBeenCalled();
    } );

    it( 'only calls waitForFormInitialization() once', () => {
      $ctrl.showDefaultAmounts();
      $ctrl.showDefaultAmounts();
      $ctrl.showDefaultAmounts();
      expect( $ctrl.waitForFormInitialization ).toHaveBeenCalledTimes( 1 );
    } );

    it( 'returns false when suggestedAmounts exists', () => {
      $ctrl.suggestedAmounts = [{amount: 123.45, label: 'Testing'}, {amount: 543.21, label: 'gnitseT'}];
      expect( $ctrl.showDefaultAmounts() ).toEqual( false );
      expect( $ctrl.waitForFormInitialization ).not.toHaveBeenCalled();
    } );
  } );

  describe( 'frequencyOrder()', () => {
    it( 'orders frequency by name', () => {
      expect( $ctrl.frequencyOrder( {name: 'NA'} ) ).toEqual( 0 );
      expect( $ctrl.frequencyOrder( {name: 'MON'} ) ).toEqual( 1 );
      expect( $ctrl.frequencyOrder( {name: 'QUARTERLY'} ) ).toEqual( 2 );
      expect( $ctrl.frequencyOrder( {name: 'ANNUAL'} ) ).toEqual( 3 );
    } );
  } );

  describe( 'changeFrequency()', () => {
    let deferred, $rootScope;
    beforeEach( inject( function ( _$q_, _$rootScope_ ) {
      $rootScope = _$rootScope_;
      deferred = _$q_.defer();
      spyOn( $ctrl.designationsService, 'productLookup' ).and.callFake( () => Observable.from( deferred.promise ) );
    } ) );

    describe( 'isEdit = true', () => {
      beforeEach( () => {
        $ctrl.isEdit = true;
      } );
      it( 'changes product frequency', () => {
        $ctrl.changeFrequency( {name: 'NA', selectAction: '/a'} );
        deferred.resolve( {data: {frequency: 'NA', name: 'NA', selectAction: undefined}} );
        $rootScope.$digest();
        expect( $ctrl.designationsService.productLookup ).toHaveBeenCalledWith( '/a', true );
        expect( $ctrl.itemConfigForm.$setDirty ).toHaveBeenCalled();
        expect( $ctrl.$location.search ).not.toHaveBeenCalled();
      } );
    } );

    describe( 'isEdit = false', () => {
      beforeEach( () => {
        $ctrl.isEdit = false;
      } );
      it( 'changes product frequency', () => {
        $ctrl.changeFrequency( {name: 'NA', selectAction: '/a'} );
        deferred.resolve( {data: {frequency: 'NA', name: 'NA', selectAction: undefined}} );
        $rootScope.$digest();
        expect( $ctrl.designationsService.productLookup ).toHaveBeenCalledWith( '/a', true );
        expect( $ctrl.itemConfigForm.$setDirty ).toHaveBeenCalled();
        expect( $ctrl.$location.search ).toHaveBeenCalledWith( giveGiftParams.frequency, 'NA' );
      } );
    } );
  } );

  describe( 'changeAmount()', () => {
    describe( 'isEdit = true', () => {
      beforeEach( () => {
        $ctrl.isEdit = true;
      } );
      it( 'sets itemConfig amount', () => {
        $ctrl.changeAmount( 100 );
        expect( $ctrl.itemConfigForm.$setDirty ).toHaveBeenCalled();
        expect( $ctrl.itemConfig.amount ).toEqual( 100 );
        expect( $ctrl.customAmount ).toBe( '' );
        expect( $ctrl.$location.search ).not.toHaveBeenCalled;
      } );
    } );

    describe( 'isEdit = false', () => {
      beforeEach( () => {
        $ctrl.isEdit = false;
      } );
      it( 'sets itemConfig amount', () => {
        $ctrl.changeAmount( 100 );
        expect( $ctrl.itemConfigForm.$setDirty ).toHaveBeenCalled();
        expect( $ctrl.itemConfig.amount ).toEqual( 100 );
        expect( $ctrl.customAmount ).toBe( '' );
        expect( $ctrl.$location.search ).toHaveBeenCalledWith( giveGiftParams.amount, 100 );
      } );
    } );
  } );

  describe( 'changeCustomAmount()', () => {
    describe( 'isEdit = true', () => {
      beforeEach( () => {
        $ctrl.isEdit = true;
      } );
      it( 'sets itemConfig amount', () => {
        $ctrl.changeCustomAmount( 300 );
        expect( $ctrl.itemConfig.amount ).toEqual( 300 );
        expect( $ctrl.$location.search ).not.toHaveBeenCalled();
      } );
    } );

    describe( 'isEdit = false', () => {
      beforeEach( () => {
        $ctrl.isEdit = false;
      } );
      it( 'sets itemConfig amount', () => {
        $ctrl.changeCustomAmount( 300 );
        expect( $ctrl.itemConfig.amount ).toEqual( 300 );
        expect( $ctrl.$location.search ).toHaveBeenCalledWith( giveGiftParams.amount, 300 );
      } );
    } );
  } );

  describe( 'changeStartDay()', () => {
    describe( 'isEdit = true', () => {
      beforeEach( () => {
        $ctrl.isEdit = true;
      } );
      it( 'sets day query param', () => {
        $ctrl.changeStartDay( '11' );
        expect( $ctrl.$location.search ).not.toHaveBeenCalled();
      } );
    } );
    describe( 'isEdit = false', () => {
      beforeEach( () => {
        $ctrl.isEdit = false;
      } );
      it( 'sets day query param', () => {
        $ctrl.changeStartDay( '11' );
        expect( $ctrl.$location.search ).toHaveBeenCalledWith( giveGiftParams.day, '11' );
      } );
    } );
  } );

  describe( 'saveGiftToCart()', () => {
    describe( 'isEdit = true', () => {
      beforeEach( () => {
        $ctrl.isEdit = true;
        spyOn( $ctrl.cartService, 'editItem' ).and.returnValue( Observable.of( 'editItem success' ) );
        $ctrl.productData.uri = 'items/crugive/<some id>';
        spyOn( $ctrl.$scope, '$emit' );
        $ctrl.$onInit();
      } );

      it( 'should do nothing on invalid form', () => {
        $ctrl.itemConfigForm.$valid = false;
        $ctrl.saveGiftToCart();
        expect( $ctrl.submittingGift ).toEqual( false );
        expect( $ctrl.cartService.editItem ).not.toHaveBeenCalled();
        expect( $ctrl.$uibModalInstance.close ).not.toHaveBeenCalled();
        expect( $ctrl.$uibModalInstance.dismiss ).not.toHaveBeenCalled();
      } );

      it( 'should submit a gift successfully', () => {
        $ctrl.itemConfigForm.$dirty = true;
        $ctrl.saveGiftToCart();
        expect( $ctrl.submittingGift ).toEqual( false );
        expect( $ctrl.cartService.editItem ).toHaveBeenCalledWith( 'uri', 'items/crugive/<some id>', {
          amount:                   85,
          'recurring-day-of-month': '01'
        } );
        expect( $ctrl.$scope.$emit ).toHaveBeenCalledWith( cartUpdatedEvent );
        expect( $ctrl.$uibModalInstance.close ).toHaveBeenCalledWith( {isUpdated: true} );
      } );

      it( 'should submit a gift successfully and omit recurring-day-of-month if frequency is single', () => {
        $ctrl.itemConfigForm.$dirty = true;
        $ctrl.productData.frequency = 'NA';
        $ctrl.saveGiftToCart();
        expect( $ctrl.submittingGift ).toEqual( false );
        expect( $ctrl.cartService.editItem ).toHaveBeenCalledWith( 'uri', 'items/crugive/<some id>', {amount: 85} );
        expect( $ctrl.$scope.$emit ).toHaveBeenCalledWith( cartUpdatedEvent );
        expect( $ctrl.$uibModalInstance.close ).toHaveBeenCalledWith( {isUpdated: true} );
      } );

      it( 'should handle an error submitting a gift', () => {
        $ctrl.cartService.editItem.and.returnValue( Observable.throw( {data: 'error'} ) );
        $ctrl.itemConfigForm.$dirty = true;
        $ctrl.saveGiftToCart();
        expect( $ctrl.submittingGift ).toEqual( false );
        expect( $ctrl.cartService.editItem ).toHaveBeenCalledWith( 'uri', 'items/crugive/<some id>', {
          amount:                   85,
          'recurring-day-of-month': '01'
        } );
        expect( $ctrl.$uibModalInstance.close ).not.toHaveBeenCalled();
      } );
    } );

    describe( 'isEdit = false', () => {
      beforeEach( () => {
        $ctrl.isEdit = false;
        spyOn( $ctrl.cartService, 'addItem' ).and.returnValue( Observable.of( 'saveGiftToCart success' ) );
        spyOn( $ctrl.$scope, '$emit' );
        $ctrl.productData.uri = 'items/crugive/<some id>';
        $ctrl.$onInit();
      } );

      it( 'should do nothing on invalid form', () => {
        $ctrl.itemConfigForm.$valid = false;
        $ctrl.saveGiftToCart();
        expect( $ctrl.submittingGift ).toEqual( false );
        expect( $ctrl.cartService.addItem ).not.toHaveBeenCalled();
        expect( $ctrl.$uibModalInstance.close ).not.toHaveBeenCalled();
        expect( $ctrl.$uibModalInstance.dismiss ).not.toHaveBeenCalled();
      } );

      it( 'should still submit the gift if the form is not dirty', () => {
        $ctrl.saveGiftToCart();
        expect( $ctrl.submittingGift ).toEqual( false );
        expect( $ctrl.cartService.addItem ).toHaveBeenCalledWith( 'items/crugive/<some id>', {
          amount:                   85,
          'recurring-day-of-month': '01'
        } );
        expect( $ctrl.$scope.$emit ).toHaveBeenCalledWith( giftAddedEvent );
        expect( $ctrl.$uibModalInstance.dismiss ).toHaveBeenCalled();
        expect( $ctrl.$uibModalInstance.close ).not.toHaveBeenCalled();
      } );

      it( 'should submit a gift successfully', () => {
        $ctrl.itemConfigForm.$dirty = true;
        $ctrl.saveGiftToCart();
        expect( $ctrl.submittingGift ).toEqual( false );
        expect( $ctrl.cartService.addItem ).toHaveBeenCalledWith( 'items/crugive/<some id>', {
          amount:                   85,
          'recurring-day-of-month': '01'
        } );
        expect( $ctrl.$scope.$emit ).toHaveBeenCalledWith( giftAddedEvent );
        expect( $ctrl.$uibModalInstance.dismiss ).toHaveBeenCalled();
        expect( $ctrl.$uibModalInstance.close ).not.toHaveBeenCalled();
      } );

      it( 'should submit a gift successfully and omit recurring-day-of-month if frequency is single', () => {
        $ctrl.itemConfigForm.$dirty = true;
        $ctrl.productData.frequency = 'NA';
        $ctrl.saveGiftToCart();
        expect( $ctrl.submittingGift ).toEqual( false );
        expect( $ctrl.cartService.addItem ).toHaveBeenCalledWith( 'items/crugive/<some id>', {amount: 85} );
        expect( $ctrl.$scope.$emit ).toHaveBeenCalledWith( giftAddedEvent );
        expect( $ctrl.$uibModalInstance.dismiss ).toHaveBeenCalled();
        expect( $ctrl.$uibModalInstance.close ).not.toHaveBeenCalled();
      } );

      it( 'should handle an error submitting a gift', () => {
        $ctrl.cartService.addItem.and.returnValue( Observable.throw( 'error' ) );
        $ctrl.itemConfigForm.$dirty = true;
        $ctrl.saveGiftToCart();
        expect( $ctrl.submittingGift ).toEqual( false );
        expect( $ctrl.cartService.addItem ).toHaveBeenCalledWith( 'items/crugive/<some id>', {
          amount:                   85,
          'recurring-day-of-month': '01'
        } );
        expect( $ctrl.$uibModalInstance.dismiss ).not.toHaveBeenCalled();
        expect( $ctrl.$uibModalInstance.close ).not.toHaveBeenCalled();
      } );
    } );
  } );
} );

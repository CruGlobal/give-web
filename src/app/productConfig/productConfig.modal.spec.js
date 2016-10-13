import angular from 'angular';
import 'angular-mocks';
import module from './productConfig.modal';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import {giveGiftParams} from './productConfig.modal';

describe( 'product config modal', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl, uibModalInstance, productData, nextDrawDate, itemConfig, itemConfigForm, $location;

  beforeEach( inject( function ( _$location_ ) {
    $location = _$location_;
    uibModalInstance = jasmine.createSpyObj( 'uibModalInstance', ['close', 'dismiss'] );
    productData = {};
    nextDrawDate = '2016-10-01';
    itemConfig = {
      amount: 85
    };
    spyOn( $location, 'search' ).and.returnValue( {} );
    spyOn( $location, 'hash' );
    itemConfigForm = {
      $valid:    true,
      $dirty:    false,
      $setDirty: jasmine.createSpy( '$setDirty' ).and.callFake( () => {
        $ctrl.itemConfigForm.$dirty = true;
      } )
    };
  } ) );

  describe( 'isEdit = true', () => {
    beforeEach( inject( function ( _$controller_ ) {
      $ctrl = _$controller_( module.name, {
        $uibModalInstance: uibModalInstance,
        productData:       productData,
        nextDrawDate:      nextDrawDate,
        itemConfig:        itemConfig,
        isEdit:            true
      } );
      $ctrl.itemConfigForm = itemConfigForm;
    } ) );

    it( 'to be defined', function () {
      expect( $ctrl ).toBeDefined();
      expect( $ctrl.selectableAmounts ).toEqual( [50, 100, 250, 500, 1000, 5000] );
      expect( $ctrl.submitLabel ).toEqual( 'Update Gift' );
    } );

    describe( 'addToCart()', () => {
      beforeEach( () => {
        spyOn( $ctrl.cartService, 'addItem' ).and.returnValue( Observable.of( 'addToCart success' ) );
        $ctrl.productData.id = 'some id';
      } );

      it( 'should do nothing on invalid form', () => {
        $ctrl.itemConfigForm.$valid = false;
        $ctrl.addToCart();
        expect($ctrl.giftSubmitted).toEqual(false);
        expect($ctrl.submittingGift).toEqual(false);
        expect( $ctrl.cartService.addItem ).not.toHaveBeenCalled();
        expect( uibModalInstance.close ).not.toHaveBeenCalled();
      } );

      it( 'should close modal as not updated if form is not dirty', () => {
        $ctrl.addToCart();
        expect($ctrl.giftSubmitted).toEqual(false);
        expect($ctrl.submittingGift).toEqual(false);
        expect( $ctrl.cartService.addItem ).not.toHaveBeenCalled();
        expect( uibModalInstance.close ).toHaveBeenCalledWith( {isUpdated: false} );
      } );

      it( 'should submit a gift successfully', () => {
        $ctrl.itemConfigForm.$dirty = true;
        $ctrl.addToCart();
        expect($ctrl.giftSubmitted).toEqual(true);
        expect($ctrl.submittingGift).toEqual(false);
        expect( $ctrl.cartService.addItem ).toHaveBeenCalledWith('some id', { amount: 85, 'recurring-day-of-month': '1' });
        expect( uibModalInstance.close ).toHaveBeenCalledWith( {isUpdated: true} );
      } );

      it( 'should submit a gift successfully and omit recurring-day-of-month if frequency is single', () => {
        $ctrl.itemConfigForm.$dirty = true;
        $ctrl.productData.frequency = 'NA';
        $ctrl.addToCart();
        expect($ctrl.giftSubmitted).toEqual(true);
        expect($ctrl.submittingGift).toEqual(false);
        expect( $ctrl.cartService.addItem ).toHaveBeenCalledWith('some id', { amount: 85 });
        expect( uibModalInstance.close ).toHaveBeenCalledWith( {isUpdated: true} );
      } );

      it( 'should handle an error submitting a gift', () => {
        $ctrl.cartService.addItem.and.returnValue(Observable.throw('error'));
        $ctrl.itemConfigForm.$dirty = true;
        $ctrl.addToCart();
        expect($ctrl.giftSubmitted).toEqual(false);
        expect($ctrl.submittingGift).toEqual(false);
        expect( $ctrl.cartService.addItem ).toHaveBeenCalledWith('some id', { amount: 85, 'recurring-day-of-month': '1' });
        expect( uibModalInstance.close ).not.toHaveBeenCalled();
      } );
    } );
  } );

  describe( 'isEdit = false', () => {
    beforeEach( inject( function ( _$controller_ ) {
      $location.search.and.returnValue( {
        [giveGiftParams.designation]: '0123456',
        [giveGiftParams.amount]:      '150',
        [giveGiftParams.frequency]:   'QUARTERLY',
        [giveGiftParams.day]:         '21'
      } );
      $ctrl = _$controller_( module.name, {
        $uibModalInstance: uibModalInstance,
        productData:       productData,
        nextDrawDate:      nextDrawDate,
        itemConfig:        itemConfig,
        isEdit:            false
      } );
      $ctrl.itemConfigForm = itemConfigForm;
    } ) );

    describe( 'initializeParams', () => {
      beforeEach( () => {
        spyOn( $ctrl, 'changeFrequency' );
        spyOn( $ctrl.modalStateService, 'name' );
        $ctrl.productData.frequencies = [
          {name: 'NA', selectAction: '/a'},
          {name: 'MON', selectAction: '/b'},
          {name: 'QUARTERLY', selectAction: '/c'}];
      } );
      it( 'sets values from query params', () => {
        $ctrl.initializeParams();
        expect( $ctrl.modalStateService.name ).toHaveBeenCalledWith( 'give-gift' );
        expect( $location.search ).toHaveBeenCalled();
        expect( $ctrl.itemConfig.amount ).toEqual( 150 );
        expect( $ctrl.customAmount ).toEqual( 150 );
        expect( $ctrl.changeFrequency ).toHaveBeenCalled();
        expect( $ctrl.itemConfig['recurring-day-of-month'] ).toEqual( '21' );
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

      it( 'changes product frequency', () => {
        $ctrl.changeFrequency( {name: 'NA', selectAction: '/a'} );
        deferred.resolve( {data: {frequency: 'NA', name: 'NA', selectAction: undefined}} );
        $rootScope.$digest();
        expect( $ctrl.designationsService.productLookup ).toHaveBeenCalledWith( '/a', true );
        expect( $ctrl.itemConfigForm.$setDirty ).toHaveBeenCalled();
        expect( $ctrl.$location.search ).toHaveBeenCalledWith( giveGiftParams.frequency, 'NA' );
      } );
    } );

    describe( 'changeAmount()', () => {
      it( 'sets itemConfig amount', () => {
        $ctrl.itemConfigForm.amount = jasmine.createSpyObj( 'amount', ['$setViewValue', '$render'] );
        $ctrl.changeAmount( 100 );
        expect( $ctrl.itemConfigForm.$setDirty ).toHaveBeenCalled();
        expect( $ctrl.itemConfig.amount ).toEqual( 100 );
        expect( $ctrl.customAmount ).not.toBeDefined();
        expect( $ctrl.itemConfigForm.amount.$setViewValue ).toHaveBeenCalledWith( undefined, 'change' );
        expect( $ctrl.itemConfigForm.amount.$render ).toHaveBeenCalled();
        expect( $ctrl.$location.search ).toHaveBeenCalledWith( giveGiftParams.amount, 100 );
      } );
    } );

    describe( 'changeCustomAmount()', () => {
      it( 'sets itemConfig amount', () => {
        $ctrl.changeCustomAmount( 300 );
        expect( $ctrl.itemConfig.amount ).toEqual( 300 );
        expect( $ctrl.$location.search ).toHaveBeenCalledWith( giveGiftParams.amount, 300 );
      } );
    } );

    describe( 'changeStartDay()', () => {
      it( 'sets day query param', () => {
        $ctrl.changeStartDay( '11' );
        expect( $ctrl.$location.search ).toHaveBeenCalledWith( giveGiftParams.day, '11' );
      } );
    } );

    describe( 'daysInMonth', () => {
      it( 'returns days in a month', () => {
        expect( $ctrl.daysInMonth().length ).toEqual( 28 );
      } );
    } );

    describe( 'donationStartDate', () => {
      it( 'should return the gift start date from the cartService', () => {
        spyOn($ctrl.cartService, 'giftStartDate').and.returnValue(new Date(2016, 0, 1));
        expect( $ctrl.donationStartDate(5) ).toEqual( new Date(2016, 0, 1) );
        expect( $ctrl.cartService.giftStartDate ).toHaveBeenCalledWith('2016-10-01', 5);
      } );
    } );

    describe( 'addToCart()', () => {
      beforeEach( () => {
        spyOn( $ctrl.cartService, 'addItem' ).and.returnValue( Observable.of( 'addToCart success' ) );
        $ctrl.productData.id = 'some id';
      } );

      it( 'should do nothing on invalid form', () => {
        $ctrl.itemConfigForm.$valid = false;
        $ctrl.addToCart();
        expect($ctrl.giftSubmitted).toEqual(false);
        expect($ctrl.submittingGift).toEqual(false);
        expect( $ctrl.cartService.addItem ).not.toHaveBeenCalled();
        expect( uibModalInstance.close ).not.toHaveBeenCalled();
      } );

      it( 'should still submit the gift if the form is not dirty', () => {
        $ctrl.addToCart();
        expect($ctrl.giftSubmitted).toEqual(true);
        expect($ctrl.submittingGift).toEqual(false);
        expect( $ctrl.cartService.addItem ).toHaveBeenCalledWith('some id', { amount: 150, 'recurring-day-of-month': '21' });
        expect( uibModalInstance.close ).not.toHaveBeenCalled();
      } );

      it( 'should submit a gift successfully', () => {
        $ctrl.itemConfigForm.$dirty = true;
        $ctrl.addToCart();
        expect($ctrl.giftSubmitted).toEqual(true);
        expect($ctrl.submittingGift).toEqual(false);
        expect( $ctrl.cartService.addItem ).toHaveBeenCalledWith('some id', { amount: 150, 'recurring-day-of-month': '21' });
        expect( uibModalInstance.close ).not.toHaveBeenCalled();
      } );

      it( 'should submit a gift successfully and omit recurring-day-of-month if frequency is single', () => {
        $ctrl.itemConfigForm.$dirty = true;
        $ctrl.productData.frequency = 'NA';
        $ctrl.addToCart();
        expect($ctrl.giftSubmitted).toEqual(true);
        expect($ctrl.submittingGift).toEqual(false);
        expect( $ctrl.cartService.addItem ).toHaveBeenCalledWith('some id', { amount: 150 });
        expect( uibModalInstance.close ).not.toHaveBeenCalled();
      } );

      it( 'should handle an error submitting a gift', () => {
        $ctrl.cartService.addItem.and.returnValue(Observable.throw('error'));
        $ctrl.itemConfigForm.$dirty = true;
        $ctrl.addToCart();
        expect($ctrl.giftSubmitted).toEqual(false);
        expect($ctrl.submittingGift).toEqual(false);
        expect( $ctrl.cartService.addItem ).toHaveBeenCalledWith('some id', { amount: 150, 'recurring-day-of-month': '21' });
        expect( uibModalInstance.close ).not.toHaveBeenCalled();
      } );
    } );
  } );

  describe( 'no query params', () => {
    beforeEach(inject(function (_$controller_) {
      $ctrl = _$controller_(module.name, {
        $uibModalInstance: uibModalInstance,
        productData: productData,
        nextDrawDate: nextDrawDate,
        itemConfig: itemConfig,
        isEdit: false
      });
      $ctrl.itemConfigForm = itemConfigForm;
    }));

    it( 'set default gift start day', () => {
      expect( $ctrl.itemConfig['recurring-day-of-month'] ).toEqual( '1' );
    } );
  });
} );

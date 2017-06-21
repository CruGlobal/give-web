import angular from 'angular';
import 'angular-mocks';
import moment from 'moment';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import module from './productConfigForm.component';
import {giftAddedEvent, cartUpdatedEvent} from 'common/components/nav/navCart/navCart.component';
import { giveGiftParams } from '../giveGiftParams';

describe( 'product config form component', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl;

  beforeEach( inject( function ( $componentController ) {
    jasmine.clock().mockDate( moment.utc( '2016-10-01' ).toDate() );

    $ctrl = $componentController( module.name, {}, {
      itemConfigForm: {
        $valid: true,
        $dirty: false,
        $setDirty: jasmine.createSpy('$setDirty').and.callFake(() => {
          $ctrl.itemConfigForm.$dirty = true;
        }),
        $submitted: false,
        $setSubmitted: jasmine.createSpy('$setSubmitted').and.callFake(() => {
          $ctrl.itemConfigForm.$submitted = true;
        })
      },
      code: '1234567',
      itemConfig: {
        amount: 85
      },
      isEdit: false,
      uri: 'uri',
      defaultFrequency: 'MON',
      updateQueryParam: jasmine.createSpy('updateQueryParam'),
      onStateChange: jasmine.createSpy('onStateChange')
    } );
  } ) );

  it( 'to be defined', () => {
    expect( $ctrl.$scope ).toBeDefined();
    expect( $ctrl.$log ).toBeDefined();
    expect( $ctrl.designationsService ).toBeDefined();
    expect( $ctrl.cartService ).toBeDefined();
    expect( $ctrl.possibleTransactionDays ).toBeDefined();
    expect( $ctrl.startDate ).toBeDefined();
  } );

  describe( '$onInit', () => {
    it( 'should call the initialization functions', () => {
      spyOn( $ctrl, 'loadData' );
      spyOn( $ctrl, 'waitForFormInitialization' );
      $ctrl.$onInit();
      expect( $ctrl.loadData ).toHaveBeenCalled();
      expect( $ctrl.waitForFormInitialization ).toHaveBeenCalled();
    } );
  } );

  describe( '$onChanges', () => {
    it( 'should call saveGiftToCart when submitted changes to true', () => {
      spyOn( $ctrl, 'saveGiftToCart' );
      $ctrl.$onChanges({ submitted: { currentValue: true } });
      expect( $ctrl.saveGiftToCart ).toHaveBeenCalled();
    } );
    it( 'should not call saveGiftToCart when submit changes to false', () => {
      spyOn( $ctrl, 'saveGiftToCart' );
      $ctrl.$onChanges({ submitted: { currentValue: false } });
      expect( $ctrl.saveGiftToCart ).not.toHaveBeenCalled();
    } );
  } );

  describe( 'loadData', () => {
    beforeEach(() => {
      spyOn($ctrl.designationsService, 'productLookup').and.returnValue(Observable.of('product data'));
      spyOn($ctrl, 'setDefaultAmount');
      spyOn($ctrl, 'setDefaultFrequency');

      spyOn($ctrl.commonService, 'getNextDrawDate').and.returnValue(Observable.of('2016-10-02'));

      spyOn($ctrl.designationsService, 'suggestedAmounts').and.returnValue(Observable.of([ { amount: 5 }, { amount: 10 } ]));
    });

    it( 'should get productData, nextDrawDate, and suggestedAmounts', () => {
      $ctrl.loadData();

      expect( $ctrl.showRecipientComments ).toEqual(false);
      expect( $ctrl.showDSComments ).toEqual(false);

      expect( $ctrl.productData ).toEqual('product data');
      expect( $ctrl.setDefaultAmount).toHaveBeenCalled();
      expect( $ctrl.setDefaultFrequency).toHaveBeenCalled();

      expect( $ctrl.nextDrawDate ).toEqual('2016-10-02');
      expect( $ctrl.itemConfig['recurring-day-of-month'] ).toEqual('02');

      expect( $ctrl.suggestedAmounts ).toEqual([ { amount: 5 }, { amount: 10 } ]);
      expect( $ctrl.useSuggestedAmounts ).toEqual(true);

      expect( $ctrl.loading ).toEqual(false);
      expect( $ctrl.onStateChange ).toHaveBeenCalledWith({ state: 'unsubmitted' });
    } );

    it( 'should not use suggested amounts if they are not provided', () => {
      $ctrl.designationsService.suggestedAmounts.and.returnValue(Observable.of([]));
      $ctrl.loadData();
      expect( $ctrl.useSuggestedAmounts ).toEqual(false);
    } );

    it( 'should handle an error loading data', () => {
      $ctrl.designationsService.productLookup.and.returnValue(Observable.throw('some error'));
      $ctrl.loadData();
      expect( $ctrl.errorLoading ).toEqual(true);
      expect( $ctrl.onStateChange ).toHaveBeenCalledWith({ state: 'errorLoading' });
      expect( $ctrl.$log.error.logs[0] ).toEqual(['Error loading data for product config form', 'some error']);
      expect( $ctrl.loading ).toEqual(false);
    } );
  } );

  describe( 'setDefaultAmount', () => {
    beforeEach(() => {
      $ctrl.itemConfig = {};
      spyOn($ctrl, 'changeCustomAmount');
    });
    it('should set the default amount if there are no suggested amounts', () => {
      $ctrl.setDefaultAmount();
      expect($ctrl.itemConfig.amount).toEqual(50);
    });
    it('should set the default amount if there are suggested amounts', () => {
      $ctrl.suggestedAmounts = [ { amount: 14 }];
      $ctrl.setDefaultAmount();
      expect($ctrl.itemConfig.amount).toEqual(14);
    });
    it('should use an existing selectableAmounts', () => {
      $ctrl.itemConfig.amount = 100;
      $ctrl.setDefaultAmount();
      expect($ctrl.itemConfig.amount).toEqual(100);
      expect($ctrl.changeCustomAmount).not.toHaveBeenCalled();
    });
    it('should use an existing suggestedAmounts', () => {
      $ctrl.itemConfig.amount = 14;
      $ctrl.suggestedAmounts = [ { amount: 14 }];
      $ctrl.setDefaultAmount();
      expect($ctrl.itemConfig.amount).toEqual(14);
      expect($ctrl.changeCustomAmount).not.toHaveBeenCalled();
    });
    it('should initialize the custom value without suggestedAmounts', () => {
      $ctrl.itemConfig.amount = 14;
      $ctrl.setDefaultAmount();
      expect($ctrl.itemConfig.amount).toEqual(14);
      expect($ctrl.changeCustomAmount).toHaveBeenCalledWith(14);
    });
    it('should initialize the custom value with suggestedAmounts', () => {
      $ctrl.itemConfig.amount = 14;
      $ctrl.suggestedAmounts = [ { amount: 25 }];
      $ctrl.setDefaultAmount();
      expect($ctrl.itemConfig.amount).toEqual(14);
      expect($ctrl.changeCustomAmount).toHaveBeenCalledWith(14);
    });
  });

  describe('setDefaultFrequency', () => {
    it('should change the frequency to the specified default frequency', () => {
      spyOn($ctrl, 'changeFrequency');
      $ctrl.productData = {
        frequencies: [{ name: 'MON', selectAction: 'uri' }]
      };
      $ctrl.setDefaultFrequency();
      expect($ctrl.changeFrequency).toHaveBeenCalledWith({ name: 'MON', selectAction: 'uri' });
    });
  });

  describe( 'waitForFormInitialization()', () => {
    it( 'should wait for the form to become available and then call addCustomValidators()', ( done ) => {
      spyOn( $ctrl, 'addCustomValidators' );
      delete $ctrl.itemConfigForm;
      $ctrl.waitForFormInitialization();
      $ctrl.$scope.$digest();
      expect( $ctrl.addCustomValidators ).not.toHaveBeenCalled();
      $ctrl.itemConfigForm = {
        $valid: true,
        $dirty: false,
        amount: {}
      };
      $ctrl.$scope.$digest();
      expect( $ctrl.addCustomValidators ).toHaveBeenCalled();
      done();
    } );
  } );

  describe( 'addCustomValidators()', () => {
    beforeEach(() => {
      $ctrl.itemConfigForm.amount = {
        $validators: {},
        $parsers: []
      };
    });
    it( 'should create validators', () => {
      $ctrl.customInputActive = true;
      $ctrl.addCustomValidators();
      expect( $ctrl.itemConfigForm.amount.$parsers[0]( '$10' ) ).toBe( '10' );

      expect( $ctrl.itemConfigForm.amount.$validators.minimum( '1' ) ).toBe( true );
      expect( $ctrl.itemConfigForm.amount.$validators.minimum( '0.9' ) ).toBe( false );

      expect( $ctrl.itemConfigForm.amount.$validators.maximum( '9999999.99' ) ).toBe( true );
      expect( $ctrl.itemConfigForm.amount.$validators.maximum( '10000000' ) ).toBe( false );

      expect( $ctrl.itemConfigForm.amount.$validators.pattern( '4.4' ) ).toBe( true );
      expect( $ctrl.itemConfigForm.amount.$validators.pattern( '4.' ) ).toBe( false );
      expect( $ctrl.itemConfigForm.amount.$validators.pattern( '4.235' ) ).toBe( false );

    } );

    it( 'should pass validation in any \'bad\' case', () => {
      $ctrl.customInputActive = false;
      $ctrl.addCustomValidators();
      expect( $ctrl.itemConfigForm.amount.$validators.minimum( '0.3' ) ).toBe( true );
      expect( $ctrl.itemConfigForm.amount.$validators.minimum( 'dlksfjs' ) ).toBe( true );
      expect( $ctrl.itemConfigForm.amount.$validators.maximum( '4542452454524.99' ) ).toBe( true );
      expect( $ctrl.itemConfigForm.amount.$validators.pattern( '1.214' ) ).toBe( true );
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
    beforeEach( () => {
      spyOn( $ctrl.designationsService, 'productLookup' ).and.returnValue(Observable.of({ frequency: 'NA' }));
      $ctrl.productData = { frequency: 'MON' };
      $ctrl.errorAlreadyInCart = true;
      $ctrl.changingFrequency = false;
    } );

    it( 'does nothing', () => {
      $ctrl.changeFrequency( {name: 'MON', selectAction: '/b'} );
      expect( $ctrl.designationsService.productLookup ).not.toHaveBeenCalled();
      expect( $ctrl.itemConfigForm.$setDirty ).not.toHaveBeenCalled();
      expect( $ctrl.productData ).toEqual({ frequency: 'MON' });
    } );

    it( 'changes product frequency', () => {
      $ctrl.changeFrequency( {name: 'NA', selectAction: '/a'} );
      expect( $ctrl.designationsService.productLookup ).toHaveBeenCalledWith( '/a', true );
      expect( $ctrl.itemConfigForm.$setDirty ).toHaveBeenCalled();
      expect( $ctrl.productData ).toEqual({ frequency: 'NA' });
      expect( $ctrl.updateQueryParam ).toHaveBeenCalledWith({ key: giveGiftParams.frequency, value: 'NA' });
      expect( $ctrl.errorChangingFrequency).toEqual(false);
      expect( $ctrl.errorAlreadyInCart).toEqual(false);
      expect($ctrl.changingFrequency).toEqual(false);
      expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'unsubmitted' });
    } );
    it( 'should handle an error changing frequency', () => {
      $ctrl.designationsService.productLookup.and.returnValue(Observable.throw('some error'));
      $ctrl.changeFrequency( {name: 'NA', selectAction: '/a'} );
      expect( $ctrl.designationsService.productLookup ).toHaveBeenCalledWith( '/a', true );
      expect( $ctrl.itemConfigForm.$setDirty ).not.toHaveBeenCalled();
      expect( $ctrl.productData ).toEqual({ frequency: 'MON' });
      expect( $ctrl.updateQueryParam ).toHaveBeenCalledWith({ key: giveGiftParams.frequency, value: 'NA' });
      expect( $ctrl.updateQueryParam ).toHaveBeenCalledWith({ key: giveGiftParams.frequency, value: 'MON' });
      expect( $ctrl.errorChangingFrequency).toEqual(true);
      expect( $ctrl.$log.error.logs[0] ).toEqual(['Error loading new product when changing frequency', 'some error']);
      expect( $ctrl.errorAlreadyInCart).toEqual(false);
      expect($ctrl.changingFrequency).toEqual(false);
      expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'unsubmitted' });
    } );
  } );

  describe( 'changeAmount()', () => {
    it( 'sets itemConfig amount', () => {
      $ctrl.changeAmount( 100 );
      expect( $ctrl.itemConfigForm.$setDirty ).toHaveBeenCalled();
      expect( $ctrl.itemConfig.amount ).toEqual( 100 );
      expect( $ctrl.customAmount ).toBe( '' );
      expect( $ctrl.customInputActive ).toEqual( false );
      expect( $ctrl.updateQueryParam ).toHaveBeenCalledWith({ key: giveGiftParams.amount, value: 100 });
    } );
  } );

  describe( 'changeCustomAmount()', () => {
    it( 'sets itemConfig amount', () => {
      $ctrl.itemConfig = {};
      $ctrl.changeCustomAmount( 300 );
      expect( $ctrl.itemConfig.amount ).toEqual( 300 );
      expect( $ctrl.customAmount ).toEqual( 300 );
      expect( $ctrl.customInputActive ).toEqual( true );
      expect( $ctrl.updateQueryParam ).toHaveBeenCalledWith({ key: giveGiftParams.amount, value: 300 });
    } );
  } );

  describe( 'changeStartDay()', () => {
    it( 'sets day query param', () => {
      $ctrl.errorAlreadyInCart = true;
      $ctrl.changeStartDay( '11' );
      expect( $ctrl.updateQueryParam ).toHaveBeenCalledWith({ key: giveGiftParams.day, value: '11' });
      expect( $ctrl.errorAlreadyInCart).toEqual(false);
    } );
  } );

  describe( 'saveGiftToCart()', () => {
    beforeEach(() => {
      // Make sure it resets errors
      $ctrl.errorAlreadyInCart = true;
      $ctrl.errorSavingGeneric = true;
      spyOn( $ctrl.analyticsFactory, 'cartAdd');
    });

    afterEach(() => {
      expect( $ctrl.itemConfigForm.$submitted ).toEqual(true);
    });

    describe( 'isEdit = true', () => {
      testSaving(true);
    } );
    describe( 'isEdit = false', () => {
      testSaving(false);
    } );

    function testSaving(isEdit){
      const operation = isEdit ? 'editItem' : 'addItem';
      const cartEvent = isEdit ? cartUpdatedEvent : giftAddedEvent;
      const operationArgs = isEdit ?
        [ 'uri',  'items/crugive/<some id>', { amount: 85 } ] :
        [ 'items/crugive/<some id>', { amount: 85 }, undefined ];
      beforeEach( () => {
        $ctrl.isEdit = isEdit;
        spyOn( $ctrl.cartService, operation ).and.returnValue( Observable.of({ self: { uri: 'uri' } }) );
        $ctrl.productData = { uri: 'items/crugive/<some id>' };
        spyOn( $ctrl.$scope, '$emit' );
      } );

      it( 'should do nothing on invalid form', () => {
        $ctrl.itemConfigForm.$valid = false;
        $ctrl.saveGiftToCart();
        expect( $ctrl.submittingGift ).toEqual( false );
        expect( $ctrl.cartService[operation] ).not.toHaveBeenCalled();
        expect( $ctrl.errorAlreadyInCart ).toEqual(false);
        expect( $ctrl.errorSavingGeneric ).toEqual(false);
      } );

      it( 'should still submit the gift if the form is not dirty', () => {
        $ctrl.saveGiftToCart();
        expect( $ctrl.submittingGift ).toEqual( false );
        expect( $ctrl.cartService[operation] ).toHaveBeenCalledWith(...operationArgs);
        expect( $ctrl.$scope.$emit ).toHaveBeenCalledWith( cartEvent );
        expect( $ctrl.errorAlreadyInCart).toEqual(false);
        expect( $ctrl.errorSavingGeneric).toEqual(false);
      } );

      it( 'should submit a gift successfully', () => {
        $ctrl.itemConfigForm.$dirty = true;
        $ctrl.saveGiftToCart();
        expect( $ctrl.submittingGift ).toEqual( false );
        expect( $ctrl.cartService[operation] ).toHaveBeenCalledWith(...operationArgs);
        expect( $ctrl.$scope.$emit ).toHaveBeenCalledWith( cartEvent );
        expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'submitted' });
        expect( $ctrl.errorAlreadyInCart).toEqual(false);
        expect( $ctrl.errorSavingGeneric).toEqual(false);
      } );

      it( 'should submit a gift successfully and omit recurring-day-of-month if frequency is single', () => {
        $ctrl.itemConfig['recurring-day-of-month'] = '01';
        $ctrl.itemConfigForm.$dirty = true;
        $ctrl.productData.frequency = 'NA';
        $ctrl.saveGiftToCart();
        expect( $ctrl.submittingGift ).toEqual( false );
        expect( $ctrl.cartService[operation] ).toHaveBeenCalledWith(...operationArgs);
        expect( $ctrl.$scope.$emit ).toHaveBeenCalledWith( cartEvent );
        expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'submitted' });
        expect( $ctrl.errorAlreadyInCart).toEqual(false);
        expect( $ctrl.errorSavingGeneric).toEqual(false);
      } );

      it( 'should handle an error submitting a gift', () => {
        $ctrl.cartService[operation].and.returnValue( Observable.throw( 'some error' ) );
        $ctrl.itemConfigForm.$dirty = true;
        $ctrl.saveGiftToCart();
        expect( $ctrl.submittingGift ).toEqual( false );
        expect( $ctrl.cartService[operation] ).toHaveBeenCalledWith(...operationArgs);
        expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'errorSubmitting' });
        expect( $ctrl.errorAlreadyInCart).toEqual(false);
        expect( $ctrl.errorSavingGeneric).toEqual(true);
        expect( $ctrl.$log.error.logs[0]).toEqual(['Error adding or updating item in cart', 'some error' ]);
      } );

      it( 'should handle an error when saving a duplicate item', () => {
        $ctrl.cartService[operation].and.returnValue( Observable.throw( { data: 'Recurring gift to designation: 0671540 on draw day: 14 is already in the cart' } ) );
        $ctrl.itemConfigForm.$dirty = true;
        $ctrl.saveGiftToCart();
        expect( $ctrl.submittingGift ).toEqual( false );
        expect( $ctrl.cartService[operation] ).toHaveBeenCalledWith(...operationArgs);
        expect($ctrl.onStateChange).toHaveBeenCalledWith({ state: 'errorAlreadyInCart' });
        expect( $ctrl.errorAlreadyInCart).toEqual(true);
        expect( $ctrl.errorSavingGeneric).toEqual(false);
      } );
    }
  } );

  describe('displayId()', () => {
    it('should return an empty string when productData isn\'t defined', () => {
      expect($ctrl.displayId()).toEqual('');
    });
    it('shows designationNumber when jcr:title is the same', () => {
      $ctrl.productData = { displayName: 'Title', designationNumber: '0123456'};
      $ctrl.itemConfig = { 'jcr-title': 'Title' };
      expect($ctrl.displayId()).toEqual('#0123456');
    });
    it('includes productData when jcr:title is different', () => {
      $ctrl.productData = { displayName: 'Title', designationNumber: '0123456'};
      $ctrl.itemConfig = { 'jcr-title': 'Special Title', 'campaign-page': '9876' };
      expect($ctrl.displayId()).toEqual('#0123456 - Title');
    });
  });
} );

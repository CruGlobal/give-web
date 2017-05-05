import angular from 'angular';
import 'angular-mocks';
import module, {giveGiftParams} from './productConfig.modal.component';
import {giftAddedEvent, cartUpdatedEvent} from 'common/components/nav/navCart/navCart.component';
import moment from 'moment';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

describe( 'product config modal', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl;

  beforeEach( inject( function ( $componentController ) {
    jasmine.clock().mockDate( moment.utc( '2016-10-01' ).toDate() );

    $ctrl = $componentController( module.name, {
      $location: jasmine.createSpyObj( '$location', ['search', 'hash'] )
    }, {
      itemConfigForm: {
        $valid: true,
        $dirty: false,
        $setDirty: jasmine.createSpy('$setDirty').and.callFake(() => {
          $ctrl.itemConfigForm.$dirty = true;
        })
      },
      resolve: {
        productData: {},
        nextDrawDate: '2016-10-01',
        itemConfig: {
          amount: 85
        },
        isEdit: false,
        suggestedAmounts: [],
        uri: 'uri'
      },
      close: jasmine.createSpy('close'),
      dismiss: jasmine.createSpy('dismiss')
    } );
    $ctrl.$location.search.and.returnValue( {} );
  } ) );

  it( 'to be defined', () => {
    expect( $ctrl.$location ).toBeDefined();
    expect( $ctrl.$scope ).toBeDefined();
    expect( $ctrl.$log ).toBeDefined();
    expect( $ctrl.designationsService ).toBeDefined();
    expect( $ctrl.cartService ).toBeDefined();
    expect( $ctrl.modalStateService ).toBeDefined();
    expect( $ctrl.possibleTransactionDays ).toBeDefined();
    expect( $ctrl.startDate ).toBeDefined();
  } );

  describe( '$onInit', () => {
    it( 'should call the initialization functions', () => {
      spyOn( $ctrl, 'initModalData' );
      spyOn( $ctrl, 'initializeParams' );
      spyOn( $ctrl, 'setDefaultAmount' );
      spyOn( $ctrl, 'waitForFormInitialization' );
      $ctrl.$onInit();
      expect( $ctrl.initModalData ).toHaveBeenCalled();
      expect( $ctrl.initializeParams ).toHaveBeenCalled();
      expect( $ctrl.setDefaultAmount ).toHaveBeenCalled();
      expect( $ctrl.waitForFormInitialization ).toHaveBeenCalled();
    } );
  } );

  describe( 'initModalData', () => {
    it( 'should use the resolve input to initialize the data used by the modal', () => {
      $ctrl.resolve = {
        productData: 'some data',
        itemConfig: { amount: 50, 'recurring-day-of-month': '10', 'recipient-comments': 'You\'re Welcome' },
        isEdit: true,
        uri: 'some path',
        suggestedAmounts: [ { amount: 5 }, { amount: 10 } ],
        nextDrawDate: '2016-10-02'
      };
      $ctrl.initModalData();
      expect( $ctrl.productData ).toEqual('some data');
      expect( $ctrl.itemConfig ).toEqual({ amount: 50, 'recurring-day-of-month': '10', 'recipient-comments': 'You\'re Welcome' });
      expect( $ctrl.isEdit ).toEqual(true);
      expect( $ctrl.uri ).toEqual('some path');
      expect( $ctrl.suggestedAmounts ).toEqual([ { amount: 5 }, { amount: 10 } ]);
      expect( $ctrl.nextDrawDate ).toEqual('2016-10-02');
      expect( $ctrl.showRecipientComments ).toEqual(true);
      expect( $ctrl.showDSComments ).toEqual(false);
      expect( $ctrl.useSuggestedAmounts ).toEqual(true);
    } );

    it( 'should not use suggested amounts if they are not provided', () => {
      $ctrl.resolve = {
        itemConfig: {}
      };
      $ctrl.initModalData();
      expect( $ctrl.useSuggestedAmounts ).toEqual(false);
    } );

    it( 'should initialize the recurring day of month', () => {
      $ctrl.resolve = {
        itemConfig: {},
        nextDrawDate: '2016-10-02'
      };
      $ctrl.initModalData();
      expect( $ctrl.itemConfig ).toEqual({ 'recurring-day-of-month': '02' });
    } );
  } );

  describe( 'initializeParams', () => {
    beforeEach( () => {
      spyOn( $ctrl, 'changeFrequency' );
      spyOn( $ctrl.modalStateService, 'name' );
      $ctrl.productData = {
        frequencies: [
          {name: 'NA', selectAction: '/a'},
          {name: 'MON', selectAction: '/b'},
          {name: 'QUARTERLY', selectAction: '/c'}
        ]
      };
      $ctrl.itemConfig = {};
      $ctrl.isEdit = false;
    } );

    it('should do nothing if in edit mode', () => {
      $ctrl.isEdit = true;
      $ctrl.initializeParams();
      expect( $ctrl.$location.search ).not.toHaveBeenCalled();
    });

    it( 'sets all values from query params', () => {
      $ctrl.$location.search.and.returnValue( {
        [giveGiftParams.designation]: '0123456',
        [giveGiftParams.amount]:      '150',
        [giveGiftParams.frequency]:   'QUARTERLY',
        [giveGiftParams.day]:         '21'
      } );
      $ctrl.initializeParams();
      expect( $ctrl.modalStateService.name ).toHaveBeenCalledWith( 'give-gift' );
      expect( $ctrl.$location.search ).toHaveBeenCalled();
      expect( $ctrl.itemConfig.amount ).toEqual( 150 );
      expect( $ctrl.changeFrequency ).toHaveBeenCalled();
      expect( $ctrl.itemConfig['recurring-day-of-month'] ).toEqual( '21' );
    } );

    it( 'doesn\'t set missing values', () => {
      $ctrl.$location.search.and.returnValue( {} );
      $ctrl.initializeParams();
      expect( $ctrl.modalStateService.name ).toHaveBeenCalledWith( 'give-gift' );
      expect( $ctrl.$location.search ).toHaveBeenCalled();
      expect( $ctrl.itemConfig.amount ).toBeUndefined();
      expect( $ctrl.changeFrequency ).not.toHaveBeenCalled();
      expect( $ctrl.itemConfig['recurring-day-of-month'] ).toBeUndefined();
    } );

    it( 'handles unknown frequency', () => {
      $ctrl.$location.search.and.returnValue( {
        [giveGiftParams.frequency]: 'ALWAYS'
      } );
      $ctrl.initializeParams();
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
      $ctrl.initializeParams();
      expect( $ctrl.modalStateService.name ).toHaveBeenCalledWith( 'give-gift' );
      expect( $ctrl.$location.search ).toHaveBeenCalled();
      expect( $ctrl.changeFrequency ).not.toHaveBeenCalled();
    } );

    it( 'sets campaignCode if set in url', () => {
      $ctrl.$location.search.and.returnValue( {
        [giveGiftParams.campaignCode]: 'LEGACY'
      } );
      $ctrl.initializeParams();
      expect( $ctrl.modalStateService.name ).toHaveBeenCalledWith( 'give-gift' );
      expect( $ctrl.$location.search ).toHaveBeenCalled();
      expect( $ctrl.itemConfig['campaign-code'] ).toEqual('LEGACY');
    } );

    it( 'sets campaignCode if multiple are set in url', () => {
      $ctrl.$location.search.and.returnValue( {
        [giveGiftParams.campaignCode]: ['LEGACY', 'LEGACY']
      } );
      $ctrl.initializeParams();
      expect( $ctrl.modalStateService.name ).toHaveBeenCalledWith( 'give-gift' );
      expect( $ctrl.$location.search ).toHaveBeenCalled();
      expect( $ctrl.itemConfig['campaign-code'] ).toEqual('LEGACY');
    } );

    it( 'sets campaignCode if default-campaign-code is set', () => {
      $ctrl.$location.search.and.returnValue( {} );
      $ctrl.itemConfig['default-campaign-code'] = 'DEFAULT';
      $ctrl.initializeParams();
      expect( $ctrl.modalStateService.name ).toHaveBeenCalledWith( 'give-gift' );
      expect( $ctrl.$location.search ).toHaveBeenCalled();
      expect( $ctrl.itemConfig['campaign-code'] ).toEqual('DEFAULT');
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

  describe( 'updateQueryParam', () => {
    it( 'should update the query param if not editing', () => {
      $ctrl.updateQueryParam('param', 'value');
      expect($ctrl.$location.search).toHaveBeenCalledWith('param', 'value');
    } );
    it( 'should not update the query param if editing', () => {
      $ctrl.isEdit = true;
      $ctrl.updateQueryParam('param', 'value');
      expect($ctrl.$location.search).not.toHaveBeenCalled();
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
      spyOn( $ctrl, 'updateQueryParam' );
      $ctrl.productData = { frequency: 'MON' };
      $ctrl.errorAlreadyInCart = true;
      $ctrl.changingFrequency = false;
    } );

    afterEach(() => {
      expect($ctrl.changingFrequency).toEqual(false);
    });

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
      expect( $ctrl.updateQueryParam ).toHaveBeenCalledWith( giveGiftParams.frequency, 'NA' );
      expect( $ctrl.errorChangingFrequency).toEqual(false);
      expect( $ctrl.errorAlreadyInCart).toEqual(false);
    } );
    it( 'should handle an error changing frequency', () => {
      $ctrl.designationsService.productLookup.and.returnValue(Observable.throw('some error'));
      $ctrl.changeFrequency( {name: 'NA', selectAction: '/a'} );
      expect( $ctrl.designationsService.productLookup ).toHaveBeenCalledWith( '/a', true );
      expect( $ctrl.itemConfigForm.$setDirty ).not.toHaveBeenCalled();
      expect( $ctrl.productData ).toEqual({ frequency: 'MON' });
      expect( $ctrl.updateQueryParam ).toHaveBeenCalledWith( giveGiftParams.frequency, 'NA' );
      expect( $ctrl.updateQueryParam ).toHaveBeenCalledWith( giveGiftParams.frequency, 'MON' );
      expect( $ctrl.errorChangingFrequency).toEqual(true);
      expect( $ctrl.$log.error.logs[0] ).toEqual(['Error loading new product when changing frequency', 'some error']);
      expect( $ctrl.errorAlreadyInCart).toEqual(false);
    } );
  } );

  describe( 'changeAmount()', () => {
    beforeEach( () => {
      spyOn( $ctrl, 'updateQueryParam' );
      $ctrl.$onInit();
    } );

    it( 'sets itemConfig amount', () => {
      $ctrl.changeAmount( 100 );
      expect( $ctrl.itemConfigForm.$setDirty ).toHaveBeenCalled();
      expect( $ctrl.itemConfig.amount ).toEqual( 100 );
      expect( $ctrl.customAmount ).toBe( '' );
      expect( $ctrl.customInputActive ).toEqual( false );
      expect( $ctrl.updateQueryParam ).toHaveBeenCalledWith( giveGiftParams.amount, 100 );
    } );
  } );

  describe( 'changeCustomAmount()', () => {
    it( 'sets itemConfig amount', () => {
      spyOn( $ctrl, 'updateQueryParam' );
      $ctrl.itemConfig = {};
      $ctrl.changeCustomAmount( 300 );
      expect( $ctrl.itemConfig.amount ).toEqual( 300 );
      expect( $ctrl.customAmount ).toEqual( 300 );
      expect( $ctrl.customInputActive ).toEqual( true );
      expect( $ctrl.updateQueryParam ).toHaveBeenCalledWith( giveGiftParams.amount, 300 );
    } );
  } );

  describe( 'changeStartDay()', () => {
    beforeEach( () => {
      $ctrl.errorAlreadyInCart = true;
      spyOn( $ctrl, 'updateQueryParam' );
    } );

    it( 'sets day query param', () => {
      $ctrl.changeStartDay( '11' );
      expect( $ctrl.updateQueryParam ).toHaveBeenCalledWith( giveGiftParams.day, '11' );
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

    describe( 'isEdit = true', () => {
      testSaving(true);
    } );
    describe( 'isEdit = false', () => {
      testSaving(false);
    } );

    function expectCloseDismiss(isEdit){
      if(isEdit){
        expect( $ctrl.close ).toHaveBeenCalled();
        expect( $ctrl.dismiss ).not.toHaveBeenCalled();
      } else {
        expect( $ctrl.dismiss ).toHaveBeenCalled();
        expect( $ctrl.close ).not.toHaveBeenCalled();
      }
    }

    function testSaving(isEdit){
      const operation = isEdit ? 'editItem' : 'addItem';
      const cartEvent = isEdit ? cartUpdatedEvent : giftAddedEvent;
      beforeEach( () => {
        $ctrl.resolve.isEdit = isEdit;
        spyOn( $ctrl.cartService, operation ).and.returnValue( Observable.of( 'save item success' ) );
        $ctrl.resolve.productData.uri = 'items/crugive/<some id>';
        spyOn( $ctrl.$scope, '$emit' );
        $ctrl.$onInit();
      } );

      it( 'should do nothing on invalid form', () => {
        $ctrl.itemConfigForm.$valid = false;
        $ctrl.saveGiftToCart();
        expect( $ctrl.submittingGift ).toEqual( false );
        expect( $ctrl.cartService[operation] ).not.toHaveBeenCalled();
        expect( $ctrl.close ).not.toHaveBeenCalled();
        expect( $ctrl.dismiss ).not.toHaveBeenCalled();
        expect( $ctrl.errorAlreadyInCart).toEqual(false);
        expect( $ctrl.errorSavingGeneric).toEqual(false);
      } );

      it( 'should still submit the gift if the form is not dirty', () => {
        $ctrl.saveGiftToCart();
        expect( $ctrl.submittingGift ).toEqual( false );
        expect( $ctrl.cartService[operation] ).toHaveBeenCalledWith(...[ 'uri',  'items/crugive/<some id>', {
          amount:                   85,
          'recurring-day-of-month': '01'
        } ].slice(isEdit ? 0 : 1));
        expect( $ctrl.$scope.$emit ).toHaveBeenCalledWith( cartEvent );
        expectCloseDismiss(isEdit);
        expect( $ctrl.errorAlreadyInCart).toEqual(false);
        expect( $ctrl.errorSavingGeneric).toEqual(false);
      } );

      it( 'should submit a gift successfully', () => {
        $ctrl.itemConfigForm.$dirty = true;
        $ctrl.saveGiftToCart();
        expect( $ctrl.submittingGift ).toEqual( false );
        expect( $ctrl.cartService[operation] ).toHaveBeenCalledWith(...[ 'uri', 'items/crugive/<some id>', {
          amount:                   85,
          'recurring-day-of-month': '01'
        } ].slice(isEdit ? 0 : 1));
        expect( $ctrl.$scope.$emit ).toHaveBeenCalledWith( cartEvent );
        expectCloseDismiss(isEdit);
        expect( $ctrl.errorAlreadyInCart).toEqual(false);
        expect( $ctrl.errorSavingGeneric).toEqual(false);
      } );

      it( 'should submit a gift successfully and omit recurring-day-of-month if frequency is single', () => {
        $ctrl.itemConfigForm.$dirty = true;
        $ctrl.productData.frequency = 'NA';
        $ctrl.saveGiftToCart();
        expect( $ctrl.submittingGift ).toEqual( false );
        expect( $ctrl.cartService[operation] ).toHaveBeenCalledWith(...[ 'uri', 'items/crugive/<some id>', {amount: 85} ].slice(isEdit ? 0 : 1));
        expect( $ctrl.$scope.$emit ).toHaveBeenCalledWith( cartEvent );
        expectCloseDismiss(isEdit);
        expect( $ctrl.errorAlreadyInCart).toEqual(false);
        expect( $ctrl.errorSavingGeneric).toEqual(false);
      } );

      it( 'should handle an error submitting a gift', () => {
        $ctrl.cartService[operation].and.returnValue( Observable.throw( 'some error' ) );
        $ctrl.itemConfigForm.$dirty = true;
        $ctrl.saveGiftToCart();
        expect( $ctrl.submittingGift ).toEqual( false );
        expect( $ctrl.cartService[operation] ).toHaveBeenCalledWith(...[ 'uri', 'items/crugive/<some id>', {
          amount:                   85,
          'recurring-day-of-month': '01'
        } ].slice(isEdit ? 0 : 1));
        expect( $ctrl.close ).not.toHaveBeenCalled();
        expect( $ctrl.dismiss ).not.toHaveBeenCalled();
        expect( $ctrl.errorAlreadyInCart).toEqual(false);
        expect( $ctrl.errorSavingGeneric).toEqual(true);
        expect( $ctrl.$log.error.logs[0]).toEqual(['Error adding or updating item in cart', 'some error' ]);
      } );

      it( 'should handle an error when saving a duplicate item', () => {
        $ctrl.cartService[operation].and.returnValue( Observable.throw( { data: 'Recurring gift to designation: 0671540 on draw day: 14 is already in the cart' } ) );
        $ctrl.itemConfigForm.$dirty = true;
        $ctrl.saveGiftToCart();
        expect( $ctrl.submittingGift ).toEqual( false );
        expect( $ctrl.cartService[operation] ).toHaveBeenCalledWith(...[ 'uri', 'items/crugive/<some id>', {
          amount:                   85,
          'recurring-day-of-month': '01'
        } ].slice(isEdit ? 0 : 1));
        expect( $ctrl.dismiss ).not.toHaveBeenCalled();
        expect( $ctrl.close ).not.toHaveBeenCalled();
        expect( $ctrl.errorAlreadyInCart).toEqual(true);
        expect( $ctrl.errorSavingGeneric).toEqual(false);
      } );
    }
  } );

  describe('displayId()', () => {
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

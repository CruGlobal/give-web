import angular from 'angular';
import 'angular-mocks';
import module from './productConfig.modal.component';
import {giveGiftParams} from '../giveGiftParams';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

describe( 'product config modal', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl;

  beforeEach( inject( function ( $componentController ) {
    $ctrl = $componentController( module.name,
      {
        $location: jasmine.createSpyObj( '$location', ['search'] ),
        $window: {
          location: '/cart.html',
          innerWidth: 450
        },
        modalStateService: jasmine.createSpyObj( 'modalStateService', ['name'] )
      },
      {
        resolve: {
          code: '1234567',
          itemConfig: {
            amount: 85
          },
          isEdit: false,
          uri: 'uri'
        },
        close: jasmine.createSpy('close'),
        dismiss: jasmine.createSpy('dismiss')
      } );

    $ctrl.$location.search.and.returnValue( {} );
  } ) );

  describe( '$onInit', () => {
    it( 'should call the initialization functions', () => {
      spyOn( $ctrl, 'initModalData' );
      spyOn( $ctrl, 'initializeParams' );
      $ctrl.$onInit();
      expect( $ctrl.initModalData ).toHaveBeenCalled();
      expect( $ctrl.initializeParams ).toHaveBeenCalled();
      expect( $ctrl.isMobile ).toEqual(true);
    } );
  } );

  describe( '$onDestroy', () => {
    it( 'should remove the query params', () => {
      $ctrl.$onDestroy();
      expect($ctrl.modalStateService.name).toHaveBeenCalledWith(null);
      expect($ctrl.$location.search).toHaveBeenCalledWith('d', null);
      expect($ctrl.$location.search).toHaveBeenCalledWith('c', null);
      expect($ctrl.$location.search).toHaveBeenCalledWith('a', null);
      expect($ctrl.$location.search).toHaveBeenCalledWith('f', null);
      expect($ctrl.$location.search).toHaveBeenCalledWith('dd', null);
      expect($ctrl.$location.search).not.toHaveBeenCalledWith('CampaignCode', null);
    } );
  } );

  describe( 'initModalData', () => {
    it( 'should use the resolve input to initialize the data used by the modal', () => {
      $ctrl.initModalData();
      expect( $ctrl.code ).toEqual('1234567');
      expect( $ctrl.itemConfig ).toEqual({ amount: 85 });
      expect( $ctrl.isEdit ).toEqual(false);
      expect( $ctrl.uri ).toEqual('uri');
    } );
  } );

  describe( 'initializeParams', () => {
    beforeEach( () => {
      spyOn($ctrl, 'updateQueryParam');
      $ctrl.itemConfig = {};
    } );

    it('should do nothing if in edit mode', () => {
      $ctrl.isEdit = true;
      $ctrl.initializeParams();
      expect( $ctrl.modalStateService.name ).not.toHaveBeenCalled();
      expect( $ctrl.updateQueryParam ).not.toHaveBeenCalled();
    });

    it('should add query params for the newly opened modal', () => {
      $ctrl.code = '7654321';
      $ctrl.itemConfig['campaign-page'] = 'campaign page';
      $ctrl.initializeParams();
      expect( $ctrl.modalStateService.name ).toHaveBeenCalledWith( 'give-gift' );
      expect( $ctrl.updateQueryParam ).toHaveBeenCalledWith( 'd', '7654321' );
      expect( $ctrl.updateQueryParam ).toHaveBeenCalledWith( 'c', 'campaign page' );
    });

    it( 'sets load configuration values from query params', () => {
      $ctrl.$location.search.and.returnValue( {
        [giveGiftParams.designation]:   '0123456',
        [giveGiftParams.amount]:        '150',
        [giveGiftParams.frequency]:     'QUARTERLY',
        [giveGiftParams.day]:           '21',
        [giveGiftParams.month]:         '07',
        [giveGiftParams.campaignPage]:  'testCampaign'
      } );
      $ctrl.initializeParams();
      expect( $ctrl.$location.search ).toHaveBeenCalled();
      expect( $ctrl.itemConfig.amount ).toEqual( '150' );
      expect( $ctrl.defaultFrequency ).toEqual( 'QUARTERLY' );
      expect( $ctrl.itemConfig['recurring-day-of-month'] ).toEqual( '21' );
      expect( $ctrl.itemConfig['recurring-start-month'] ).toEqual( '07' );
      expect( $ctrl.itemConfig['campaign-page'] ).toEqual( 'testCampaign' );
    } );

    it( 'doesn\'t set missing values', () => {
      $ctrl.$location.search.and.returnValue( {} );
      $ctrl.initializeParams();
      expect( $ctrl.modalStateService.name ).toHaveBeenCalledWith( 'give-gift' );
      expect( $ctrl.$location.search ).toHaveBeenCalled();
      expect( $ctrl.itemConfig.amount ).toBeUndefined();
      expect( $ctrl.defaultFrequency ).toBeUndefined();
      expect( $ctrl.itemConfig['recurring-day-of-month'] ).toBeUndefined();
      expect( $ctrl.itemConfig['campaign-page'] ).toBeUndefined();
    } );

    it( 'sets campaignCode if set in url', () => {
      $ctrl.$location.search.and.returnValue( {
        [giveGiftParams.campaignCode]: 'LEGACY'
      } );
      $ctrl.initializeParams();
      expect( $ctrl.itemConfig['campaign-code'] ).toEqual('LEGACY');
    } );

    it( 'sets campaignCode if multiple are set in url', () => {
      $ctrl.$location.search.and.returnValue( {
        [giveGiftParams.campaignCode]: ['LEGACY', 'LEGACY']
      } );
      $ctrl.initializeParams();
      expect( $ctrl.itemConfig['campaign-code'] ).toEqual('LEGACY');
    } );

    it( 'sets campaignCode if default-campaign-code is set', () => {
      $ctrl.$location.search.and.returnValue( {} );
      $ctrl.itemConfig['default-campaign-code'] = 'DEFAULT';
      $ctrl.initializeParams();
      expect( $ctrl.itemConfig['campaign-code'] ).toEqual('DEFAULT');
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

  describe( 'onStateChange', () => {
    it( 'should set state and submit flag', () => {
      $ctrl.onStateChange('newState');
      expect($ctrl.state).toEqual('newState');
      expect($ctrl.submitted).toEqual(false);
    } );
    it( 'should close modal if state is submitted', () => {
      $ctrl.onStateChange('submitted');
      expect($ctrl.close).toHaveBeenCalled();
      expect( $ctrl.$window.location ).toContain( 'cart.html' );
    } );
  } );
} );

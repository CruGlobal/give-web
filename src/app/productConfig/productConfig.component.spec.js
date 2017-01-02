import angular from 'angular';
import 'angular-mocks';
import module from './productConfig.component';
import modalStateModule from 'common/services/modalState.service';
import {giveGiftParams} from './productConfigModal/productConfig.modal.component';

describe( 'productConfig', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl;

  beforeEach( inject( function ( _$componentController_ ) {
    $ctrl = _$componentController_( module.name, {$window: {location: ''}}, {productCode: '0123456', campaignCode: 'test123'} );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
  } );

  describe( '$onInit()', () => {
    it( 'initializes the component', () => {
      $ctrl.$onInit();
      expect( $ctrl.loadingModal ).toEqual( false );
    } );
  } );

  describe( 'configModal()', () => {
    let productModalService, $rootScope, renderDeferred, resultDeferred;

    beforeEach( inject( function ( _productModalService_, _$q_, _$rootScope_ ) {
      productModalService = _productModalService_;
      $rootScope = _$rootScope_;
      spyOn( productModalService, 'configureProduct' ).and.callFake( () => {
        renderDeferred = _$q_.defer();
        resultDeferred = _$q_.defer();
        return {
          rendered: renderDeferred.promise,
          result:   resultDeferred.promise
        };
      } );
    } ) );

    it( 'opens productConfig modal', () => {
      $ctrl.configModal();
      expect( productModalService.configureProduct ).toHaveBeenCalledWith( '0123456', {amount: 50, 'campaign-code': 'test123'}, false );
    } );

    it( 'updates after modal rendered', () => {
      $ctrl.configModal();
      expect( $ctrl.loadingModal ).toEqual( true );
      renderDeferred.resolve();
      $rootScope.$digest();
      expect( $ctrl.loadingModal ).toEqual( false );
    } );

    it( 'redirects to cart.html', () => {
      $ctrl.configModal();
      expect( $ctrl.$window.location ).toEqual( '' );
      resultDeferred.resolve();
      $rootScope.$digest();
      expect( $ctrl.$window.location ).toEqual( '/cart.html' );
    } );

    it( 'should disable loading indicator on dismiss', () => {
      $ctrl.configModal();
      resultDeferred.reject();
      $rootScope.$digest();
      expect( $ctrl.loadingModal ).toEqual( false );
    } );

    it( 'should handle an error loading necessary data', () => {
      $ctrl.configModal();
      resultDeferred.reject('some error');
      $rootScope.$digest();
      expect( $ctrl.error ).toEqual( true );
      expect( $ctrl.loadingModal ).toEqual( false );
      expect( $ctrl.$log.error.logs[0] ).toEqual( ['Error opening product config modal', 'some error'] );
    } );

    it( 'should not throw an error when the modal gets dismissed normally', () => {
      $ctrl.configModal();
      resultDeferred.reject();
      $rootScope.$digest();
      expect( $ctrl.error ).toEqual( false );
      expect( $ctrl.loadingModal ).toEqual( false );
      expect( $ctrl.$log.error.logs[0] ).toBeUndefined();
    } );

    it( 'should not throw an error when the modal gets dismissed by an escape key press', () => {
      $ctrl.configModal();
      resultDeferred.reject('escape key press');
      $rootScope.$digest();
      expect( $ctrl.error ).toEqual( false );
      expect( $ctrl.loadingModal ).toEqual( false );
      expect( $ctrl.$log.error.logs[0] ).toBeUndefined();
    } );

    it( 'should not throw an error when the modal gets dismissed by a background click', () => {
      $ctrl.configModal();
      resultDeferred.reject('backdrop click');
      $rootScope.$digest();
      expect( $ctrl.error ).toEqual( false );
      expect( $ctrl.loadingModal ).toEqual( false );
      expect( $ctrl.$log.error.logs[0] ).toBeUndefined();
    } );
  } );
} );

describe( 'productConfig module config', () => {
  let modalStateServiceProvider;

  beforeEach( () => {
    angular.mock.module( modalStateModule.name, function ( _modalStateServiceProvider_ ) {
      modalStateServiceProvider = _modalStateServiceProvider_;
      spyOn( modalStateServiceProvider, 'registerModal' );
    } );
    angular.mock.module( module.name );
  } );

  it( 'config to register \'give-gift\' modal', inject( function () {
    expect( modalStateServiceProvider.registerModal ).toHaveBeenCalledWith( 'give-gift', jasmine.any( Function ) );
  } ) );

  describe( 'invoke \'give-gift\' modal function', () => {
    let productModalService, $injector, $location;

    beforeEach( inject( function ( _productModalService_, _$injector_, _$location_ ) {
      productModalService = _productModalService_;
      $injector = _$injector_;
      $location = _$location_;
      spyOn( productModalService, 'configureProduct' );
      spyOn( $location, 'search' ).and.returnValue( {[giveGiftParams.designation]: '0123456'} );
    } ) );

    it( 'calls productModalService.configureProduct()', () => {
      let fn = modalStateServiceProvider.registerModal.calls.mostRecent().args[1];
      $injector.invoke( fn, {}, {$location: $location, productModalService: productModalService} );
      expect( $location.search ).toHaveBeenCalled();
      expect( productModalService.configureProduct ).toHaveBeenCalled();
    } );
  } );
} );

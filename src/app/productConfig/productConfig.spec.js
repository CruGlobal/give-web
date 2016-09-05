import angular from 'angular';
import 'angular-mocks';
import module from './productConfig.component';
import modalStateModule from 'common/services/modalState.service';
import {giveGiftParams} from 'app/productConfig/productConfig.modal';

describe( 'productConfig', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl;

  beforeEach( inject( function ( _$componentController_ ) {
    $ctrl = _$componentController_( module.name, {$window: {location: {href: ''}}}, {productCode: '0123456'} );
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
        }
      } )
    } ) );

    it( 'opens productConfig modal', () => {
      $ctrl.configModal();
      expect( productModalService.configureProduct ).toHaveBeenCalledWith( '0123456', {amount: 50}, false );
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
      expect( $ctrl.$window.location.href ).toEqual( '' );
      resultDeferred.resolve();
      $rootScope.$digest();
      expect( $ctrl.$window.location.href ).toEqual( 'cart.html' );
    } )
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

import angular from 'angular';
import 'angular-mocks';
import module from './productConfig.component';
import modalStateModule from 'common/services/modalState.service';
import {giveGiftParams} from './giveGiftParams';

describe( 'productConfig', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl;

  beforeEach( inject( function ( _$componentController_ ) {
    $ctrl = _$componentController_( module.name, {$window: {location: ''}}, {productCode: '0123456', campaignCode: 'test123'} );
  } ) );

  describe( 'configModal()', () => {
    let productModalService, renderDeferred, resultDeferred;

    beforeEach( inject( function ( _productModalService_, _$q_ ) {
      productModalService = _productModalService_;
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
      expect( productModalService.configureProduct ).toHaveBeenCalledWith( '0123456', {'campaign-code': 'test123', 'campaign-page': undefined}, false );
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

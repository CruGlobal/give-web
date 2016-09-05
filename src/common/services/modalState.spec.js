import angular from 'angular';
import 'angular-mocks';
import module from './modalState.service';

describe( 'modalStateServiceProvider', () => {
  beforeEach( angular.mock.module( module.name ) );
  let modalStateServiceProvider;

  beforeEach( () => {
    angular.mock.module( function ( _modalStateServiceProvider_ ) {
      modalStateServiceProvider = _modalStateServiceProvider_;
      modalStateServiceProvider.registerModal( 'test-modal', angular.noop );
    } );
  } );

  it( 'to be defined', inject( function () {
    expect( modalStateServiceProvider ).toBeDefined();
    expect( modalStateServiceProvider.registerModal ).toBeDefined();
  } ) );

  describe( 'modalStateService.invokeModal()', () => {
    let modalStateService, $injector;

    beforeEach( inject( function ( _modalStateService_, _$injector_ ) {
      $injector = _$injector_;
      modalStateService = _modalStateService_;
      spyOn( $injector, 'invoke' );
    } ) );

    it( 'invokes registered modal', () => {
      modalStateService.invokeModal( 'test-modal' );
      expect( $injector.invoke ).toHaveBeenCalledWith( jasmine.any( Function ) );
    } );

    it( 'does not invoke unknown modal', () => {
      modalStateService.invokeModal( 'unknown' );
      expect( $injector.invoke ).not.toHaveBeenCalled();
    } );
  } );
} );

describe( 'modalStateService', () => {
  beforeEach( angular.mock.module( module.name ) );
  let modalStateService, $rootScope, $location;

  beforeEach( inject( function ( _modalStateService_, _$rootScope_, _$location_ ) {
    modalStateService = _modalStateService_;
    $rootScope = _$rootScope_;
    $location = _$location_;
  } ) );

  it( 'to be defined', () => {
    expect( modalStateService ).toBeDefined();
  } );

  describe( 'setName', () => {
    beforeEach( () => {
      spyOn( $location, 'hash' );
    } );

    it( 'sets $location hash', () => {
      modalStateService.setName( 'test-modal' );
      $rootScope.$digest();
      expect( $location.hash ).toHaveBeenCalledWith( 'test-modal' );
    } );

    it( 'allows undefined', () => {
      modalStateService.setName();
      $rootScope.$digest();
      expect( $location.hash ).toHaveBeenCalledWith( '' );
    } );
  } );
} );
